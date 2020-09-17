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

//@ts-ignore
import moment from 'moment';
import React from 'react';
import {
  EuiIcon,
  EuiCallOut,
  EuiFlexGroup,
  EuiLoadingSpinner,
  EuiText,
} from '@elastic/eui';
import { Task, Detector } from '../../../models/interfaces';
import { TASK_STATE } from '../../../utils/constants';

export const getCallout = (task: Task) => {
  if (!task || !task.curState) {
    return null;
  }
  switch (task.curState) {
    case TASK_STATE.DISABLED:
      return (
        <EuiCallOut
          title="The task is stopped"
          color="primary"
          iconType="alert"
        />
      );
    case TASK_STATE.RUNNING:
      return (
        <EuiCallOut
          title={
            <div>
              <EuiFlexGroup direction="row" gutterSize="xs">
                <EuiLoadingSpinner size="l" style={{ marginRight: '8px' }} />
                <EuiText>
                  <p>Running the task</p>
                </EuiText>
              </EuiFlexGroup>
            </div>
          }
          color="primary"
        />
      );
    default:
      return null;
  }
};
