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
  EuiFlexItem,
  EuiFlexGroup,
  EuiSpacer,
  EuiComboBox,
  EuiRadioGroup,
} from '@elastic/eui';
import { FormikProps } from 'formik';
import { debounce, get } from 'lodash';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../../../redux/reducers';
import { getDetectorList } from '../../../../../../redux/reducers/ad';
import { getMappings } from '../../../../../../redux/reducers/elasticsearch';
import { GET_ALL_DETECTORS_QUERY_PARAMS } from '../../../../../utils/constants';
import { searchDetector } from '../../../../../../redux/reducers/ad';
import { FormattedFormRow } from '../../../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import { HistoricalDetectorFormikValues } from '../../../../utils/constants';
import { CREATE_HISTORICAL_DETECTOR_OPTIONS } from '../../../../utils/constants';
import { sanitizeSearchText } from '../../../../../utils/helpers';
import {
  populateDetectorFieldsFromDetector,
  populateDetectorFieldsToInitialValues,
  untouchDetectorFields,
} from './utils/helpers';

interface ExistingDetectorsProps {
  formikProps: FormikProps<HistoricalDetectorFormikValues>;
}

export function ExistingDetectors(props: ExistingDetectorsProps) {
  const dispatch = useDispatch();
  const adState = useSelector((state: AppState) => state.ad);
  const detectorItems = adState.detectorList;
  const detectors = adState.detectors;
  const [queryText, setQueryText] = useState('');
  const [selectedDetectorId, setSelectedDetectorId] = useState<string>('');
  const selectedDetector = detectors[selectedDetectorId];
  const [
    createDetectorSelection,
    setCreateDetectorSelection,
  ] = useState<CREATE_HISTORICAL_DETECTOR_OPTIONS>(
    CREATE_HISTORICAL_DETECTOR_OPTIONS.CREATE_NEW
  );

  const existingDetectorsOptions = [
    {
      id: CREATE_HISTORICAL_DETECTOR_OPTIONS.CREATE_NEW,
      label: 'No',
    },
    {
      id: CREATE_HISTORICAL_DETECTOR_OPTIONS.USE_EXISTING,
      label: 'Yes',
    },
  ];

  // Getting all detectors initially
  useEffect(() => {
    const getInitialDetectors = async () => {
      dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
    };
    getInitialDetectors();
  }, []);

  // Update the form if a change in selected detector, and get index mappings
  useEffect(() => {
    if (selectedDetector) {
      populateDetectorFieldsFromDetector(props.formikProps, selectedDetector);
      const indexName = selectedDetector.indices[0];
      dispatch(getMappings(indexName));
    } else {
      populateDetectorFieldsToInitialValues(props.formikProps);
    }
  }, [selectedDetector]);

  const getDetectorInfo = (detectorId: string) => {
    if (detectorId && detectorItems && detectorItems[detectorId]) {
      dispatch(
        searchDetector({
          query: { term: { 'name.keyword': detectorItems[detectorId].name } },
        })
      );
    }
  };

  const handleSearchChange = debounce(async (searchValue: string) => {
    if (searchValue !== queryText) {
      const sanitizedQuery = sanitizeSearchText(searchValue);
      setQueryText(sanitizedQuery);
      const searchRequest = {
        ...GET_ALL_DETECTORS_QUERY_PARAMS,
        search: sanitizedQuery,
      };
      dispatch(getDetectorList(searchRequest));
    }
  }, 300);

  const onSelectionChange = (id: string) => {
    setCreateDetectorSelection(id as CREATE_HISTORICAL_DETECTOR_OPTIONS);
    if (id === CREATE_HISTORICAL_DETECTOR_OPTIONS.CREATE_NEW) {
      setSelectedDetectorId('');
    }
    populateDetectorFieldsToInitialValues(props.formikProps);
    untouchDetectorFields(props.formikProps);
  };

  return (
    <EuiFlexGroup direction="column" style={{ margin: '0px' }}>
      <EuiFlexGroup
        direction="row"
        gutterSize="none"
        justifyContent="spaceBetween"
        style={{ maxWidth: '400px' }}
      >
        <EuiFlexItem>
          <FormattedFormRow
            title="Configure using an existing real-time detector"
            hint="Choose if you would like to source an existing real-time or historical detector to use as a template for your configuration."
          >
            <EuiRadioGroup
              name="use existing detectors radio group"
              options={existingDetectorsOptions}
              idSelected={createDetectorSelection}
              onChange={onSelectionChange}
            />
          </FormattedFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      {createDetectorSelection ===
      CREATE_HISTORICAL_DETECTOR_OPTIONS.USE_EXISTING ? (
        <EuiFlexGroup direction="column">
          <EuiFlexItem style={{ maxWidth: '70%' }}>
            <FormattedFormRow
              fullWidth
              title="Source existing detector configuration"
              hint="Choose from an existing real-time or historical detector configuration"
            >
              <EuiComboBox
                id="existingDetectorsComboBox"
                placeholder="Existing detector configurations"
                async
                isLoading={adState.requesting}
                options={Object.values(detectorItems).map((detector) => ({
                  label: detector.name,
                  id: detector.id,
                }))}
                onSearchChange={handleSearchChange}
                onBlur={() => {}}
                onChange={(options) => {
                  const detectorId = get(options, '0.id') as string;
                  setSelectedDetectorId(detectorId);
                  getDetectorInfo(detectorId);
                }}
                selectedOptions={
                  (selectedDetectorId &&
                    detectorItems &&
                    detectorItems[selectedDetectorId] && [
                      { label: detectorItems[selectedDetectorId].name },
                    ]) ||
                  []
                }
                singleSelection={true}
                isClearable={true}
              />
            </FormattedFormRow>
          </EuiFlexItem>
          <EuiSpacer />
        </EuiFlexGroup>
      ) : null}

      {createDetectorSelection ===
        CREATE_HISTORICAL_DETECTOR_OPTIONS.USE_EXISTING &&
      selectedDetector !== undefined ? (
        <EuiSpacer size="l" />
      ) : null}
    </EuiFlexGroup>
  );
}
