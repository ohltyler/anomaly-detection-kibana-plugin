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
import { EuiLink, EuiText, EuiIcon, EuiDataGrid } from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { Monitor } from '../../../../../models/interfaces';
import { TaskListItem } from '../../../../../models/interfaces';
import { PLUGIN_NAME } from '../../../../../utils/constants';
import { get, isEmpty } from 'lodash';
import { TASK_STATE } from '../../../../../utils/constants';

const getNames = (tasks: TaskListItem[]) => {
  let data = [];
  for (let i = 0; i < tasks.length; i++) {
    data.push({
      Task: (
        <EuiLink href={`${PLUGIN_NAME}#/tasks/${tasks[i].id}`} target="_blank">
          {tasks[i].name} <EuiIcon type="popout" size="s" />
        </EuiLink>
      ),
    });
  }
  return data;
};

export const getNamesGrid = (tasks: TaskListItem[]) => {
  const gridData = getNames(tasks);
  return (
    <EuiDataGrid
      aria-label="Task names"
      columns={[
        {
          id: 'Task',
          isResizable: false,
          isExpandable: false,
          isSortable: false,
        },
      ]}
      columnVisibility={{
        visibleColumns: ['Task'],
        setVisibleColumns: () => {},
      }}
      rowCount={gridData.length}
      renderCellValue={({ rowIndex, columnId }) =>
        //@ts-ignore
        gridData[rowIndex][columnId]
      }
      gridStyle={{
        border: 'horizontal',
        header: 'shade',
        rowHover: 'highlight',
        stripes: true,
      }}
      toolbarVisibility={false}
    />
  );
};
