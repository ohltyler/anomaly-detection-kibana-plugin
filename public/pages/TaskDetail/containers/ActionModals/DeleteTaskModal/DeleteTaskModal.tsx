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

import React, { useState, Fragment } from 'react';
import {
  EuiText,
  EuiOverlayMask,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiCallOut,
} from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { Task } from '../../../../../models/interfaces';
import { ConfirmModal } from '../../../../DetectorDetail/components/ConfirmModal/ConfirmModal';
import { TASK_STATE } from '../../../../../utils/constants';

interface DeleteTaskModalProps {
  task: Task;
  onHide(): void;
  onStopTaskForDeleting(): void;
}

export const DeleteTaskModal = (props: DeleteTaskModalProps) => {
  const [deleteTyped, setDeleteTyped] = useState<boolean>(false);

  const taskIsRunningCallout =
    props.task.curState === TASK_STATE.RUNNING ? (
      <EuiCallOut
        title="The task is running. Are you sure you want to proceed?"
        color="warning"
        iconType="alert"
      ></EuiCallOut>
    ) : null;

  return (
    <EuiOverlayMask>
      <ConfirmModal
        title="Delete task?"
        description={
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiText>
                <p>
                  The task and task configuration will be permanently removed.
                  This action is irreversible. To confirm deletion, type{' '}
                  <i>delete</i> in the field.
                </p>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={true}>
              <EuiFieldText
                fullWidth={true}
                placeholder="delete"
                onChange={(e) => {
                  if (e.target.value === 'delete') {
                    setDeleteTyped(true);
                  } else {
                    setDeleteTyped(false);
                  }
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        callout={<Fragment>{taskIsRunningCallout}</Fragment>}
        confirmButtonText="Delete"
        confirmButtonColor="danger"
        confirmButtonDisabled={!deleteTyped}
        onClose={props.onHide}
        onCancel={props.onHide}
        onConfirm={() => props.onStopTaskForDeleting()}
      />
    </EuiOverlayMask>
  );
};
