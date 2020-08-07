/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import {
  EuiSpacer,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  EuiFlexItem,
  EuiFlexGroup,
} from '@elastic/eui';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
//@ts-ignore
import chrome from 'ui/chrome';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import { BREADCRUMBS, SAMPLE_TYPE } from '../../../../utils/constants';
import { GET_ALL_DETECTORS_QUERY_PARAMS } from '../../../utils/constants';
import { AppState } from '../../../../redux/reducers';
import { getDetectorList } from '../../../../redux/reducers/ad';
import { createSampleData } from '../../../../redux/reducers/sampleData';

import {
  getIndices,
  createIndex,
} from '../../../../redux/reducers/elasticsearch';
import { createDetector, startDetector } from '../../../../redux/reducers/ad';
import {
  sampleHttpResponses,
  sampleEcommerce,
  sampleHostHealth,
} from '../../utils/constants';
import {
  containsSampleIndex,
  containsSampleDetector,
  getDetectorId,
} from '../../utils/helpers';
import { SampleDataBox } from '../../components/SampleDataBox/SampleDataBox';

export const SampleData = () => {
  const dispatch = useDispatch();
  const visibleIndices = useSelector(
    (state: AppState) => state.elasticsearch.indices
  );
  const allDetectors = Object.values(
    useSelector((state: AppState) => state.ad.detectorList)
  );

  const [isLoadingHttpData, setIsLoadingHttpData] = useState<boolean>(false);
  const [isLoadingEcommerceData, setIsLoadingEcommerceData] = useState<boolean>(
    false
  );
  const [isLoadingHostHealthData, setIsLoadingHostHealthData] = useState<
    boolean
  >(false);

  const getAllDetectors = async () => {
    await dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS)).catch(
      (error: any) => {
        console.error('Error getting all detectors: ', error);
      }
    );
  };

  const getAllIndices = async () => {
    await dispatch(getIndices('')).catch((error: any) => {
      console.error('Error getting all indices: ', error);
    });
  };

  // Set breadcrumbs on page initialization
  useEffect(() => {
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.SAMPLE_DETECTORS,
    ]);
  }, []);

  // Getting all initial detectors
  useEffect(() => {
    getAllDetectors();
    getAllIndices();
  }, []);

  // Create and populate sample index, create and start sample detector
  const handleLoadData = async (
    sampleType: SAMPLE_TYPE,
    indexConfig: any,
    detectorConfig: any,
    setLoadingState: (isLoading: boolean) => void
  ) => {
    setLoadingState(true);
    let errorDuringAction = false;
    let errorMessage = '';

    // Create the index (if it doesn't exist yet)
    if (!containsSampleIndex(visibleIndices, sampleType)) {
      await dispatch(createIndex(indexConfig)).catch((error: any) => {
        errorDuringAction = true;
        errorMessage = 'Error creating sample index.';
        console.error('Error creating sample index: ', error);
      });
    }

    // Get the sample data from the server and bulk insert
    if (!errorDuringAction) {
      await dispatch(createSampleData(sampleType)).catch((error: any) => {
        errorDuringAction = true;
        errorMessage = error;
        console.error('Error creating sample detector: ', error);
      });
    }

    // Create the detector
    if (!errorDuringAction) {
      await dispatch(createDetector(detectorConfig))
        .then(function (response: any) {
          const detectorId = response.data.response.id;
          // Start the detector
          dispatch(startDetector(detectorId)).catch((error: any) => {
            errorDuringAction = true;
            errorMessage = error.data.message;
            console.error('Error starting sample detector: ', error);
          });
        })
        .catch((error: any) => {
          errorDuringAction = true;
          errorMessage = error;
          console.error('Error creating sample detector: ', error);
        });
    }

    getAllDetectors();
    getAllIndices();
    setLoadingState(false);
    if (!errorDuringAction) {
      toastNotifications.addSuccess('Successfully loaded sample detector');
    } else {
      toastNotifications.addDanger(
        `Unable to load all sample data. ${errorMessage}`
      );
    }
  };

  return (
    <Fragment>
      <EuiPageHeader>
        <EuiTitle size="l">
          <h1>Sample detectors</h1>
        </EuiTitle>
      </EuiPageHeader>
      <EuiText>
        Create a detector with streaming sample data to get a deeper
        understanding of how anomaly detection works. These will create and
        initialize a detector with configured settings for your selected sample
        index.
      </EuiText>
      <EuiSpacer size="xl" />
      <EuiFlexGroup direction="row" gutterSize="l">
        <EuiFlexItem>
          <SampleDataBox
            title="Monitor HTTP responses"
            icon={sampleHttpResponses.icon}
            description={sampleHttpResponses.description}
            buttonDescription="Create HTTP response detector"
            onLoadData={() => {
              handleLoadData(
                SAMPLE_TYPE.HTTP_RESPONSES,
                sampleHttpResponses.indexConfig,
                sampleHttpResponses.detectorConfig,
                setIsLoadingHttpData
              );
            }}
            isLoadingData={isLoadingHttpData}
            isDataLoaded={containsSampleDetector(
              allDetectors,
              SAMPLE_TYPE.HTTP_RESPONSES
            )}
            detectorId={getDetectorId(
              allDetectors,
              sampleHttpResponses.detectorName
            )}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <SampleDataBox
            title="Monitor eCommerce orders"
            icon={sampleEcommerce.icon}
            description={sampleEcommerce.description}
            buttonDescription="Create eCommerce orders detector"
            onLoadData={() => {
              handleLoadData(
                SAMPLE_TYPE.ECOMMERCE,
                sampleEcommerce.indexConfig,
                sampleEcommerce.detectorConfig,
                setIsLoadingEcommerceData
              );
            }}
            isLoadingData={isLoadingEcommerceData}
            isDataLoaded={containsSampleDetector(
              allDetectors,
              SAMPLE_TYPE.ECOMMERCE
            )}
            detectorId={getDetectorId(
              allDetectors,
              sampleEcommerce.detectorName
            )}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <SampleDataBox
            title="Monitor health of a host"
            icon={sampleHostHealth.icon}
            description={sampleHostHealth.description}
            buttonDescription="Create health monitor detector"
            onLoadData={() => {
              handleLoadData(
                SAMPLE_TYPE.HOST_HEALTH,
                sampleHostHealth.indexConfig,
                sampleHostHealth.detectorConfig,
                setIsLoadingHostHealthData
              );
            }}
            isLoadingData={isLoadingHostHealthData}
            isDataLoaded={containsSampleDetector(
              allDetectors,
              SAMPLE_TYPE.HOST_HEALTH
            )}
            detectorId={getDetectorId(
              allDetectors,
              sampleHostHealth.detectorName
            )}
          />
        </EuiFlexItem>
        <EuiSpacer size="m" />
      </EuiFlexGroup>
    </Fragment>
  );
};
