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

import { cloneDeep, isEmpty, get } from 'lodash';
import { Task } from '../../../models/interfaces';
import { TaskFormikValues, INITIAL_TASK_VALUES } from './constants';

export function formikToTask(values: TaskFormikValues, task: Task) {
  let apiRequest = {
    ...task,
    name: values.taskName,
    description: values.taskDescription,
    detectorId: values.detectorId,
    dataStartTime: values.startTime,
    dataEndTime: values.endTime,
  } as Task;

  return apiRequest;
}

export function taskToFormik(task: Task) {
  const initialValues = cloneDeep(INITIAL_TASK_VALUES);
  if (isEmpty(task)) {
    return initialValues;
  }
  return {
    ...initialValues,
    taskName: task.name,
    taskDescription: task.description,
    detectorId: task.detectorId,
    startTime: task.dataStartTime,
    endTime: task.dataEndTime,
  };
}
