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

interface TaskListActionsProps {
  onCompareTasks(): void;
  //   onStartTasks(): void;
  //   onStopTasks(): void;
  //   onDeleteTasks(): void;
  isActionsDisabled: boolean;
  isCompareDisabled: boolean;
  //   isStartDisabled: boolean;
  //   isStopDisabled: boolean;
}

export const TaskListActions = (props: TaskListActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
      <EuiFlexItem grow={false} style={{ marginRight: '16px' }}>
        <EuiPopover
          id="actionsPopover"
          button={
            <EuiButton
              data-test-subj="taskListActionsButton"
              disabled={props.isActionsDisabled}
              iconType="arrowDown"
              iconSide="right"
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
              key="compareTasks"
              data-test-subj="compareTasks"
              disabled={props.isCompareDisabled}
              onClick={props.onCompareTasks}
            >
              Compare
            </EuiContextMenuItem>
            {/* <EuiContextMenuItem
              key="startTasks"
              data-test-subj="startTasks"
              disabled={props.isStartDisabled}
              onClick={props.onStartTasks}
            >
              Start
            </EuiContextMenuItem>

            <EuiContextMenuItem
              key="stopTasks"
              data-test-subj="stopTasks"
              disabled={props.isStopDisabled}
              onClick={props.onStopTasks}
            >
              Stop
            </EuiContextMenuItem>

            <EuiContextMenuItem
              key="deleteTasks"
              data-test-subj="deleteTasks"
              onClick={props.onDeleteTasks}
            >
              Delete
            </EuiContextMenuItem> */}
          </EuiContextMenuPanel>
        </EuiPopover>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
