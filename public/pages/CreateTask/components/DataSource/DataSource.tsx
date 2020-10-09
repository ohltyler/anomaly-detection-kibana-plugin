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

import { EuiCallOut, EuiComboBox, EuiSpacer } from '@elastic/eui';
import { Field, FieldProps, FormikProps } from 'formik';
import { debounce, get, isEmpty } from 'lodash';
import React, { useEffect, useState, Fragment } from 'react';
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
import { getError, isInvalid, required } from '../../../../utils/utils';
import { IndexOption } from '../../../createDetector/components/Datasource/IndexOption';
import { Task, Detector } from '../../../../models/interfaces';
import { validateIndex } from '../../../utils/validate';
import { TaskFormikValues, INITIAL_TASK_VALUES } from '../../utils/constants';
import { Features } from './components/Features/Features';
import { Settings } from './components/Settings/Settings';
import { DetectorChooser } from './components/DetectorChooser/DetectorChooser';
import { CREATE_TASK_OPTIONS } from '../../utils/constants';

interface DataSourceProps {
  isEdit: boolean;
  task: Task;
  isLoading: boolean;
  formikProps: FormikProps<TaskFormikValues>;
}

export function DataSource(props: DataSourceProps) {
  const dispatch = useDispatch();
  const elasticsearchState = useSelector(
    (state: AppState) => state.elasticsearch
  );

  const [queryText, setQueryText] = useState('');
  const [indexName, setIndexName] = useState(undefined);
  const [createTaskSelection, setCreateTaskSelection] = useState<
    CREATE_TASK_OPTIONS
  >(CREATE_TASK_OPTIONS.USE_EXISTING);
  const [selectedDetector, setSelectedDetector] = useState<Detector>();
  const hideDetectorConfigFields =
    !props.isEdit &&
    createTaskSelection === CREATE_TASK_OPTIONS.USE_EXISTING &&
    selectedDetector === undefined;

  useEffect(() => {
    const getInitialIndices = async () => {
      await dispatch(getIndices(queryText));
    };
    getInitialIndices();
  }, []);

  const handleSearchChange = debounce(async (searchValue: string) => {
    if (searchValue !== queryText) {
      const sanitizedQuery = sanitizeSearchText(searchValue);
      setQueryText(sanitizedQuery);
      await dispatch(getPrioritizedIndices(sanitizedQuery));
    }
  }, 300);

  const handleIndexNameChange = (selectedOptions: any) => {
    const indexName = get(selectedOptions, '0.label', '');
    setIndexName(indexName);
    if (indexName !== '') {
      dispatch(getMappings(indexName));
    }
  };

  const dateFields = Array.from(
    get(elasticsearchState, 'dataTypes.date', []) as string[]
  );

  const timeStampFieldOptions = isEmpty(dateFields)
    ? []
    : dateFields.map((dateField) => ({ label: dateField }));

  const visibleIndices = get(elasticsearchState, 'indices', []) as CatIndex[];
  const visibleAliases = get(elasticsearchState, 'aliases', []) as IndexAlias[];

  const isRemoteIndex = () => {
    const initialIndex = get(props.formikProps, 'values.index.0.label', '');
    return indexName !== undefined
      ? indexName.includes(':')
      : initialIndex.includes(':');
  };

  return (
    <ContentPanel title="Data source" titleSize="s">
      {isRemoteIndex() ? (
        <div>
          <EuiCallOut
            title="This detector is using a remote cluster index, so you need to manually input the time field."
            color="warning"
            iconType="alert"
          />
          <EuiSpacer size="m" />
        </div>
      ) : null}
      {!props.isEdit ? (
        <DetectorChooser
          isLoading={props.isLoading}
          formikProps={props.formikProps}
          createTaskSelection={createTaskSelection}
          setCreateTaskSelection={setCreateTaskSelection}
          setSelectedDetector={setSelectedDetector}
        />
      ) : null}
      {hideDetectorConfigFields ? null : (
        <Fragment>
          <Field name="index" validate={validateIndex}>
            {({ field, form }: FieldProps) => {
              return (
                <FormattedFormRow
                  title="Index"
                  hint="Choose an index or index pattern as the data source."
                  isInvalid={isInvalid(field.name, form)}
                  error={getError(field.name, form)}
                  helpText="You can use a wildcard (*) in your index pattern"
                >
                  <EuiComboBox
                    id="index"
                    placeholder="Find indices"
                    async
                    isLoading={elasticsearchState.requesting}
                    options={getVisibleOptions(visibleIndices, visibleAliases)}
                    onSearchChange={handleSearchChange}
                    onCreateOption={(createdOption: string) => {
                      const normalizedOptions = createdOption.trim();
                      if (!normalizedOptions) return;
                      const customOption = [{ label: normalizedOptions }];
                      form.setFieldValue('index', customOption);
                      handleIndexNameChange(customOption);
                    }}
                    onBlur={() => {
                      form.setFieldTouched('index', true);
                    }}
                    onChange={(options) => {
                      form.setFieldValue('index', options);
                      form.setFieldValue('timeField', undefined);
                      form.setFieldValue(
                        'featureList',
                        INITIAL_TASK_VALUES.featureList
                      );
                      handleIndexNameChange(options);
                    }}
                    selectedOptions={field.value}
                    singleSelection={true}
                    isClearable={false}
                    renderOption={(option, searchValue, className) => (
                      <IndexOption
                        option={option}
                        searchValue={searchValue}
                        contentClassName={className}
                      />
                    )}
                  />
                </FormattedFormRow>
              );
            }}
          </Field>
          <EuiSpacer size="l" />
          <Field name="timeField" validate={required}>
            {({ field, form }: FieldProps) => (
              <FormattedFormRow
                title="Timestamp field"
                hint="Choose the time field you want to use for time filter."
                isInvalid={isInvalid(field.name, form)}
                error={getError(field.name, form)}
              >
                <EuiComboBox
                  id="timeField"
                  placeholder="Find timestamp"
                  options={timeStampFieldOptions}
                  onSearchChange={handleSearchChange}
                  onCreateOption={(createdOption: string) => {
                    const normalizedOptions = createdOption.trim();
                    if (!normalizedOptions) return;
                    form.setFieldValue('timeField', normalizedOptions);
                  }}
                  onBlur={() => {
                    form.setFieldTouched('timeField', true);
                  }}
                  onChange={(options) => {
                    form.setFieldValue('timeField', get(options, '0.label'));
                  }}
                  selectedOptions={
                    (field.value && [{ label: field.value }]) || []
                  }
                  singleSelection={true}
                  isClearable={false}
                />
              </FormattedFormRow>
            )}
          </Field>
          <EuiSpacer size="s" />
          <Features
            task={props.task}
            isLoading={props.isLoading}
            formikProps={props.formikProps}
          />
          <EuiSpacer size="s" />
          <Settings
            isLoading={props.isLoading}
            formikProps={props.formikProps}
          />
        </Fragment>
      )}
    </ContentPanel>
  );
}