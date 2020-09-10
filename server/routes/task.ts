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

import { Request, ResponseToolkit } from 'hapi';
import { get, orderBy } from 'lodash';
//@ts-ignore
import { CallClusterWithRequest } from 'src/legacy/core_plugins/elasticsearch';
import { Task, GetTasksQueryParams, ServerResponse } from '../models/types';
import { Router } from '../router';
import { isIndexNotFoundError } from './utils/adHelpers';
import {
  convertTaskKeysToCamelCase,
  convertTaskKeysToSnakeCase,
  getFinalTaskStates,
} from './utils/taskHelpers';

type PutDetectorParams = {
  detectorId: string;
  ifSeqNo?: string;
  ifPrimaryTerm?: string;
  body: string;
};

export default function (apiRouter: Router) {
  apiRouter.post('/tasks', createTask);
  apiRouter.get('/tasks', getTasks);
  //apiRouter.get('/tasks/{taskId}', getTask);
  //   apiRouter.put('/detectors/{detectorId}', updateTask);
  //   apiRouter.post('/detectors/_search', searchDetector);
  //   apiRouter.get('/detectors', getDetectors);
  //   apiRouter.post('/detectors/{detectorId}/preview', previewDetector);
  //   apiRouter.get('/detectors/{detectorId}/results', getAnomalyResults);
  //   apiRouter.delete('/detectors/{detectorId}', deleteDetector);
  //   apiRouter.post('/detectors/{detectorId}/start', startDetector);
  //   apiRouter.post('/detectors/{detectorId}/stop', stopDetector);
  //   apiRouter.get('/detectors/{detectorId}/_profile', getDetectorProfile);
}

const createTask = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<Task>> => {
  try {
    const requestBody = req.payload as Task;
    // const requestBody = JSON.stringify(
    //   convertTaskKeysToSnakeCase(req.payload)
    // );
    // let response;
    // response = await callWithRequest(req, 'ad.createTask', {
    //   body: requestBody,
    // });

    // const resp = {
    //   ...response.anomaly_detector,
    //   id: response._id,
    //   primaryTerm: response._primary_term,
    //   seqNo: response._seq_no,
    // };
    const resp = {
      id: `dummy-id-${Math.random()}`,
      name: requestBody.name,
      description: requestBody.description,
      detector_id: requestBody.detectorId,
      data_start_time: requestBody.dataStartTime,
      data_end_time: requestBody.dataEndTime,
      last_update_time: requestBody.lastUpdateTime,
    };

    const respInCamel = convertTaskKeysToCamelCase(resp) as Task;

    console.log('dummy api response (in snake): ', resp);
    console.log('\n\ndummy response to return (in camel): ', respInCamel);

    return {
      ok: true,
      response: respInCamel,
      //response: convertTaskKeysToCamelCase(resp) as Task,
    };
  } catch (err) {
    console.log('Anomaly detector - CreateDetector', err);
    return { ok: false, error: err.message };
  }
};

