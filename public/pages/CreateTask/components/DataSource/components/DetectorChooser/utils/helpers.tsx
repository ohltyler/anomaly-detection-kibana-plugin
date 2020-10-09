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

import { get } from 'lodash';
import {
  TaskFormikValues,
  INITIAL_TASK_VALUES,
} from '../../../../../utils/constants';
import { FormikProps } from 'formik';
import { Detector } from '../../../../../../../models/interfaces';
import { generateInitialFeatures } from '../../../../../../EditFeatures/utils/helpers';

export function populateDetectorFieldsFromDetector(
  formikProps: FormikProps<TaskFormikValues>,
  detector: Detector
) {
  formikProps.setFieldValue('index', [{ label: detector.indices[0] }]);
  formikProps.setFieldValue('timeField', detector.timeField);
  formikProps.setFieldValue('featureList', generateInitialFeatures(detector));
  formikProps.setFieldValue(
    'detectionInterval',
    get(detector, 'detectionInterval.period.interval')
  );
}

export function populateDetectorFieldsToInitialValues(
  formikProps: FormikProps<TaskFormikValues>
) {
  formikProps.setFieldValue('index', INITIAL_TASK_VALUES.index);
  formikProps.setFieldValue('timeField', INITIAL_TASK_VALUES.timeField);
  formikProps.setFieldValue('featureList', INITIAL_TASK_VALUES.featureList);
  formikProps.setFieldValue(
    'detectionInterval',
    INITIAL_TASK_VALUES.detectionInterval
  );
}

export function untouchDetectorFields(
  formikProps: FormikProps<TaskFormikValues>
) {
  formikProps.setFieldTouched('index', false);
  formikProps.setFieldTouched('timeField', false);
  formikProps.setFieldTouched('featureList', false);
  formikProps.setFieldTouched('detectionInterval', false);
}
