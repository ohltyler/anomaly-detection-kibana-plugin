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
import handleActions from '../utils/handleActions';
import { Detector, HistoricalDetectorListItem } from '../../models/interfaces';

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
  {},
  initialHistoricalDetectorsState
);

export default reducer;
