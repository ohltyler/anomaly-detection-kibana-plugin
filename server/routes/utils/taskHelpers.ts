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

import { get, cloneDeep, omit } from 'lodash';
import { mapKeysDeep, toCamel, toSnake } from '../../utils/helpers';
import { TASK_STATE } from '../../../public/utils/constants';
import { TaskListItem, Task } from 'public/models/interfaces';

export const convertTaskKeysToSnakeCase = (payload: any) => {
  return {
    ...mapKeysDeep(
      {
        ...omit(payload, ['filterQuery', 'featureAttributes']), // Exclude the filterQuery,
      },
      toSnake
    ),
    filter_query: get(payload, 'filterQuery', {}),
    ui_metadata: get(payload, 'uiMetadata', {}),
    feature_attributes: get(payload, 'featureAttributes', []).map(
      (feature: any) => ({
        ...mapKeysDeep({ ...omit(feature, ['aggregationQuery']) }, toSnake),
        aggregation_query: feature.aggregationQuery,
      })
    ),
  };
};

export const convertTaskKeysToCamelCase = (response: any) => {
  return {
    ...mapKeysDeep(
      omit(response, [
        'filter_query',
        'ui_metadata',
        'feature_query',
        'feature_attributes',
      ]),
      toCamel
    ),
    filterQuery: get(response, 'filter_query', {}),
    featureAttributes: get(response, 'feature_attributes', []).map(
      (feature: any) => ({
        ...mapKeysDeep({ ...omit(feature, ['aggregation_query']) }, toCamel),
        aggregationQuery: feature.aggregation_query,
      })
    ),
    uiMetadata: get(response, 'ui_metadata', {}),
  };
};

export const getFinalStatesFromTaskList = (tasks: {
  [key: string]: TaskListItem;
}) => {
  let taskIds = Object.keys(tasks);
  let finalTasks = cloneDeep(tasks);
  taskIds.forEach((taskId) => {
    //@ts-ignore
    finalTasks[taskId].curState = TASK_STATE[finalTasks[taskId].curState];
  });
  return finalTasks;
};

export const getFinalStateFromTask = (task: Task) => {
  //@ts-ignore
  task.curState = TASK_STATE[task.curState];
  return task;
};
