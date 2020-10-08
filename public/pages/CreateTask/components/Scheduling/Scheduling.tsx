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

import { EuiSuperDatePicker, EuiRadioGroup, EuiSpacer } from '@elastic/eui';
import { Field, FieldProps, FormikProps } from 'formik';
import { debounce, get, isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { FormattedFormRow } from '../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import { getError, isInvalid, required } from '../../../../utils/utils';
import {
  TaskFormikValues,
  TASK_DATE_RANGE_COMMON_OPTIONS,
} from '../../utils/constants';
import { convertTimestampToString } from '../../utils/helpers';
import { SAVE_TASK_OPTIONS } from '../../utils/constants';

interface SchedulingProps {
  isLoading: boolean;
  formikProps: FormikProps<TaskFormikValues>;
  selectedOption: SAVE_TASK_OPTIONS;
  onOptionChange(id: string): void;
}

export function Scheduling(props: SchedulingProps) {
  const runTaskOptions = (disableStartAdJob: boolean) => {
    return [
      {
        id: SAVE_TASK_OPTIONS.START_TASK,
        label: 'Yes, automatically run task',
        //disabled: disableStartAdJob,
      },
      {
        id: SAVE_TASK_OPTIONS.KEEP_TASK_STOPPED,
        label: 'No, manually run task at a later time',
      },
    ];
  };

  return (
    <ContentPanel title="Scheduling" titleSize="s">
      <Field name="dateRange">
        {({ field, form }: FieldProps) => (
          <FormattedFormRow
            title="Date range"
            hint="Select a date range for your historical data analysis report."
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiSuperDatePicker
              isLoading={props.isLoading}
              start={convertTimestampToString(form.values.startTime)}
              end={convertTimestampToString(form.values.endTime)}
              onTimeChange={({ start, end, isInvalid, isQuickSelection }) => {
                form.setFieldValue('startTime', start);
                form.setFieldValue('endTime', end);
                form.setFieldValue('rangeValid', !isInvalid);
              }}
              isPaused={true}
              showUpdateButton={false}
              commonlyUsedRanges={TASK_DATE_RANGE_COMMON_OPTIONS}
            />
          </FormattedFormRow>
        )}
      </Field>
      <EuiSpacer size="l" />
      <FormattedFormRow
        title="Run task by default"
        hint="Choose to run your historical analysis now or save for a later date. It is recommended that you run this analysis when your system is idle."
      >
        <EuiRadioGroup
          name="run task radio group"
          //options={startAdJobOptions(!props.readyToStartAdJob)}
          options={runTaskOptions(true)}
          idSelected={props.selectedOption}
          onChange={props.onOptionChange}
        />
      </FormattedFormRow>
    </ContentPanel>
  );
}
