/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, { Fragment, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { FormikProps, Formik } from 'formik';
import { get, isEmpty } from 'lodash';
import {
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
} from '@elastic/eui';
import {
  updateDetector,
  matchDetector,
  getDetectorCount,
} from '../../../redux/reducers/ad';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import { useFetchDetectorInfo } from '../hooks/useFetchDetectorInfo';
import { CoreStart } from '../../../../../../src/core/public';
import { APIAction } from '../../../redux/middleware/types';
import { CoreServicesContext } from '../../../components/CoreServices/CoreServices';
import { BREADCRUMBS } from '../../../utils/constants';
import { getErrorMessage, validateDetectorName } from '../../../utils/utils';
import { DetectorInfo } from '../components/DetectorInfo';
import { DataSource } from './DataSource';
import { Settings } from '../components/Settings';
import { detectorDefinitionToFormik, formikToDetector } from '../utils/helpers';
import { DetectorDefinitionFormikValues } from '../models/interfaces';
import { Detector } from '../../../models/interfaces';
import { prettifyErrorMessage } from '../../../../server/utils/helpers';
import { DETECTOR_STATE } from '../../../../server/utils/constants';

interface DefineDetectorRouterProps {
  detectorId?: string;
}

interface DefineDetectorProps
  extends RouteComponentProps<DefineDetectorRouterProps> {
  isEdit: boolean;
  setStep(stepNumber: number): void;
  handleCancelClick(): void;
  initialValues?: DetectorDefinitionFormikValues;
  setInitialValues?(initialValues: DetectorDefinitionFormikValues): void;
}

export const DefineDetector = (props: DefineDetectorProps) => {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  const dispatch = useDispatch<Dispatch<APIAction>>();
  useHideSideNavBar(true, false);
  const detectorId: string = get(props, 'match.params.detectorId', '');
  const { detector, hasError } = useFetchDetectorInfo(detectorId);

  // Set breadcrumbs based on create / update
  useEffect(() => {
    const createOrEditBreadcrumb = props.isEdit
      ? BREADCRUMBS.EDIT_DETECTOR
      : BREADCRUMBS.CREATE_DETECTOR;
    let breadCrumbs = [
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DETECTORS,
      createOrEditBreadcrumb,
    ];
    if (detector && detector.name) {
      breadCrumbs.splice(2, 0, {
        text: detector.name,
        //@ts-ignore
        href: `#/detectors/${detectorId}`,
      });
    }
    core.chrome.setBreadcrumbs(breadCrumbs);
  });

  // If no detector found with ID, redirect it to list
  useEffect(() => {
    if (props.isEdit && hasError) {
      core.notifications.toasts.addDanger(
        'Unable to find the detector for editing'
      );
      props.history.push(`/detectors`);
    }
  }, [props.isEdit]);

  const handleValidateName = async (detectorName: string) => {
    if (isEmpty(detectorName)) {
      return 'Detector name cannot be empty';
    } else {
      const error = validateDetectorName(detectorName);
      if (error) {
        return error;
      }
      //TODO::Avoid making call if value is same
      const resp = await dispatch(matchDetector(detectorName));
      const match = get(resp, 'response.match', false);
      if (!match) {
        return undefined;
      }
      //If more than one detectors found, duplicate exists.
      if (!props.isEdit && match) {
        return 'Duplicate detector name';
      }
      // if it is in edit mode
      if (props.isEdit && detectorName !== detector?.name) {
        return 'Duplicate detector name';
      }
    }
  };

  const handleFormValidation = async (
    formikProps: FormikProps<DetectorDefinitionFormikValues>
  ) => {
    try {
      if (props.isEdit && detector.curState === DETECTOR_STATE.RUNNING) {
        core.notifications.toasts.addDanger(
          'Detector cannot be updated while it is running'
        );
      } else {
        formikProps.setSubmitting(true);
        formikProps.setFieldTouched('name');
        formikProps.setFieldTouched('description');
        formikProps.setFieldTouched('index');
        formikProps.setFieldTouched('filters');
        formikProps.setFieldTouched('timeField');
        formikProps.setFieldTouched('interval');
        formikProps.setFieldTouched('windowDelay');
        formikProps.validateForm().then((errors) => {
          if (isEmpty(errors)) {
            if (props.isEdit) {
              const apiRequest = formikToDetector(formikProps.values, detector);
              handleUpdate(apiRequest);
            } else {
              optionallySaveValues(formikProps.values);
              props.setStep(2);
            }
          } else {
            // TODO: can add focus to all components or possibly customize error message too
            core.notifications.toasts.addDanger(
              'One or more input fields is invalid'
            );
          }
        });
      }
    } catch (e) {
    } finally {
      formikProps.setSubmitting(false);
    }
  };

  const handleUpdate = async (detectorToBeUpdated: Detector) => {
    try {
      await dispatch(updateDetector(detectorId, detectorToBeUpdated));
      core.notifications.toasts.addSuccess(
        `Detector updated: ${detectorToBeUpdated.name}`
      );
      props.history.push(`/detectors/${detectorId}/configurations/`);
    } catch (err) {
      core.notifications.toasts.addDanger(
        prettifyErrorMessage(
          getErrorMessage(err, 'There was a problem updating the detector')
        )
      );
    }
  };

  const handleSubmit = async (
    values: DetectorDefinitionFormikValues,
    formikProps: any
  ) => {
    try {
      if (props.isEdit) {
        // TODO: submit the update here
      }
    } catch (e) {
    } finally {
      formikProps.setSubmitting(false);
    }
  };

  const optionallySaveValues = (values: DetectorDefinitionFormikValues) => {
    if (props.setInitialValues) {
      props.setInitialValues(values);
    }
  };

  return (
    <Formik
      initialValues={
        props.initialValues
          ? props.initialValues
          : detectorDefinitionToFormik(detector)
      }
      onSubmit={handleSubmit}
      validateOnMount={props.isEdit ? false : true}
    >
      {(formikProps) => (
        <React.Fragment>
          <EuiPage
            style={{
              marginTop: '-24px',
            }}
          >
            <EuiPageBody>
              <EuiPageHeader>
                <EuiPageHeaderSection>
                  <EuiTitle size="l">
                    <h1>
                      {props.isEdit ? 'Edit detector' : 'Define detector'}{' '}
                    </h1>
                  </EuiTitle>
                </EuiPageHeaderSection>
              </EuiPageHeader>
              <Fragment>
                <DetectorInfo onValidateDetectorName={handleValidateName} />
                <EuiSpacer />
                <DataSource
                  formikProps={formikProps}
                  origIndex={
                    props.isEdit ? get(detector, 'indices.0', '') : null
                  }
                  isEdit={props.isEdit}
                />
                <EuiSpacer />
                <Settings />
              </Fragment>
            </EuiPageBody>
          </EuiPage>

          <EuiSpacer size="xs" />
          <EuiFlexGroup
            alignItems="center"
            justifyContent="flexEnd"
            gutterSize="s"
            style={{ marginRight: '12px' }}
          >
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={props.handleCancelClick}>
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                type="submit"
                iconSide="right"
                iconType="arrowRight"
                fill={true}
                data-test-subj="defineDetectorNextButton"
                isLoading={formikProps.isSubmitting}
                //@ts-ignore
                onClick={() => {
                  handleFormValidation(formikProps);
                }}
              >
                Next
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </React.Fragment>
      )}
    </Formik>
  );
};