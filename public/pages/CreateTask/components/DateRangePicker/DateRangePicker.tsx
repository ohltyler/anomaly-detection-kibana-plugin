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
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import dateMath from '@elastic/datemath';
import moment from 'moment';
import { TASK_DATE_RANGE_COMMON_OPTIONS } from '../../utils/constants';

interface DateRangePickerProps {
  isLoading: boolean;
}

export function DateRangePicker(props: DateRangePickerProps) {
  return (
    <ContentPanel title="Date range" titleSize="s">
      <Field name="dateRange">
        {({ field, form }: FieldProps) => {
          return (
            <EuiSuperDatePicker
              isLoading={props.isLoading}
              start={moment(form.values.startTime).format()}
              end={moment(form.values.endTime).format()}
              onTimeChange={({ start, end, isInvalid, isQuickSelection }) => {
                form.setFieldValue(
                  'startTime',
                  dateMath.parse(start)?.valueOf()
                );
                form.setFieldValue('endTime', dateMath.parse(end)?.valueOf());
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
