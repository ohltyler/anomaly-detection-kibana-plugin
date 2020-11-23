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

import queryString from 'querystring';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import { DEFAULT_QUERY_PARAMS } from '../../utils/constants';
import { HISTORICAL_DETECTOR_STATE } from '../../../utils/constants';
// import { TASK_ACTION } from './constants';
// import { HistoricalDetectorListItem } from '../../../models/interfaces';

export const getURLQueryParams = (location: { search: string }): any => {
  const { from, size, search, sortField, sortDirection } = queryString.parse(
    location.search
  ) as { [key: string]: string };
  return {
    // @ts-ignore
    from: isNaN(parseInt(from, 10))
      ? DEFAULT_QUERY_PARAMS.from
      : parseInt(from, 10),
    // @ts-ignore
    size: isNaN(parseInt(size, 10))
      ? DEFAULT_QUERY_PARAMS.size
      : parseInt(size, 10),
    search: typeof search !== 'string' ? DEFAULT_QUERY_PARAMS.search : search,
    sortField: typeof sortField !== 'string' ? 'name' : sortField,
    sortDirection:
      typeof sortDirection !== 'string'
        ? DEFAULT_QUERY_PARAMS.sortDirection
        : (sortDirection as SORT_DIRECTION),
  };
};

export const getHistoricalDetectorStateOptions = () => {
  return Object.values(HISTORICAL_DETECTOR_STATE).map((state) => ({
    label: state,
    text: state,
  }));
};

// export const getTasksForAction = (
//   tasks: TaskListItem[],
//   action: TASK_ACTION
// ) => {
//   console.log('tasks passed: ', tasks);
//   switch (action) {
//     case TASK_ACTION.COMPARE: {
//       const tasksForAction = tasks.filter(
//         (task) => task.curState === TASK_STATE.FINISHED
//       );
//       console.log('tasks for action: ', tasksForAction);
//       return tasksForAction;
//     }
//     default:
//       return [];
//   }
// };