const getTasks = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<any>> => {
  try {
    const {
      search = '',
      //@ts-ignore
    } = req.query as GetTasksQueryParams;

    //Preparing search request
    const requestBody = {
      query: {
        match: {
          name: search,
        },
      },
    };

    // Getting all of the detectors, including info about the execution state and last update time.
    // For detectors, we have to call the (1) get detector and (2) detector profile apis for each individual detector
    // to get this info. This getTasks api will support a param to search on task executions, to include
    // this information all from one api call. The mock response is a simulation of what may get returned.

    // const response: SearchResponse<Task> = await callWithRequest(
    //   req,
    //   'ad.searchTask',
    //   { body: requestBody }
    // );

    const response = {
      hits: {
        total: {
          value: 2,
        },
        hits: [
          {
            _index: '.opendistro-task-executions',
            _type: 'doc',
            _id: 'dummy-id-1',
            _source: {
              name: 'dummy-task-1',
              description: 'dummy-description-1',
              detector_id: 'dummy-detector-id-1',
              state: 'RUNNING',
              data_start_time: 1593864000,
              data_end_time: 1593964000,
              last_update_time: 1594964000,
            },
          },
          {
            _index: '.opendistro-task-executions',
            _type: 'doc',
            _id: 'dummy-id-2',
            _source: {
              name: 'dummy-task-2',
              description: 'dummy-description-2',
              detector_id: 'dummy-detector-id-2',
              state: 'DISABLED',
              data_start_time: 1593874000,
              data_end_time: 1594964000,
              last_update_time: 1594994000,
            },
          },
        ],
      },
    };

    console.log('request: ', requestBody);
    console.log('mock response: ', response);

    const totalTasks = get(response, 'hits.total.value', 0);

    const allTasks = get(response, 'hits.hits', []).reduce(
      (acc: any, task: any) => ({
        ...acc,
        [task._id]: {
          id: task._id,
          name: get(task, '_source.name', ''),
          detectorId: get(task, '_source.detector_id'),
          description: get(task, '_source.description', ''),
          curState: get(task, '_source.state'),
          dataStartTime: get(task, '_source.data_start_time'),
          dataEndTime: get(task, '_source.data_end_time'),
          lastUpdateTime: get(task, '_source.last_update_time'),
        },
      }),
      {}
    );

    // Get the final task states
    const allTasksWithFinalStates = getFinalTaskStates(allTasks);

    return {
      ok: true,
      response: {
        totalTasks,
        taskList: allTasksWithFinalStates,
      },
    };
  } catch (err) {
    console.log('Anomaly detector - Unable to get tasks', err);
    if (isIndexNotFoundError(err)) {
      return { ok: true, response: { totalDetectors: 0, taskList: {} } };
    }
    return { ok: false, error: err.message };
  }
};

// NOTE: the ad.getDetector api call here will want to add the optional ?execution=true here to retrieve the execution state.
// We will not call the profile api to get the state here, as it is heavy and should just be used for debugging to get a lot of details.

// const getTask = async (
//   req: Request,
//   h: ResponseToolkit,
//   callWithRequest: CallClusterWithRequest
// ): Promise<ServerResponse<Task>> => {
//   try {
//     const { detectorId } = req.params;
//     const response = await callWithRequest(req, 'ad.getDetector', {
//       detectorId,
//     });
//     let detectorState;
//     try {
//       const detectorStateResp = await callWithRequest(
//         req,
//         'ad.detectorProfile',
//         {
//           detectorId: detectorId,
//         }
//       );
//       const detectorStates = getFinalDetectorStates(
//         [detectorStateResp],
//         [convertTaskKeysToCamelCase(response.anomaly_detector)]
//       );
//       detectorState = detectorStates[0];
//     } catch (err) {
//       console.log('Anomaly detector - Unable to retrieve detector state', err);
//     }
//     const resp = {
//       ...response.anomaly_detector,
//       id: response._id,
//       primaryTerm: response._primary_term,
//       seqNo: response._seq_no,
//       adJob: { ...response.anomaly_detector_job },
//       ...(detectorState !== undefined
//         ? {
//             curState: detectorState.state,
//             stateError: detectorState.error,
//             initProgress: getDetectorInitProgress(detectorState),
//           }
//         : {}),
//     };
//     return {
//       ok: true,
//       response: convertDetectorKeysToCamelCase(resp) as Detector,
//     };
//   } catch (err) {
//     console.log('Anomaly detector - Unable to get detector', err);
//     return { ok: false, error: err.message };
//   }
// };

// const deleteDetector = async (
//   req: Request,
//   h: ResponseToolkit,
//   callWithRequest: CallClusterWithRequest
// ): Promise<ServerResponse<AnomalyResults>> => {
//   try {
//     const { detectorId } = req.params;
//     const response = await callWithRequest(req, 'ad.deleteDetector', {
//       detectorId,
//     });
//     return {
//       ok: true,
//       response: response,
//     };
//   } catch (err) {
//     console.log('Anomaly detector - deleteDetector', err);
//     return { ok: false, error: err.body || err.message };
//   }
// };

