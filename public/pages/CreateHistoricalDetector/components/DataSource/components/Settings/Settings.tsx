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
  EuiTitle,
  EuiText,
  EuiFlexItem,
  EuiFlexGroup,
  EuiFieldNumber,
} from '@elastic/eui';
import { Field, FieldProps, FormikProps } from 'formik';
import React from 'react';
import { FormattedFormRow } from '../../../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import {
  getError,
  isInvalid,
  validatePositiveInteger,
} from '../../../../../../utils/utils';
import { HistoricalDetectorFormikValues } from '../../../../utils/constants';

interface SettingsProps {
  isLoading: boolean;
  formikProps: FormikProps<HistoricalDetectorFormikValues>;
}

export function Settings(props: SettingsProps) {
  return (
    <EuiFlexGroup direction="column" style={{ margin: '0px' }}>
      <EuiFlexItem style={{ marginLeft: '0px' }}>
        <EuiTitle size="s">
          <h3>Operation settings</h3>
        </EuiTitle>
      </EuiFlexItem>
      <Field name="detectionInterval" validate={validatePositiveInteger}>
        {({ field, form }: FieldProps) => (
          <EuiFlexGroup>
            <EuiFlexItem style={{ maxWidth: '70%' }}>
              <FormattedFormRow
                fullWidth
                title="Detection interval"
                hint="Define how often the detector collects data to generate
                  anomalies. The shorter the interval is, the more
                  detector results there will be, and the more computing resources
                  the detector will need."
                isInvalid={isInvalid(field.name, form)}
                error={getError(field.name, form)}
              >
                <EuiFlexGroup gutterSize="s" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiFieldNumber
                      name="detectionInterval"
                      id="detectionInterval"
                      placeholder="Detector interval"
                      data-test-subj="detectionInterval"
                      {...field}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiText>
                      <p className="minutes">minutes</p>
                    </EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </FormattedFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </Field>
    </EuiFlexGroup>
  );
}
