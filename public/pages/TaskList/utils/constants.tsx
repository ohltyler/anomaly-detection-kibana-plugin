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
  EuiLink,
  EuiText,
  EuiToolTip,
  EuiHealth,
  EuiBasicTableColumn,
} from '@elastic/eui';
//@ts-ignore
import moment from 'moment';
import React from 'react';
import { Task } from '../../../models/interfaces';
import { PLUGIN_NAME, TASK_STATE } from '../../../utils/constants';
import { taskStateToColorMap } from '../../utils/constants';

const DEFAULT_EMPTY_DATA = '-';
const columnStyle = {
  overflow: 'visible',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
} as React.CSSProperties;

const renderTime = (time: number) => {
  const momentTime = moment(time);
  if (time && momentTime.isValid())
    return momentTime.format('MM/DD/YYYY h:mm A');
  return DEFAULT_EMPTY_DATA;
};

const renderState = (state: TASK_STATE) => {
  return (
    //@ts-ignore
    <EuiHealth color={taskStateToColorMap.get(state)}>{state}</EuiHealth>
  );
};

export const taskListColumns = [
  {
    field: 'name',
    name: (
      <EuiToolTip content="The name of the task">
        <span style={columnStyle}>Task{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    truncateText: false,
    textOnly: true,
    align: 'left',
    render: (name: string, task: Task) => (
      <EuiLink href={`${PLUGIN_NAME}#/tasks/${task.id}/details`}>
        {name}
      </EuiLink>
    ),
  },
  {
    field: 'detectorName',
    name: (
      <EuiToolTip content="The detector used to create the task">
        <span style={columnStyle}>Detector{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    truncateText: false,
    textOnly: true,
    align: 'left',
    render: (detectorName: string) => (
      <EuiText size="s">{detectorName}</EuiText>
    ),
  },
  {
    field: 'curState',
    name: (
      <EuiToolTip content="The current state of the task">
        <span style={columnStyle}>Task state{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'string',
    align: 'left',
    truncateText: false,
    render: renderState,
  },
  {
    field: 'created',
    name: (
      <EuiToolTip content="The date the task was created">
        <span style={columnStyle}>Created{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'date',
    truncateText: false,
    align: 'left',
    render: renderTime,
  },
  {
    field: 'lastRun',
    name: (
      <EuiToolTip content="The time the task was last run">
        <span style={columnStyle}>Last run{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'date',
    truncateText: false,
    align: 'left',
    render: renderTime,
  },
] as EuiBasicTableColumn<any>[];

export enum TASK_ACTION {
  COMPARE,
  START,
  STOP,
  DELETE,
}
