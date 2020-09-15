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

import { cloneDeep } from 'lodash';
import { mapKeysDeep, toCamel, toSnake } from '../../utils/helpers';
import { TASK_STATE } from '../../../public/utils/constants';
import { TaskListItem, Task } from 'public/models/interfaces';

export const convertTaskKeysToSnakeCase = (payload: any) => {
  return {
    ...mapKeysDeep(payload, toSnake),
  };
};

export const convertTaskKeysToCamelCase = (response: any) => {
  const obj = { ...mapKeysDeep({ response }, toCamel) };
  //@ts-ignore
  return obj.response;
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
