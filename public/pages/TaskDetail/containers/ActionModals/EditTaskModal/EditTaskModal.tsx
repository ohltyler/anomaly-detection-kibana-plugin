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

import React from 'react';
import {
  EuiText,
  EuiOverlayMask,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { Task } from '../../../../../models/interfaces';
import { ConfirmModal } from '../../../../DetectorDetail/components/ConfirmModal/ConfirmModal';

interface EditTaskModalProps {
  task: Task;
  onHide(): void;
  onStopTaskForEditing(): void;
}

export const EditTaskModal = (props: EditTaskModalProps) => {
  return (
    <EuiOverlayMask>
      <ConfirmModal
        title="Stop task to proceed?"
        description={
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiText>
                <p>
                  The task needs to stop before you can edit the configuration.
                  Make sure to restart the task after making changes.
                </p>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        confirmButtonText="Stop and proceed to edit"
        confirmButtonColor="primary"
        confirmButtonDisabled={false}
        onClose={props.onHide}
        onCancel={props.onHide}
        onConfirm={() => props.onStopTaskForEditing()}
      />
    </EuiOverlayMask>
  );
};
