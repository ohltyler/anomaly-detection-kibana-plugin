/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiEmptyPrompt,
  EuiText,
} from '@elastic/eui';
import React from 'react';
import { APP_PATH, PLUGIN_NAME } from '../../../../utils/constants';

const filterText =
  'There are no detectors matching your applied filters. Reset your filters to view all detectors.';
const emptyText =
  'Anomaly detectors take an input of information and discover patterns of anomalies. Create an anomaly detector to get started.';

interface EmptyDetectorProps {
  isFilterApplied: boolean;
  onResetFilters: () => void;
}

export const EmptyDetectorMessage = (props: EmptyDetectorProps) => (
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
          data-test-subj="resetListFilters"
        >
          Reset filters
        </EuiButton>
      ) : (
        <EuiFlexGroup direction="row" gutterSize="m" justifyContent="center">
          <EuiFlexItem grow={false}>
            <EuiButton
              style={{ width: '200px' }}
              href={`${PLUGIN_NAME}#${APP_PATH.SAMPLE_DETECTORS}`}
              data-test-subj="sampleDetectorButton"
            >
              Try a sample detector
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              style={{ width: '200px' }}
              fill
              href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}
              data-test-subj="createDetectorButton"
            >
              Create detector
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      )
    }
  />
);
