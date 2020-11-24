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
  HttpSetup,
  APIErrorAction,
} from '../middleware/types';
import { cloneDeep } from 'lodash';
import { AD_NODE_API } from '../../../utils/constants';
import handleActions from '../utils/handleActions';
import { Detector, HistoricalDetectorListItem } from '../../models/interfaces';
import { GetDetectorsQueryParams } from '../../../server/models/types';

const GET_HISTORICAL_DETECTOR = 'ad/GET_HISTORICAL_DETECTOR';
const GET_HISTORICAL_DETECTOR_LIST = 'ad/GET_HISTORICAL_DETECTOR_LIST';

export interface HistoricalDetectors {
  requesting: boolean;
  detectors: { [key: string]: Detector };
  detectorList: { [key: string]: HistoricalDetectorListItem };
  totalDetectors: number;
  errorMessage: string;
}
export const initialHistoricalDetectorsState: HistoricalDetectors = {
  requesting: false,
  detectors: {},
  detectorList: {},
  totalDetectors: 0,
  errorMessage: '',
};

const reducer = handleActions<HistoricalDetectors>(
  {
    [GET_HISTORICAL_DETECTOR]: {
      REQUEST: (state: HistoricalDetectors): HistoricalDetectors => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (
        state: HistoricalDetectors,
        action: APIResponseAction
      ): HistoricalDetectors => ({
        ...state,
        requesting: false,
        detectors: {
          ...state.detectors,
          [action.detectorId]: {
            ...cloneDeep(action.result.response),
          },
        },
      }),
      FAILURE: (
        state: HistoricalDetectors,
        action: APIErrorAction
      ): HistoricalDetectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },

    [GET_HISTORICAL_DETECTOR_LIST]: {
      REQUEST: (state: HistoricalDetectors): HistoricalDetectors => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (
        state: HistoricalDetectors,
        action: APIResponseAction
      ): HistoricalDetectors => ({
        ...state,
        requesting: false,
        detectorList: action.result.response.detectorList.reduce(
          (acc: any, detector: HistoricalDetectorListItem) => ({
            ...acc,
            [detector.id]: detector,
          }),
          {}
        ),
        totalDetectors: action.result.response.totalDetectors,
      }),
      FAILURE: (
        state: HistoricalDetectors,
        action: APIErrorAction
      ): HistoricalDetectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
  },

  initialHistoricalDetectorsState
);

export const getHistoricalDetector = (detectorId: string): APIAction => ({
  type: GET_HISTORICAL_DETECTOR,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API.DETECTOR}/${detectorId}/historical`),
  detectorId,
});

export const getHistoricalDetectorList = (
  queryParams: GetDetectorsQueryParams
): APIAction => ({
  type: GET_HISTORICAL_DETECTOR_LIST,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API.DETECTOR}/historical`, { query: queryParams }),
});

export default reducer;
