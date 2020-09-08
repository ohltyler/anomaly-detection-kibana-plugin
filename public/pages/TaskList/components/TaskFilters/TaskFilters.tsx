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
  EuiComboBox,
  EuiComboBoxOptionProps,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPagination,
} from '@elastic/eui';
import React from 'react';
import { getTaskStateOptions } from '../../utils/helpers';
import { TASK_STATE } from '../../../../utils/constants';

interface TaskListFiltersProps {
  activePage: number;
  pageCount: number;
  search: string;
  selectedTaskStates: TASK_STATE[];
  onTaskStateChange: (options: EuiComboBoxOptionProps[]) => void;
  onSearchTaskChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageClick: (pageNumber: number) => void;
}
export function TaskFilters(props: TaskListFiltersProps) {
  return (
    <EuiFlexGroup gutterSize="s">
      <EuiFlexItem grow={false} style={{ width: '60%' }}>
        <EuiFieldSearch
          fullWidth={true}
          value={props.search}
          placeholder="Search"
          onChange={props.onSearchTaskChange}
          data-test-subj="taskListSearch"
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiComboBox
          id="selectedTaskStates"
          data-test-subj="taskStateFilter"
          placeholder="All task states"
          isClearable={true}
          singleSelection={false}
          options={getTaskStateOptions()}
          onChange={props.onTaskStateChange}
          selectedOptions={
            props.selectedTaskStates.length > 0
              ? props.selectedTaskStates.map((state) => ({ label: state }))
              : []
          }
          fullWidth={true}
        />
      </EuiFlexItem>
      {props.pageCount > 1 ? (
        <EuiFlexItem grow={false} style={{ justifyContent: 'center' }}>
          <EuiPagination
            pageCount={props.pageCount}
            activePage={props.activePage}
            onPageClick={props.onPageClick}
            data-test-subj="taskListPageControls"
          />
        </EuiFlexItem>
      ) : null}
    </EuiFlexGroup>
  );
}
