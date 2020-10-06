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
  EuiCallOut,
  EuiComboBox,
  EuiSpacer,
  EuiSuperDatePicker,
  EuiText,
  EuiFlexItem,
  EuiFlexGroup,
  EuiFieldNumber,
} from '@elastic/eui';
import { Field, FieldProps, FormikProps } from 'formik';
import { debounce, get, isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CatIndex, IndexAlias } from '../../../../../server/models/types';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../../redux/reducers';
import {
  getIndices,
  getMappings,
  getPrioritizedIndices,
} from '../../../../redux/reducers/elasticsearch';
import { FormattedFormRow } from '../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import { getVisibleOptions, sanitizeSearchText } from '../../../utils/helpers';
import {
  getError,
  isInvalid,
  required,
  validatePositiveInteger,
} from '../../../../utils/utils';
import { IndexOption } from '../../../createDetector/components/Datasource/IndexOption';

import { validateIndex } from '../../../utils/validate';
import {
  TaskFormikValues,
  TASK_DATE_RANGE_COMMON_OPTIONS,
} from '../../utils/constants';
import { convertTimestampToString } from '../../utils/helpers';

interface SettingsProps {
  isLoading: boolean;
  formikProps: FormikProps<TaskFormikValues>;
}

export function Settings(props: SettingsProps) {
  const dispatch = useDispatch();
  const [queryText, setQueryText] = useState('');
  const [indexName, setIndexName] = useState(undefined);
  const elasticsearchState = useSelector(
    (state: AppState) => state.elasticsearch
  );
  useEffect(() => {
    const getInitialIndices = async () => {
      await dispatch(getIndices(queryText));
    };
    getInitialIndices();
  }, []);

  return (
    <ContentPanel title="Task operation settings" titleSize="s">
      <Field name="detectionInterval" validate={validatePositiveInteger}>
        {({ field, form }: FieldProps) => (
          <EuiFlexGroup>
            <EuiFlexItem style={{ maxWidth: '70%' }}>
              <FormattedFormRow
                fullWidth
                title="Task interval"
                hint="Define how often the task collects data to generate
                anomalies. The shorter the interval is, the more
                task results there will be, and the more computing resources
                the task will need."
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
    </ContentPanel>
  );
}
