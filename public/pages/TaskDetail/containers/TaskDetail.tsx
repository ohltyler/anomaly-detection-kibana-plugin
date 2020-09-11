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

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import {
  EuiTabs,
  EuiTab,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiHealth,
  EuiOverlayMask,
  EuiCallOut,
  EuiSpacer,
  EuiText,
  EuiFieldText,
  EuiLoadingSpinner,
  EuiEmptyPrompt,
} from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import { get, isEmpty } from 'lodash';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import {
  deleteDetector,
  startDetector,
  stopDetector,
} from '../../../redux/reducers/ad';
import { getErrorMessage, Listener } from '../../../utils/utils';
//@ts-ignore
import chrome from 'ui/chrome';
import { darkModeEnabled } from '../../../utils/kibanaUtils';
import { AppState } from '../../../redux/reducers';
import { getTask } from '../../../redux/reducers/task';
import { BREADCRUMBS, TASK_STATE } from '../../../utils/constants';
import moment from 'moment';
import { TASK_STATE_COLOR } from '../../utils/constants';
import { TaskConfig } from '../components/TaskConfig/TaskConfig';

export interface TaskRouterProps {
  taskId?: string;
}
interface TaskDetailProps extends RouteComponentProps<TaskRouterProps> {}

export const TaskDetail = (props: TaskDetailProps) => {
  const dispatch = useDispatch();
  const taskId: string = get(props, 'match.params.taskId', '');
  const taskState = useSelector((state: AppState) => state.task);
  const allTasks = taskState.tasks;
  const errorGettingTasks = taskState.errorMessage;
  const task = allTasks[taskId];

  console.log('task id (from url): ', taskId);
  console.log('all tasks: ', allTasks);

  const isDark = darkModeEnabled();

  useHideSideNavBar(true, false);

  useEffect(() => {
    if (errorGettingTasks) {
      toastNotifications.addDanger('Unable to get task');
      props.history.push('/detectors');
    }
  }, [errorGettingTasks]);

  useEffect(() => {
    if (task) {
      chrome.breadcrumbs.set([
        BREADCRUMBS.ANOMALY_DETECTOR,
        BREADCRUMBS.TASKS,
        { text: task ? task.name : '' },
      ]);
    }
  }, [task]);

  // Try to get the task initially
  useEffect(() => {
    const fetchTask = async (taskId: string) => {
      // TODO: change to getTask() when implemented
      dispatch(getTask(taskId));
    };
    if (taskId) {
      fetchTask(taskId);
    }
  }, []);

  const onEditTask = () => {
    console.log('placeholder for editing the task');
  };

  const lightStyles = {
    backgroundColor: '#FFF',
  };

  return (
    <React.Fragment>
      {!isEmpty(task) && !errorGettingTasks ? (
        <EuiFlexGroup
          direction="column"
          style={{
            ...(isDark
              ? { flexGrow: 'unset' }
              : { ...lightStyles, flexGrow: 'unset' }),
          }}
        >
          <EuiFlexGroup
            justifyContent="spaceBetween"
            style={{ padding: '10px' }}
          >
            <EuiFlexItem grow={false}>
              <EuiTitle size="l">
                <h1>
                  {task && task.name}{' '}
                  {
                    <EuiHealth color={TASK_STATE_COLOR.RUNNING}>
                      Placeholder for handling state logic
                    </EuiHealth>
                  }
                </h1>
              </EuiTitle>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              {
                //TODO: add task controls here}
              }
              {/* <DetectorControls
                onEditDetector={handleEditDetector}
                onDelete={() =>
                  setDetectorDetailModel({
                    ...detectorDetailModel,
                    showDeleteDetectorModal: true,
                  })
                }
                onStartDetector={() => handleStartAdJob(detectorId)}
                onStopDetector={() =>
                  monitor
                    ? setDetectorDetailModel({
                        ...detectorDetailModel,
                        showMonitorCalloutModal: true,
                      })
                    : handleStopAdJob(detectorId)
                }
                onEditFeatures={handleEditFeature}
                detector={detector}
              /> */}
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem>
              <TaskConfig taskId={taskId} task={task} onEditTask={onEditTask} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      ) : (
        <div>
          <EuiLoadingSpinner size="xl" />
        </div>
      )}
    </React.Fragment>
  );
};
