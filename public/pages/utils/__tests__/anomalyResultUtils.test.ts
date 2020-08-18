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
  // done
  getQueryParamsForLiveAnomalyResults,
  // just uses other fns and then calls dispatch()
  getLiveAnomalyResults,
  buildParamsForGetAnomalyResultsWithDateRange,
  getAnomalyResultsWithDateRange,
  prepareDataForLiveChart,
  prepareDataForChart,
  generateAnomalyAnnotations,
  filterWithDateRange,
  getAnomalySummaryQuery,
  parseBucketizedAnomalyResults,
  parseAnomalySummary,
  parsePureAnomalies,
  getFeatureDataPoints,
  getFeatureMissingDataAnnotations,
  getFeatureDataPointsForDetector,
  getFeatureMissingSeverities,
  getFeatureDataMissingMessageAndActionItem,
} from '../anomalyResultUtils';

import {
  SORT_DIRECTION,
  AD_DOC_FIELDS,
  MIN_IN_MILLI_SECS,
} from '../../../../server/utils/constants';

import {
  MAX_ANOMALIES,
  MISSING_FEATURE_DATA_SEVERITY,
} from '../../../utils/constants';

import moment from 'moment';
import { start } from 'repl';

describe('anomalyResultUtils', () => {
  describe('getQueryParamsForLiveAnomalyResults', () => {
    test('returns correct params and sanity check the start time', () => {
      // Assuming the start time is 25 minutes prior, assume returned start time is between 20 & 30 minutes prior
      const startTimeLowRange = moment().subtract(30, 'minutes').valueOf();
      const startTimeHighRange = moment().subtract(20, 'minutes').valueOf();
      const result = getQueryParamsForLiveAnomalyResults(5, 5);
      const resultStartTime = result.dateRangeFilter.startTime;
      expect(resultStartTime).toBeGreaterThan(startTimeLowRange);
      expect(resultStartTime).toBeLessThan(startTimeHighRange);
      expect(result).toEqual({
        from: 0,
        size: 5,
        sortDirection: SORT_DIRECTION.DESC,
        sortField: AD_DOC_FIELDS.DATA_START_TIME,
        dateRangeFilter: {
          startTime: expect.anything(),
          fieldName: AD_DOC_FIELDS.DATA_START_TIME,
        },
      });
    });
  });
  describe('buildParamsForGetAnomalyResultsWithDateRange', () => {
    test('returns correct params with start and end times', () => {
      const startTime = 5;
      const endTime = 10;
      const result = buildParamsForGetAnomalyResultsWithDateRange(
        startTime,
        endTime
      );

      expect(result).toEqual({
        from: 0,
        size: MAX_ANOMALIES,
        sortDirection: SORT_DIRECTION.DESC,
        sortField: AD_DOC_FIELDS.DATA_START_TIME,
        dateRangeFilter: {
          startTime: startTime,
          endTime: endTime,
          fieldName: AD_DOC_FIELDS.DATA_START_TIME,
        },
      });
    });
  });
});
