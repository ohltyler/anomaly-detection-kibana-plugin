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

import { EuiButton, EuiEmptyPrompt, EuiText } from '@elastic/eui';
import React from 'react';
import { CreateDetectorButtons } from '../../../../components/CreateDetectorButtons/CreateDetectorButtons';

const filterText =
  'There are no tasks matching your applied filters. Reset your filters to view all tasks.';
const emptyText =
  'Historical analysis will allow you to observe patterns in your anomalies to see if there are any trending or distribution changes. Create an analysis to get started.';

interface EmptyTaskProps {
  isFilterApplied: boolean;
  onResetFilters: () => void;
}

export const EmptyTaskMessage = (props: EmptyTaskProps) => (
  <EuiEmptyPrompt
    style={{ maxWidth: '45em' }}
    body={
      <EuiText>
        <p>{props.isFilterApplied ? filterText : emptyText}</p>
      </EuiText>
    }
    actions={
      props.isFilterApplied ? (
        <EuiButton
          fill
          onClick={props.onResetFilters}
          data-test-subj="resetTaskListFilters"
        >
          Reset filters
        </EuiButton>
      ) : (
        <CreateDetectorButtons />
      )
    }
  />
);
