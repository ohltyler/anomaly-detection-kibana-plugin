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

import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import {
  //@ts-ignore
  EuiFlexGrid,
  EuiFlexItem,
  EuiText,
  EuiFormRow,
  EuiButton,
  EuiFormRowProps,
} from '@elastic/eui';
import { Task, Detector } from '../../../../models/interfaces';
import React from 'react';
import moment from 'moment';

interface TaskConfigProps {
  task: Task;
  detector: Detector;
  onEditTask(): void;
}

const FixedWidthRow = (props: EuiFormRowProps) => (
  <EuiFormRow {...props} style={{ width: '250px' }} />
);

const renderCell = (title: string, description: string) => {
  return (
    <FixedWidthRow label={title}>
      <EuiText>
        <p className="enabled">{description}</p>
      </EuiText>
    </FixedWidthRow>
  );
};

const renderDate = (obj: any) => {
  if (typeof obj == 'number') {
    return moment(obj).format('MM/DD/YYYY hh:mm A');
  } else {
    return '-';
  }
};

export const TaskConfig = (props: TaskConfigProps) => {
  return (
    <ContentPanel
      title="Task configuration"
      titleSize="s"
      panelStyles={{ margin: '24px' }}
      actions={[<EuiButton onClick={props.onEditTask}>Edit</EuiButton>]}
    >
      <EuiFlexGrid columns={3} gutterSize="l" style={{ border: 'none' }}>
        <EuiFlexItem>{renderCell('Name', props.task.name)}</EuiFlexItem>
        <EuiFlexItem>{renderCell('ID', props.task.id)}</EuiFlexItem>
        <EuiFlexItem>
          {renderCell(
            'Date range',
            renderDate(props.task.dataStartTime) +
              '-' +
              renderDate(props.task.dataEndTime)
          )}
        </EuiFlexItem>
        <EuiFlexItem>
          {renderCell('Description', props.task.description)}
        </EuiFlexItem>
        <EuiFlexItem>
          {renderCell('Detector', props.detector ? props.detector.name : '-')}
        </EuiFlexItem>
      </EuiFlexGrid>
    </ContentPanel>
  );
};