// const previewDetector = async (
//   req: Request,
//   h: ResponseToolkit,
//   callWithRequest: CallClusterWithRequest
// ): Promise<ServerResponse<AnomalyResults>> => {
//   try {
//     const { detectorId } = req.params;
//     //@ts-ignore
//     const requestBody = JSON.stringify(
//       convertPreviewInputKeysToSnakeCase(req.payload)
//     );
//     const response = await callWithRequest(req, 'ad.previewDetector', {
//       detectorId,
//       body: requestBody,
//     });
//     const transformedKeys = mapKeysDeep(response, toCamel);
//     return {
//       ok: true,
//       //@ts-ignore
//       response: anomalyResultMapper(transformedKeys.anomalyResult),
//     };
//   } catch (err) {
//     console.log('Anomaly detector - previewDetector', err);
//     return { ok: false, error: err };
//   }
// };

// const startDetector = async (
//   req: Request,
//   h: ResponseToolkit,
//   callWithRequest: CallClusterWithRequest
// ): Promise<ServerResponse<AnomalyResults>> => {
//   try {
//     const { detectorId } = req.params;
//     const response = await callWithRequest(req, 'ad.startDetector', {
//       detectorId,
//     });
//     return {
//       ok: true,
//       response: response,
//     };
//   } catch (err) {
//     console.log('Anomaly detector - startDetector', err);
//     return { ok: false, error: err.body || err.message };
//   }
// };

// const stopDetector = async (
//   req: Request,
//   h: ResponseToolkit,
//   callWithRequest: CallClusterWithRequest
// ): Promise<ServerResponse<AnomalyResults>> => {
//   try {
//     const { detectorId } = req.params;
//     const response = await callWithRequest(req, 'ad.stopDetector', {
//       detectorId,
//     });
//     return {
//       ok: true,
//       response: response,
//     };
//   } catch (err) {
//     console.log('Anomaly detector - stopDetector', err);
//     return { ok: false, error: err.body || err.message };
//   }
// };

// const getDetectorProfile = async (
//   req: Request,
//   h: ResponseToolkit,
//   callWithRequest: CallClusterWithRequest
// ): Promise<ServerResponse<any>> => {
//   try {
//     const { detectorId } = req.params;
//     const response = await callWithRequest(req, 'ad.detectorProfile', {
//       detectorId,
//     });
//     return {
//       ok: true,
//       response,
//     };
//   } catch (err) {
//     console.log('Anomaly detector - detectorProfile', err);
//     return { ok: false, error: err.body || err.message };
//   }
// };

// const searchDetector = async (
//   req: Request,
//   h: ResponseToolkit,
//   callWithRequest: CallClusterWithRequest
// ): Promise<ServerResponse<any>> => {
//   try {
//     //@ts-ignore
//     const requestBody = JSON.stringify(req.payload);
//     const response: SearchResponse<Detector> = await callWithRequest(
//       req,
//       'ad.searchDetector',
//       { body: requestBody }
//     );
//     const totalDetectors = get(response, 'hits.total.value', 0);
//     const detectors = get(response, 'hits.hits', []).map((detector: any) => ({
//       ...convertDetectorKeysToCamelCase(detector._source),
//       id: detector._id,
//       seqNo: detector._seq_no,
//       primaryTerm: detector._primary_term,
//     }));
//     return {
//       ok: true,
//       response: {
//         totalDetectors,
//         detectors,
//       },
//     };
//   } catch (err) {
//     console.log('Anomaly detector - Unable to search detectors', err);
//     if (isIndexNotFoundError(err)) {
//       return { ok: true, response: { totalDetectors: 0, detectors: [] } };
//     }
//     return { ok: false, error: err.message };
//   }
// };

// const getAnomalyResults = async (
//   req: Request,
//   h: ResponseToolkit,
//   callWithRequest: CallClusterWithRequest
// ): Promise<ServerResponse<AnomalyResultsResponse>> => {
//   try {
//     const {
//       from = 0,
//       size = 20,
//       sortDirection = SORT_DIRECTION.DESC,
//       sortField = AD_DOC_FIELDS.DATA_START_TIME,
//       dateRangeFilter = undefined,
//       //@ts-ignore
//     } = req.query as {
//       from: number;
//       size: number;
//       sortDirection: SORT_DIRECTION;
//       sortField?: string;
//       dateRangeFilter?: string;
//     };
//     const { detectorId } = req.params;

