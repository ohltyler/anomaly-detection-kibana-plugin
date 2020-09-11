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

import React, { useState } from 'react';
import {
  EuiText,
  EuiOverlayMask,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCallOut,
  EuiModal,
  EuiModalHeader,
  EuiModalFooter,
  EuiModalBody,
  EuiModalHeaderTitle,
  EuiLoadingSpinner,
} from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { TaskListItem } from '../../../../../models/interfaces';
import { EuiSpacer } from '@elastic/eui';
import { getNamesGrid } from '../utils/helpers';

interface CompareTasksModalProps {
  tasks: TaskListItem[];
  onHide(): void;
  isListLoading: boolean;
}

export const CompareTasksModal = (props: CompareTasksModalProps) => {
  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.onHide}>
        <EuiModalHeader>
          <EuiFlexGroup direction="column" gutterSize="s">
            <EuiFlexItem>
              <EuiCallOut
                title="Only finished tasks are currently eligible for comparison"
                color="primary"
                iconType="iInCircle"
              ></EuiCallOut>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiModalHeaderTitle>{'Compare tasks'}&nbsp;</EuiModalHeaderTitle>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiText>The following tasks will be compared.</EuiText>
          <EuiSpacer size="s" />
          <div>
            {props.isListLoading ? (
              <EuiLoadingSpinner size="xl" />
            ) : (
              getNamesGrid(props.tasks)
            )}
          </div>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty data-test-subj="cancelButton" onClick={props.onHide}>
            Close
          </EuiButtonEmpty>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};
