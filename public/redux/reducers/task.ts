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
  APIAction,
  APIResponseAction,
  IHttpService,
  APIErrorAction,
} from '../middleware/types';
import handleActions from '../utils/handleActions';
import { Task, TaskListItem } from '../../models/interfaces';
import { AD_NODE_API } from '../../../utils/constants';
import { GetTasksQueryParams } from '../../../server/models/types';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { TASK_STATE } from '../../utils/constants';

const CREATE_TASK = 'task/CREATE_TASK';
const GET_TASK = 'task/GET_TASK';
const GET_TASK_LIST = 'task/GET_TASK_LIST';
const UPDATE_TASK = 'task/UPDATE_TASK';
const START_TASK = 'task/START_TASK';
const STOP_TASK = 'task/STOP_TASK';
const DELETE_TASK = 'task/DELETE_TASK';
const SEARCH_TASK = 'task/SEARCH_TASK';
//   const GET_DETECTOR_PROFILE = 'task/GET_DETECTOR_PROFILE';

export interface Tasks {
  requesting: boolean;
  tasks: { [key: string]: Task };
  taskList: { [key: string]: TaskListItem };
  totalTasks: number;
  errorMessage: string;
}
export const initialTasksState: Tasks = {
  requesting: false,
  tasks: {},
  taskList: {},
  errorMessage: '',
  totalTasks: 0,
};

const reducer = handleActions<Tasks>(
  {
    [CREATE_TASK]: {
      REQUEST: (state: Tasks): Tasks => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Tasks, action: APIResponseAction): Tasks => ({
        ...state,
        errorMessage: '',
        requesting: false,
        tasks: {
          ...state.tasks,
          [action.result.data.response.id]: action.result.data.response,
        },
      }),
      FAILURE: (state: Tasks, action: APIErrorAction): Tasks => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [GET_TASK]: {
      REQUEST: (state: Tasks): Tasks => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Tasks, action: APIResponseAction): Tasks => ({
        ...state,
        requesting: false,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...cloneDeep(action.result.data.response),
          },
        },
      }),
      FAILURE: (state: Tasks, action: APIErrorAction): Tasks => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [GET_TASK_LIST]: {
      REQUEST: (state: Tasks): Tasks => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Tasks, action: APIResponseAction): Tasks => ({
        ...state,
        requesting: false,
        taskList: {
          ...state.taskList,
          ...action.result.data.response.taskList.reduce(
            (acc: any, task: TaskListItem) => ({
              ...acc,
              [task.id]: task,
            }),
            {}
          ),
        },
        totalTasks: action.result.data.response.totalTasks,
      }),
      FAILURE: (state: Tasks, action: APIErrorAction): Tasks => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [UPDATE_TASK]: {
      REQUEST: (state: Tasks): Tasks => {
        const newState = { ...state, requesting: true, errorMessage: '' };
        return newState;
      },
      SUCCESS: (state: Tasks, action: APIResponseAction): Tasks => ({
        ...state,
        requesting: false,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            ...action.result.data.response,
            lastUpdateTime: moment().valueOf(),
          },
        },
      }),
      FAILURE: (state: Tasks, action: APIErrorAction): Tasks => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [START_TASK]: {
      REQUEST: (state: Tasks): Tasks => {
        const newState = { ...state, requesting: true, errorMessage: '' };
        return newState;
      },
      SUCCESS: (state: Tasks, action: APIResponseAction): Tasks => ({
        ...state,
        requesting: false,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            enabled: true,
            enabledTime: moment().valueOf(),
            curState: TASK_STATE.RUNNING,
            executionId: action.result.data.response.executionId,
          },
        },
      }),
      FAILURE: (state: Tasks, action: APIErrorAction): Tasks => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [STOP_TASK]: {
      REQUEST: (state: Tasks): Tasks => {
        const newState = { ...state, requesting: true, errorMessage: '' };
        return newState;
      },
      SUCCESS: (state: Tasks, action: APIResponseAction): Tasks => ({
        ...state,
        requesting: false,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            enabled: false,
            disabledTime: moment().valueOf(),
            curState: TASK_STATE.DISABLED,
            // stateError: '',
            // initProgress: undefined,
          },
        },
      }),
      FAILURE: (state: Tasks, action: APIErrorAction): Tasks => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [DELETE_TASK]: {
      REQUEST: (state: Tasks): Tasks => {
        const newState = { ...state, requesting: true, errorMessage: '' };
        return newState;
      },
      SUCCESS: (state: Tasks, action: APIResponseAction): Tasks => {
        delete state.tasks[action.taskId];
        delete state.taskList[action.taskId];
        return {
          ...state,
          requesting: false,
        };
      },
      FAILURE: (state: Tasks, action: APIErrorAction): Tasks => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [SEARCH_TASK]: {
      REQUEST: (state: Tasks): Tasks => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Tasks, action: APIResponseAction): Tasks => ({
        ...state,
        requesting: false,
        errorMessage: '',
      }),
      FAILURE: (state: Tasks, action: APIErrorAction): Tasks => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },

    //   [GET_DETECTOR_PROFILE]: {
    //     REQUEST: (state: Detectors): Detectors => {
    //       const newState = { ...state, requesting: true, errorMessage: '' };
    //       return newState;
    //     },
    //     SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
    //       ...state,
    //       requesting: false,
    //       detectorList: {
    //         ...state.detectorList,
    //         [action.detectorId]: {
    //           ...state.detectorList[action.detectorId],
    //           curState: action.result.data.response.state,
    //         },
    //       },
    //     }),
    //     FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
    //       ...state,
    //       requesting: false,
    //       errorMessage: action.error,
    //     }),
    //   },
  },
  initialTasksState
);

