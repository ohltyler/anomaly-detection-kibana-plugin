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
import { Task } from '../../../../../models/interfaces';
import { EuiSpacer } from '@elastic/eui';

interface StopTaskModalProps {
  task: Task;
  onHide(): void;
  isListLoading: boolean;
}

export const StopTaskModal = (props: StopTaskModalProps) => {
  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.onHide}>
        <EuiModalHeader>
          <EuiFlexGroup direction="column" gutterSize="s">
            <EuiFlexItem></EuiFlexItem>
            <EuiFlexItem>
              <EuiModalHeaderTitle>
                {'Stop task to proceed?'}&nbsp;
              </EuiModalHeaderTitle>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiText>Placeholder for stopping task here</EuiText>>
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
