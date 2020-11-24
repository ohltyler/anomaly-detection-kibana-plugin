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
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { Formik, FormikProps } from 'formik';
import { get, isEmpty } from 'lodash';
import React, { Fragment, useEffect, useState } from 'react';
import { BREADCRUMBS, DETECTOR_STATE } from '../../../utils/constants';
import { AppState } from '../../../redux/reducers';
import {
  matchDetector,
  updateDetector,
  createDetector,
  startDetector,
  getDetector,
} from '../../../redux/reducers/ad';
import { getMappings } from '../../../redux/reducers/elasticsearch';
import { RouteComponentProps } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import { HistoricalDetectorInfo } from '../components/HistoricalDetectorInfo/HistoricalDetectorInfo';
import { DataSource } from '../components/DataSource/DataSource';
import { Scheduling } from '../components/Scheduling/Scheduling';
import {
  HistoricalDetectorFormikValues,
  SAVE_HISTORICAL_DETECTOR_OPTIONS,
} from '../utils/constants';
import {
  formikToHistoricalDetector,
  historicalDetectorToFormik,
} from '../utils/helpers';
import { focusOnFirstWrongFeature } from '../../EditFeatures/utils/helpers';
import { validateDetectorName } from '../../../utils/utils';
import moment from 'moment';
import { Detector, DateRange } from '../../../models/interfaces';
import { CoreStart } from '../../../../../../src/core/public';
import { CoreServicesContext } from '../../../components/CoreServices/CoreServices';

interface CreateRouterProps {
  detectorId?: string;
}

interface CreateHistoricalDetectorProps
  extends RouteComponentProps<CreateRouterProps> {
  isEdit: boolean;
}

