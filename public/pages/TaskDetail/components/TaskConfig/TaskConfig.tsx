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
  EuiLink,
  EuiButton,
  EuiFormRowProps,
} from '@elastic/eui';
import { PLUGIN_NAME } from '../../../../utils/constants';
import { Task } from '../../../../models/interfaces';
import React, { Component, FunctionComponent } from 'react';
import moment from 'moment';

interface TaskConfigProps {
  taskId: string;
  task: Task;
  onEditTask(): void;
}

const FixedWidthRow = (props: EuiFormRowProps) => (
  <EuiFormRow {...props} style={{ width: '250px' }} />
);

interface ConfigCellProps {
  title: string;
  description: string;
}

const ConfigCell: FunctionComponent<ConfigCellProps> = (
  props: ConfigCellProps
) => {
  return (
    <FixedWidthRow label={props.title}>
      <EuiText>
        <p className="enabled">{props.description}</p>
      </EuiText>
    </FixedWidthRow>
  );
};

export function toString(obj: any): string {
  if (typeof obj != 'undefined') {
    if (obj.hasOwnProperty('period')) {
      let period = obj.period;
      return period.interval + ' ' + period.unit;
    } else if (typeof obj == 'number') {
      // epoch
      return moment(obj).format('MM/DD/YY hh:mm A');
    }
  }
  return '-';
}

export const TaskConfig = (props: TaskConfigProps) => {
  return (
    <ContentPanel
      title="Task configuration"
      titleSize="s"
      actions={[<EuiButton onClick={props.onEditTask}>Edit</EuiButton>]}
    >
      <EuiFlexGrid columns={3} gutterSize="l" style={{ border: 'none' }}>
        <EuiFlexItem>
          <ConfigCell title="Name" description={props.task.name} />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell title="ID" description={props.task.id} />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell
            title="Date range"
            description={
              toString(props.task.dataStartTime) +
              '-' +
              toString(props.task.dataEndTime)
            }
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell
            title="Description"
            description={props.task.description}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell title="Detector" description={props.task.detectorId} />
        </EuiFlexItem>
      </EuiFlexGrid>
    </ContentPanel>
  );
};
