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

import { EuiPage, EuiPageBody, EuiText } from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { BREADCRUMBS } from '../../../../utils/constants';
import { MAX_TASKS } from '../../../utils/constants';
import { RouteComponentProps } from 'react-router';
import { useHideSideNavBar } from '../../../main/hooks/useHideSideNavBar';

//@ts-ignore
import chrome from 'ui/chrome';
//@ts-ignore
import { toastNotifications } from 'ui/notify';

interface CreateRouterProps {
  taskId?: string;
}

interface CreateTaskProps extends RouteComponentProps<CreateRouterProps> {
  isEdit: boolean;
}

export function CreateTask(props: CreateTaskProps) {
  useHideSideNavBar(true, false);
  //Set breadcrumbs based on Create / Update
  useEffect(() => {
    const createOrEditBreadcrumb = props.isEdit
      ? BREADCRUMBS.EDIT_TASK
      : BREADCRUMBS.CREATE_TASK;
    let breadCrumbs = [
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.TASKS,
      createOrEditBreadcrumb,
    ];
    // if (task && task.name) {
    //   breadCrumbs.splice(2, 0, {
    //     text: task.name,
    //     //@ts-ignore
    //     href: `#/tasks/${detectorId}`,
    //   });
    // }
    chrome.breadcrumbs.set(breadCrumbs);
  });

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiText>
          <p>Create/edit task placeholder</p>
        </EuiText>
      </EuiPageBody>
    </EuiPage>
  );
}