export function CreateHistoricalDetector(props: CreateHistoricalDetectorProps) {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  const dispatch = useDispatch();
  const detectorId: string = get(props, 'match.params.detectorId', '');
  const historicalDetectorsState = useSelector(
    (state: AppState) => state.historicalDetectors
  );
  const detectors = historicalDetectorsState.detectors;
  const detector = detectors[detectorId];
  const errorGettingDetector = historicalDetectorsState.errorMessage;

  const isRequesting = useSelector(
    (state: AppState) => state.historicalDetectors.requesting
  );

  const initialStartDate = moment().subtract(7, 'days').valueOf();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: moment().subtract(7, 'days').valueOf(),
    endDate: moment().valueOf(),
  });
  const [saveDetectorOption, setSaveDetectorOption] = useState<
    SAVE_HISTORICAL_DETECTOR_OPTIONS
  >(SAVE_HISTORICAL_DETECTOR_OPTIONS.KEEP_STOPPED);

  useHideSideNavBar(true, false);

  // Set breadcrumbs based on Create / Update
  useEffect(() => {
    const createOrEditBreadcrumb = props.isEdit
      ? BREADCRUMBS.EDIT_HISTORICAL_DETECTOR
      : BREADCRUMBS.CREATE_HISTORICAL_DETECTOR;
    let breadCrumbs = [
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.HISTORICAL_DETECTORS,
      createOrEditBreadcrumb,
    ];
    if (detector && detector.name) {
      breadCrumbs.splice(2, 0, {
        text: detector.name,
        //@ts-ignore
        href: `#/historical-detectors/${detectorId}/details`,
      });
    }
    core.chrome.setBreadcrumbs(breadCrumbs);
  });
  // If no historical detector found with ID, redirect it to list
  useEffect(() => {
    if (props.isEdit && errorGettingDetector) {
      core.notifications.toasts.addDanger(
        'Unable to find historical detector for editing'
      );
      props.history.push(`/historical-detectors`);
    }
  }, [props.isEdit]);

  // Try to get the historical detector initially
  useEffect(() => {
    const fetchDetector = async (detectorId: string) => {
      dispatch(getDetector(detectorId));
    };
    if (detectorId) {
      fetchDetector(detectorId);
    }
  }, []);

  // Get corresponding index mappings if there is an existing detector
  useEffect(() => {
    const fetchIndexMappings = async (index: string) => {
      dispatch(getMappings(index));
    };
    if (detector?.indices) {
      fetchIndexMappings(detector.indices[0]);
    }
  }, [detector]);

  // Using the detector-specified date range (if it exists)
  useEffect(() => {
    if (detector?.dataStartTime && detector?.dataEndTime) {
      setDateRange({
        startDate: detector.dataStartTime,
        endDate: detector.dataEndTime,
      });
    }
  }, [detector]);

  const handleValidateName = async (detectorName: string) => {
    if (isEmpty(detectorName)) {
      throw 'Detector name cannot be empty';
    } else {
      const error = validateDetectorName(detectorName);
      if (error) {
        throw error;
      }
      //TODO::Avoid making call if value is same
      const resp = await dispatch(matchDetector(detectorName));
      const match = get(resp, 'response.match', false);
      if (!match) {
        return undefined;
      }
      // If more than one detector found: duplicate exists.
      if (!props.isEdit && match) {
        throw 'Duplicate detector name';
      }
      // If it is in edit mode
      if (props.isEdit && detectorName !== detector?.name) {
        throw 'Duplicate detector name';
      }
    }
  };

  const handleValidateDescription = async (detectorDescription: string) => {
    if (detectorDescription.length > 400) {
      throw 'Description should not exceed 400 characters';
    }
    return undefined;
  };

  const handleUpdate = async (
    detectorToUpdate: Detector,
    option: SAVE_HISTORICAL_DETECTOR_OPTIONS
  ) => {
    try {
      await dispatch(updateDetector(detectorId, detectorToUpdate));
      if (option === SAVE_HISTORICAL_DETECTOR_OPTIONS.KEEP_STOPPED) {
        core.notifications.toasts.addSuccess(
          `Historical detector updated: ${detectorToUpdate.name}`
        );
      } else {
        await dispatch(startDetector(detectorId));
        core.notifications.toasts.addSuccess(
          `Historical detector has been started successfully`
        );
      }
      props.history.push(`/historical-detectors/${detectorId}/details/`);
    } catch (err) {
      if (option === SAVE_HISTORICAL_DETECTOR_OPTIONS.KEEP_STOPPED) {
        core.notifications.toasts.addDanger(
          `There was a problem updating the historical detector: ${err}`
        );
      } else {
        core.notifications.toasts.addDanger(
          `There was a problem updating and starting the historical detector: ${err}`
        );
      }
    }
  };

  const handleCreate = async (
    detectorToCreate: Detector,
    option: SAVE_HISTORICAL_DETECTOR_OPTIONS
  ) => {
    try {
      const response = await dispatch(createDetector(detectorToCreate));
      const createdDetectorId = response.response.id;
      if (option === SAVE_HISTORICAL_DETECTOR_OPTIONS.KEEP_STOPPED) {
        core.notifications.toasts.addSuccess(
          `Historical detector created: ${detectorToCreate.name}`
        );
      } else {
        await dispatch(startDetector(createdDetectorId));
        core.notifications.toasts.addSuccess(
          `Historical detector has been started successfully`
        );
      }
      props.history.push(`/historical-detectors/${createdDetectorId}/details/`);
    } catch (err) {
      if (option === SAVE_HISTORICAL_DETECTOR_OPTIONS.KEEP_STOPPED) {
        core.notifications.toasts.addDanger(
          `There was a problem creating the historical detector: ${err}`
        );
      } else {
        core.notifications.toasts.addDanger(
          `There was a problem creating and starting the historical detector: ${err}`
        );
      }
    }
  };

  const handleSubmit = async (
    values: HistoricalDetectorFormikValues,
    formikBag: any
  ) => {
    const apiRequest = formikToHistoricalDetector(values, detector);
    console.log('api request: ', apiRequest);
    try {
      if (props.isEdit) {
        await handleUpdate(apiRequest, saveDetectorOption);
      } else {
        await handleCreate(apiRequest, saveDetectorOption);
      }
      formikBag.setSubmitting(false);
    } catch (e) {
      formikBag.setSubmitting(false);
    }
  };

  const handleFormValidation = (
    formikProps: FormikProps<HistoricalDetectorFormikValues>
  ) => {
    if (props.isEdit && detector.curState === DETECTOR_STATE.RUNNING) {
      core.notifications.toasts.addDanger(
        'Historical detector cannot be updated while it is running'
      );
    } else {
      formikProps.setFieldTouched('name');
      formikProps.setFieldTouched('description');
      formikProps.setFieldTouched('index');
      formikProps.setFieldTouched('timeField');
      formikProps.validateForm();
      if (formikProps.isValid && formikProps.values.rangeValid) {
        if (formikProps.values.featureList.length === 0) {
          core.notifications.toasts.addDanger('No features have been created');
        } else {
          formikProps.setSubmitting(true);
          handleSubmit(formikProps.values, formikProps);
        }
      } else {
        focusOnFirstWrongFeature(
          formikProps.errors,
          formikProps.setFieldTouched
        );
        core.notifications.toasts.addDanger(
          'One or more input fields is invalid'
        );
      }
    }
  };

  const handleCancelClick = () => {
    detectorId
      ? props.history.push(`/historical-detectors/${detectorId}/details`)
      : props.history.push('/historical-detectors');
  };

  const handleSaveDetectorOptionChange = (
    option: SAVE_HISTORICAL_DETECTOR_OPTIONS
  ) => {
    setSaveDetectorOption(option);
  };

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>
                {props.isEdit
                  ? 'Edit historical detector'
                  : 'Create historical detector'}{' '}
              </h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>
        <Formik
          enableReinitialize={true}
          initialValues={historicalDetectorToFormik(detector)}
          onSubmit={handleSubmit}
          isInitialValid={props.isEdit ? true : false}
        >
          {(formikProps) => (
            <Fragment>
              <HistoricalDetectorInfo
                onValidateDetectorName={handleValidateName}
                onValidateDetectorDescription={handleValidateDescription}
              />
              <EuiSpacer />
              <DataSource
                isEdit={props.isEdit}
                detector={detector}
                isLoading={isRequesting}
                formikProps={formikProps}
              />
              <EuiSpacer />
              <Scheduling
                isLoading={isRequesting}
                formikProps={formikProps}
                selectedOption={saveDetectorOption}
                onOptionChange={handleSaveDetectorOptionChange}
              />
              <EuiSpacer />
              <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty onClick={handleCancelClick}>
                    Cancel
                  </EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    fill
                    type="submit"
                    isLoading={formikProps.isSubmitting}
                    //@ts-ignore
                    onClick={() => {
                      handleFormValidation(formikProps);
                    }}
                  >
                    {props.isEdit ? 'Save' : 'Create'}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </Fragment>
          )}
        </Formik>
      </EuiPageBody>
    </EuiPage>
  );
}
