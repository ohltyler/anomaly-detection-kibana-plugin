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

import { EuiSuperDatePicker } from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { Task } from '../../../../models/interfaces';
import dateMath from '@elastic/datemath';
import { DateRange } from '../../../../models/interfaces';
import moment from 'moment';
import { TASK_DATE_RANGE_COMMON_OPTIONS } from '../../utils/constants';

interface DateRangePickerProps {
  dateRange: DateRange;
  isLoading: boolean;
  onDateRangeChange: (dateRange: DateRange) => void;
}

export function DateRangePicker(props: DateRangePickerProps) {
  const formattedStart = moment(props.dateRange.startDate).format();
  const formattedEnd = moment(props.dateRange.endDate).format();

  const onDateRangeChange = (start: string, end: string) => {
    // If there's an issue parsing: set default range of 1 week prior
    props.onDateRangeChange({
      startDate:
        dateMath.parse(start)?.valueOf() ||
        moment().subtract(7, 'days').valueOf(),
      endDate: dateMath.parse(end)?.valueOf() || moment().valueOf(),
    });
  };

  return (
    <ContentPanel title="Date range" titleSize="s">
      <Field name="dateRange">
        {({ field, form }: FieldProps) => {
          // form.setFieldValue('startTime', props.dateRange.startDate);
          // form.setFieldValue('endTime', props.dateRange.endDate);
          return (
            <EuiSuperDatePicker
              isLoading={props.isLoading}
              start={formattedStart}
              end={formattedEnd}
              onTimeChange={({ start, end, isInvalid, isQuickSelection }) => {
                form.setFieldValue(
                  'startTime',
                  dateMath.parse(start)?.valueOf()
                );
                form.setFieldValue('endTime', dateMath.parse(end)?.valueOf());
                onDateRangeChange(start, end);
              }}
              isPaused={true}
              showUpdateButton={false}
              commonlyUsedRanges={TASK_DATE_RANGE_COMMON_OPTIONS}
            />
          );
        }}
      </Field>
    </ContentPanel>
  );
}
