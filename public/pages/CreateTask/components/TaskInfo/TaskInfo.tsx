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

import { EuiFieldText, EuiTextArea } from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { getError, isInvalid } from '../../../../utils/utils';
import { FormattedFormRow } from '../../../createDetector/components/FormattedFormRow/FormattedFormRow';

interface TaskInfoProps {
  onValidateTaskName: (taskName: string) => Promise<any>;
  onValidateTaskDescription: (taskDescription: string) => any;
}
export function TaskInfo(props: TaskInfoProps) {
  return (
    <ContentPanel title="Name and description" titleSize="s">
      <Field name="taskName" validate={props.onValidateTaskName}>
        {({ field, form }: FieldProps) => (
          <FormattedFormRow
            title="Name"
            hint="Specify a unique and descriptive name that is easy to
          recognize. Task name must contain 1-64 characters. 
          Valid characters are a-z, A-Z, 0-9, -(hyphen) and _(underscore)"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiFieldText
              name="taskName"
              id="taskName"
              placeholder="Enter task name"
              isInvalid={isInvalid(field.name, form)}
              {...field}
            />
          </FormattedFormRow>
        )}
      </Field>
      <Field name="taskDescription" validate={props.onValidateTaskDescription}>
        {({ field, form }: FieldProps) => (
          <FormattedFormRow
            formattedTitle={
              <p>
                Description <span className="optional">- optional</span>
              </p>
            }
            hint="Describe the purpose of the task."
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiTextArea
              name="taskDescription"
              id="taskDescription"
              rows={3}
              placeholder="Enter task description"
              {...field}
              isInvalid={isInvalid(field.name, form)}
            />
          </FormattedFormRow>
        )}
      </Field>
    </ContentPanel>
  );
}