//     //Allowed sorting columns
//     const sortQueryMap = {
//       anomalyGrade: { anomaly_grade: sortDirection },
//       confidence: { confidence: sortDirection },
//       [AD_DOC_FIELDS.DATA_START_TIME]: {
//         [AD_DOC_FIELDS.DATA_START_TIME]: sortDirection,
//       },
//       [AD_DOC_FIELDS.DATA_END_TIME]: {
//         [AD_DOC_FIELDS.DATA_END_TIME]: sortDirection,
//       },
//     } as { [key: string]: object };
//     let sort = {};
//     const sortQuery = sortQueryMap[sortField];
//     if (sortQuery) {
//       sort = sortQuery;
//     }

//     //Preparing search request
//     const requestBody = {
//       sort,
//       size,
//       from,
//       query: {
//         bool: {
//           filter: [
//             {
//               term: {
//                 detector_id: detectorId,
//               },
//             },
//           ],
//         },
//       },
//     };

//     try {
//       const dateRangeFilterObj = (dateRangeFilter
//         ? JSON.parse(dateRangeFilter)
//         : undefined) as DateRangeFilter;
//       const filterSize = requestBody.query.bool.filter.length;
//       if (dateRangeFilterObj && dateRangeFilterObj.fieldName) {
//         (dateRangeFilterObj.startTime || dateRangeFilterObj.endTime) &&
//           set(
//             requestBody.query.bool.filter,
//             `${filterSize}.range.${dateRangeFilterObj.fieldName}.format`,
//             'epoch_millis'
//           );

//         dateRangeFilterObj.startTime &&
//           set(
//             requestBody.query.bool.filter,
//             `${filterSize}.range.${dateRangeFilterObj.fieldName}.gte`,
//             dateRangeFilterObj.startTime
//           );

//         dateRangeFilterObj.endTime &&
//           set(
//             requestBody.query.bool.filter,
//             `${filterSize}.range.${dateRangeFilterObj.fieldName}.lte`,
//             dateRangeFilterObj.endTime
//           );
//       }
//     } catch (error) {
//       console.log('wrong date range filter', error);
//     }

//     const response = await callWithRequest(req, 'ad.searchResults', {
//       body: requestBody,
//     });

//     const totalResults: number = get(response, 'hits.total.value', 0);

//     const detectorResult: AnomalyResult[] = [];
//     const featureResult: { [key: string]: FeatureResult[] } = {};
//     get(response, 'hits.hits', []).forEach((result: any) => {
//       detectorResult.push({
//         startTime: result._source.data_start_time,
//         endTime: result._source.data_end_time,
//         plotTime: result._source.data_end_time,
//         confidence:
//           result._source.confidence != null &&
//           result._source.confidence !== 'NaN' &&
//           result._source.confidence > 0
//             ? toFixedNumberForAnomaly(
//                 Number.parseFloat(result._source.confidence)
//               )
//             : 0,
//         anomalyGrade:
//           result._source.anomaly_grade != null &&
//           result._source.anomaly_grade !== 'NaN' &&
//           result._source.anomaly_grade > 0
//             ? toFixedNumberForAnomaly(
//                 Number.parseFloat(result._source.anomaly_grade)
//               )
//             : 0,
//       });
//       result._source.feature_data.forEach((featureData: any) => {
//         if (!featureResult[featureData.feature_id]) {
//           featureResult[featureData.feature_id] = [];
//         }
//         featureResult[featureData.feature_id].push({
//           startTime: result._source.data_start_time,
//           endTime: result._source.data_end_time,
//           plotTime: result._source.data_end_time,
//           data:
//             featureData.data != null && featureData.data !== 'NaN'
//               ? toFixedNumberForAnomaly(Number.parseFloat(featureData.data))
//               : 0,
//         });
//       });
//     });
//     return {
//       ok: true,
//       response: {
//         totalAnomalies: totalResults,
//         results: detectorResult,
//         featureResults: featureResult,
//       },
//     };
//   } catch (err) {
//     console.log('Anomaly detector - Unable to get results', err);
//     return { ok: false, error: err.message };
//   }
// };
