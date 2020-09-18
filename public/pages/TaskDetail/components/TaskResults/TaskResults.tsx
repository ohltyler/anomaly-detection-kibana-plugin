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

import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import {
  //@ts-ignore
  EuiFlexGrid,
  EuiFlexItem,
  EuiText,
  EuiFormRow,
  EuiButton,
  EuiFormRowProps,
  EuiSuperDatePicker,
} from '@elastic/eui';
import { get } from 'lodash';
import {
  Task,
  Detector,
  TaskAnomalySummary,
  Anomalies,
  DateRange,
} from '../../../../models/interfaces';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { TASK_DATE_RANGE_COMMON_OPTIONS } from '../../../CreateTask/utils/constants';
import { searchES } from '../../../../redux/reducers/elasticsearch';
import {
  filterWithDateRange,
  getAnomalySummaryQuery,
  getBucketizedAnomalyResultsQuery,
  parseBucketizedAnomalyResults,
  parseAnomalySummary,
  parsePureAnomalies,
  buildParamsForGetAnomalyResultsWithDateRange,
  FEATURE_DATA_CHECK_WINDOW_OFFSET,
  getTaskAnomalySummaryQuery,
  getTaskAnomalyResults,
} from '../../../utils/anomalyResultUtils';
import { INITIAL_TASK_ANOMALY_SUMMARY } from '../../utils/constants';
import { MAX_ANOMALIES } from '../../../../utils/constants';
import { getDetectorResults } from '../../../../redux/reducers/anomalyResults';
import {
  convertTimestampToString,
  convertTimestampToNumber,
} from '../../../CreateTask/utils/helpers';

interface TaskResultsProps {
  task: Task;
  detector: Detector;
  isLoading: boolean;
}

export const TaskResults = (props: TaskResultsProps) => {
  const dispatch = useDispatch();
  const startDate = moment().subtract(7, 'days').valueOf();
  const endDate = moment().valueOf();

  const [anomalySummary, setAnomalySummary] = useState<TaskAnomalySummary>(
    INITIAL_TASK_ANOMALY_SUMMARY
  );
  const [isLoadingAnomalyResults, setIsLoadingAnomalyResults] = useState<
    boolean
  >(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: props.task.dataStartTime,
    endDate: props.task.dataEndTime,
  });
  const [rawAnomalyResults, setRawAnomalyResults] = useState<Anomalies>();
  const [shouldFetchRawResults, setShouldFetchRawResults] = useState<boolean>(
    true
  );

  // If the user changes the date range: determine if we should get bucketized results
  // or raw results. We load at most 10k AD result data points for one call.
  useEffect(() => {
    if (
      !props.isLoading &&
      dateRange.endDate - dateRange.startDate >
        props.detector.detectionInterval.period.interval * 60000 * MAX_ANOMALIES
    ) {
      console.log('too many - fetching bucketized results');
      fetchBucketizedAnomalyResults();
    } else {
      console.log('enough to display raw');
      fetchRawAnomalyResults();
    }
  }, [dateRange]);

  const fetchBucketizedAnomalyResults = async () => {
    try {
      setIsLoadingAnomalyResults(true);
      const anomalySummaryResult = await dispatch(
        searchES(
          getAnomalySummaryQuery(
            props.task.dataStartTime,
            props.task.dataEndTime,
            props.task.detectorId
          )
        )
      );
      // setPureAnomalies(parsePureAnomalies(anomalySummaryResult));
      // setBucketizedAnomalySummary(parseAnomalySummary(anomalySummaryResult));
      const result = await dispatch(
        searchES(
          getBucketizedAnomalyResultsQuery(
            dateRange.startDate,
            dateRange.endDate,
            1,
            props.task.detectorId
          )
        )
      );
      //setBucketizedAnomalyResults(parseBucketizedAnomalyResults(result));
    } catch (err) {
      console.error(
        `Failed to get anomaly results for ${props.detector.id}`,
        err
      );
    } finally {
      // setIsLoadingAnomalyResults(false);
      // fetchRawAnomalyResults(false);
    }
  };

  // fetching the raw anomaly results
  const fetchRawAnomalyResults = async () => {
    try {
      const params = buildParamsForGetAnomalyResultsWithDateRange(
        dateRange.startDate,
        dateRange.endDate
      );
      const taskResultResponse = await dispatch(
        getDetectorResults(props.task.detectorId, params)
      );
      const anomaliesData = get(taskResultResponse, 'data.response', []);

      console.log('raw anomalies data: ', anomaliesData);

      setRawAnomalyResults({
        anomalies: get(anomaliesData, 'results', []),
        featureData: get(anomaliesData, 'featureResults', []),
      });
    } catch (err) {
      console.error(
        `Failed to get raw anomaly results for ${props.task.detectorId}`,
        err
      );
    }
  };

  const datePicker = () => (
    <EuiSuperDatePicker
      isLoading={props.isLoading}
      showUpdateButton={false}
      start={convertTimestampToString(dateRange.startDate)}
      end={convertTimestampToString(dateRange.endDate)}
      onTimeChange={({ start, end, isInvalid, isQuickSelection }) => {
        setDateRange({
          startDate: convertTimestampToNumber(start) || 0,
          endDate: convertTimestampToNumber(end) || 0,
        });
        //handleDatePickerDateRangeChange(start, end);
      }}
      onRefresh={({ start, end, refreshInterval }) => {
        //handleDatePickerDateRangeChange(start, end, true);
      }}
      isPaused={true}
      commonlyUsedRanges={TASK_DATE_RANGE_COMMON_OPTIONS}
    />
  );
  return (
    <ContentPanel
      title={`${props.task.name} results`}
      titleSize="s"
      panelStyles={{ margin: '0px' }}
      actions={datePicker()}
    >
      <EuiText>Some results here</EuiText>
    </ContentPanel>
  );
};
