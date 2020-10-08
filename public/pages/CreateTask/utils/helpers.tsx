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

import { get, cloneDeep, isEmpty } from 'lodash';
import { Task, UNITS, FEATURE_TYPE } from '../../../models/interfaces';
import { SHINGLE_SIZE } from '../../../utils/constants';
import { TaskFormikValues, INITIAL_TASK_VALUES } from './constants';
import datemath from '@elastic/datemath';
import moment from 'moment';
import {
  FeaturesFormikValues,
  formikToFeatures,
  formikToUIMetadata,
} from '../../EditFeatures/containers/utils/formikToFeatures';

export function formikToTask(values: TaskFormikValues, task: Task): Task {
  let apiRequest = {
    ...task,
    name: values.name,
    description: values.description,
    indices: values.index.map((index) => index.label),
    timeField: values.timeField,
    featureAttributes: formikToFeatures(values.featureList, false),
    uiMetadata: {
      ...task?.uiMetadata,
      features: { ...formikToUIMetadata(values.featureList) },
    },
    detectionInterval: {
      period: { interval: values.detectionInterval, unit: UNITS.MINUTES },
    },
    windowDelay: {
      period: { interval: values.windowDelay, unit: UNITS.MINUTES },
    },
    shingleSize: values.shingleSize,
    dataStartTime: convertTimestampToNumber(values.startTime),
    dataEndTime: convertTimestampToNumber(values.endTime),
  } as Task;

  return apiRequest;
}

export function taskToFormik(task: Task): TaskFormikValues {
  const initialValues = cloneDeep(INITIAL_TASK_VALUES);
  if (isEmpty(task)) {
    return initialValues;
  }
  return {
    ...initialValues,
    name: task.name,
    description: task.description,
    index: [{ label: task.indices[0] }],
    timeField: task.timeField,
    featureList: featuresToFormik(task),
    detectionInterval: get(task, 'detectionInterval.period.interval', 10),
    shingleSize: get(task, 'shingleSize', SHINGLE_SIZE),
    startTime: task.dataStartTime,
    endTime: task.dataEndTime,
  };
}

function featuresToFormik(task: Task): FeaturesFormikValues[] {
  const featureUiMetaData = get(task, 'uiMetadata.features', []);
  const features = get(task, 'featureAttributes', []);
  // @ts-ignore
  return features.map((feature: FeatureAttributes) => {
    return {
      ...featureUiMetaData[feature.featureName],
      ...feature,
      aggregationQuery: JSON.stringify(feature['aggregationQuery'], null, 4),
      aggregationOf: get(
        featureUiMetaData,
        `${feature.featureName}.aggregationOf`
      )
        ? [
            {
              label: get(
                featureUiMetaData,
                `${feature.featureName}.aggregationOf`
              ),
            },
          ]
        : [],
      featureType: get(featureUiMetaData, `${feature.featureName}.featureType`)
        ? get(featureUiMetaData, `${feature.featureName}.featureType`)
        : FEATURE_TYPE.CUSTOM,
    };
  });
}

export function convertTimestampToString(timestamp: number | string) {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return moment(timestamp).format();
}

export function convertTimestampToNumber(timestamp: number | string) {
  if (typeof timestamp === 'string') {
    return datemath.parse(timestamp)?.valueOf();
  }
  return timestamp;
}
