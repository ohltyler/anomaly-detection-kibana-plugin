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
import { Task, Detector } from '../../../../models/interfaces';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { TASK_DATE_RANGE_COMMON_OPTIONS } from '../../../CreateTask/utils/constants';
import { searchES } from '../../../../redux/reducers/elasticsearch';
import { getTaskAnomalySummaryQuery } from '../../../utils/anomalyResultUtils';

interface TaskResultsProps {
  task: Task;
  isLoading: boolean;
}

export const TaskResults = (props: TaskResultsProps) => {
  const dispatch = useDispatch();

  const [isLoadingAnomalyResults, setIsLoadingAnomalyResults] = useState<
    boolean
  >(false);
  const [datePickerRange, setDatePickerRange] = useState({
    start: 'now-7d',
    end: 'now',
  });

  const startDate = moment().subtract(7, 'days').valueOf();
  const endDate = moment().valueOf();

  //   useEffect(() => {
  //     const getTaskAnomalyResults = async () => {
  //       try {
  //         setIsLoadingAnomalyResults(true);
  //         const anomalySummaryResult = await dispatch(
  //           searchES(
  //             getTaskAnomalySummaryQuery(
  //               startDate,
  //               endDate,
  //               props.detector.id
  //             )
  //           )
  //         );
  //       } catch (err) {
  //         console.error(
  //           `Failed to get anomaly results for ${props.task.id}`,
  //           err
  //         );
  //       }
  //     };
  //   });

  const datePicker = () => (
    <EuiSuperDatePicker
      isLoading={props.isLoading}
      start={datePickerRange.start}
      end={datePickerRange.end}
      onTimeChange={({ start, end, isInvalid, isQuickSelection }) => {
        setDatePickerRange({ start: start, end: end });
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
      panelStyles={{ margin: '24px' }}
      actions={datePicker()}
    >
      <EuiText>Some results here</EuiText>
    </ContentPanel>
  );
};
