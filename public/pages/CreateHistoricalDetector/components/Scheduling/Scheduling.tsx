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
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { FormattedFormRow } from '../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import { getError, isInvalid } from '../../../../utils/utils';
import {
  HistoricalDetectorFormikValues,
  HISTORICAL_DETCTOR_DATE_RANGE_COMMON_OPTIONS,
  SAVE_HISTORICAL_DETECTOR_OPTIONS,
} from '../../utils/constants';
import { convertTimestampToString } from '../../utils/helpers';

interface SchedulingProps {
  isLoading: boolean;
  formikProps: FormikProps<HistoricalDetectorFormikValues>;
  selectedOption: SAVE_HISTORICAL_DETECTOR_OPTIONS;
  onOptionChange(id: string): void;
}

export function Scheduling(props: SchedulingProps) {
  const runDetectorOptions = [
    {
      id: SAVE_HISTORICAL_DETECTOR_OPTIONS.START,
      label: 'Yes, automatically run the detector',
    },
    {
      id: SAVE_HISTORICAL_DETECTOR_OPTIONS.KEEP_STOPPED,
      label: 'No, manually run detector at a later time',
    },
  ];

  return (
    <ContentPanel title="Scheduling" titleSize="s">
      <Field name="dateRange">
        {({ field, form }: FieldProps) => (
          <FormattedFormRow
            title="Date range"
            hint="Select a date range for your historical detector to run."
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
              commonlyUsedRanges={HISTORICAL_DETCTOR_DATE_RANGE_COMMON_OPTIONS}
            />
          </FormattedFormRow>
        )}
      </Field>
      <EuiSpacer size="l" />
      <FormattedFormRow
        title="Run detector by default"
        hint="Choose to run your historical analysis now or save for a later date. It is recommended that you run this analysis when your system is idle."
      >
        <EuiRadioGroup
          name="run detector radio group"
          options={runDetectorOptions}
          idSelected={props.selectedOption}
          onChange={props.onOptionChange}
        />
      </FormattedFormRow>
    </ContentPanel>
  );
}
