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
  EuiButton,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
} from '@elastic/eui';
import { Task } from '../../../../models/interfaces';
import { Listener } from '../../../../utils/utils';

interface TaskControlsProps {
  task: Task;
  onEditTask(): void;
  onStartTask(): void;
  onStopTask: (listener?: Listener) => void;
  onDeleteTask(): void;
}
export const TaskControls = (props: TaskControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
      <EuiFlexItem grow={false} style={{ marginRight: '16px' }}>
        <EuiPopover
          id="actionsPopover"
          button={
            <EuiButton
              iconType="arrowDown"
              iconSide="right"
              data-test-subj="actionsButton"
              onClick={() => setIsOpen(!isOpen)}
            >
              Actions
            </EuiButton>
          }
          panelPaddingSize="none"
          anchorPosition="downLeft"
          isOpen={isOpen}
          closePopover={() => setIsOpen(false)}
        >
          <EuiContextMenuPanel>
            <EuiContextMenuItem
              key="editTask"
              data-test-subj="editTaskItem"
              onClick={props.onEditTask}
            >
              Edit task
            </EuiContextMenuItem>
            <EuiContextMenuItem
              key="deleteDetector"
              data-test-subj="deleteDetector"
              onClick={props.onDeleteTask}
            >
              Delete task
            </EuiContextMenuItem>
          </EuiContextMenuPanel>
        </EuiPopover>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ marginLeft: '0px' }}>
        {props.task.enabled ? (
          <EuiButton
            data-test-subj="stopTaskButton"
            onClick={() => props.onStopTask(undefined)}
            iconType={'stop'}
          >
            Stop task
          </EuiButton>
        ) : (
          <EuiButton
            data-test-subj="startTaskButton"
            onClick={props.onStartTask}
            iconType={'play'}
          >
            Start task
          </EuiButton>
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