export const createTask = (requestBody: Task): APIAction => ({
  type: CREATE_TASK,
  request: (client: IHttpService) =>
    client.post(`..${AD_NODE_API.TASK}`, requestBody),
});

export const getTask = (taskId: string): APIAction => ({
  type: GET_TASK,
  request: (client: IHttpService) =>
    client.get(`..${AD_NODE_API.TASK}/${taskId}`),
  taskId,
});

export const getTaskList = (queryParams: GetTasksQueryParams): APIAction => ({
  type: GET_TASK_LIST,
  request: (client: IHttpService) =>
    client.get(`..${AD_NODE_API.TASK}`, { params: queryParams }),
});

export const updateTask = (taskId: string, requestBody: Task): APIAction => ({
  type: UPDATE_TASK,
  request: (client: IHttpService) =>
    client.put(`..${AD_NODE_API.TASK}/${taskId}`, requestBody, {
      params: {
        ifPrimaryTerm: requestBody.primaryTerm,
        ifSeqNo: requestBody.seqNo,
      },
    }),
  taskId,
});

export const startTask = (taskId: string): APIAction => ({
  type: START_TASK,
  request: (client: IHttpService) =>
    client.post(`..${AD_NODE_API.TASK}/${taskId}/start`, {
      taskId: taskId,
    }),
  taskId,
});

export const stopTask = (taskId: string): APIAction => ({
  type: STOP_TASK,
  request: (client: IHttpService) =>
    client.post(`..${AD_NODE_API.TASK}/${taskId}/stop`, {
      taskId: taskId,
    }),
  taskId,
});

export const deleteTask = (taskId: string): APIAction => ({
  type: DELETE_TASK,
  request: (client: IHttpService) =>
    client.delete(`..${AD_NODE_API.TASK}/${taskId}`),
  taskId,
});

export const searchTask = (requestBody: any): APIAction => ({
  type: SEARCH_TASK,
  request: (client: IHttpService) =>
    client.post(`..${AD_NODE_API.TASK}/_search`, requestBody),
});

//   export const getDetectorProfile = (detectorId: string): APIAction => ({
//     type: GET_DETECTOR_PROFILE,
//     request: (client: IHttpService) =>
//       client.get(`..${AD_NODE_API.DETECTOR}/${detectorId}/_profile`, {
//         params: detectorId,
//       }),
//     detectorId,
//   });

export default reducer;
