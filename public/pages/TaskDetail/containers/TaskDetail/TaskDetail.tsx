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
import { useHideSideNavBar } from '../../../main/hooks/useHideSideNavBar';
import {
  startTask,
  stopTask,
  deleteTask,
} from '../../../../redux/reducers/task';
import { Listener } from '../../../../utils/utils';
//@ts-ignore
import chrome from 'ui/chrome';
import { darkModeEnabled } from '../../../../utils/kibanaUtils';
import { AppState } from '../../../../redux/reducers';
import { getTask } from '../../../../redux/reducers/task';
import { getDetector } from '../../../../redux/reducers/ad';
import { BREADCRUMBS, TASK_STATE } from '../../../../utils/constants';
import moment from 'moment';
import { TASK_STATE_COLOR } from '../../../utils/constants';
import { TaskConfig } from '../../components/TaskConfig/TaskConfig';
import { TaskResults } from '../../components/TaskResults/TaskResults';
import { TaskControls } from '../../components/TaskControls/TaskControls';
import { EditTaskModal } from '../ActionModals/EditTaskModal/EditTaskModal';
import { DeleteTaskModal } from '../ActionModals/DeleteTaskModal/DeleteTaskModal';
import { TASK_ACTION } from '../../../TaskList/utils/constants';

export interface TaskRouterProps {
  taskId?: string;
}
interface TaskDetailProps extends RouteComponentProps<TaskRouterProps> {}

interface TaskDetailModalState {
  isOpen: boolean;
  action: TASK_ACTION | undefined;
}

export const TaskDetail = (props: TaskDetailProps) => {
  const isDark = darkModeEnabled();
  useHideSideNavBar(true, false);
  const dispatch = useDispatch();
  const taskId: string = get(props, 'match.params.taskId', '');
  const taskState = useSelector((state: AppState) => state.task);
  const adState = useSelector((state: AppState) => state.ad);
  const allTasks = taskState.tasks;
  const errorGettingTasks = taskState.errorMessage;
  const task = allTasks[taskId];
  const detector = adState.detectors[task?.detectorId];
  const isLoading = taskState.requesting || adState.requesting;

  const [taskDetailModalState, setTaskDetailModalState] = useState<
    TaskDetailModalState
  >({
    isOpen: false,
    action: undefined,
  });

  console.log('all tasks: ', allTasks);

  useEffect(() => {
    if (errorGettingTasks) {
      toastNotifications.addDanger('Unable to get task');
      props.history.push('/tasks');
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
      dispatch(getTask(taskId));
    };
    if (taskId) {
      fetchTask(taskId);
    }
  }, []);

  // Try to get the corresponding detector initially
  useEffect(() => {
    const fetchDetector = async (detectorId: string) => {
      dispatch(getDetector(detectorId));
    };
    if (task) {
      fetchDetector(task.detectorId);
    }
  }, [task]);

  const handleDeleteAction = () => {
    setTaskDetailModalState({
      ...taskDetailModalState,
      isOpen: true,
      action: TASK_ACTION.DELETE,
    });
  };

  const handleEditAction = () => {
    task.curState === TASK_STATE.RUNNING
      ? setTaskDetailModalState({
          ...taskDetailModalState,
          isOpen: true,
          action: TASK_ACTION.EDIT,
        })
      : props.history.push(`/tasks/${taskId}/edit`);
  };

  const onStartTask = async () => {
    try {
      await dispatch(startTask(taskId));
      toastNotifications.addSuccess(`Task has been started successfully`);
    } catch (err) {
      toastNotifications.addDanger(
        `There was a problem starting the task: ${err}`
      );
    }
  };

  const onStopTask = async (isDelete: boolean, listener?: Listener) => {
    try {
      await dispatch(stopTask(taskId));
      if (!isDelete) {
        toastNotifications.addSuccess('Task has been stopped successfully');
      }
      if (listener) listener.onSuccess();
    } catch (err) {
      toastNotifications.addDanger(
        `There was a problem stopping the task: ${err}`
      );
      if (listener) listener.onException();
    }
  };

  const onDeleteTask = async () => {
    try {
      await dispatch(deleteTask(taskId));
      toastNotifications.addSuccess(`Task has been deleted successfully`);
      handleHideModal();
      props.history.push('/tasks');
    } catch (err) {
      toastNotifications.addDanger(
        `There was a problem deleting the task: ${err}`
      );
      handleHideModal();
    }
  };

  const onStopTaskForEditing = async () => {
    const listener: Listener = {
      onSuccess: () => {
        props.history.push(`/tasks/${taskId}/edit`);
        handleHideModal();
      },
      onException: handleHideModal,
    };
    onStopTask(false, listener);
  };

  const onStopTaskForDeleting = async () => {
    const listener: Listener = {
      onSuccess: onDeleteTask,
      onException: handleHideModal,
    };
    onStopTask(true, listener);
  };

  const handleHideModal = () => {
    setTaskDetailModalState({
      ...taskDetailModalState,
      isOpen: false,
      action: undefined,
    });
  };

  const getTaskDetailModal = () => {
    if (taskDetailModalState.isOpen) {
      switch (taskDetailModalState.action) {
        case TASK_ACTION.EDIT: {
          return (
            <EditTaskModal
              task={task}
              onHide={handleHideModal}
              onStopTaskForEditing={onStopTaskForEditing}
            />
          );
        }
        case TASK_ACTION.DELETE: {
          return (
            <DeleteTaskModal
              task={task}
              onHide={handleHideModal}
              onStopTaskForDeleting={onStopTaskForDeleting}
            />
          );
        }
        default: {
          return null;
        }
      }
    } else {
      return null;
    }
  };

  const lightStyles = {
    backgroundColor: '#FFF',
  };

  return (
    <React.Fragment>
      {!isEmpty(task) && !errorGettingTasks ? getTaskDetailModal() : null}
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
            style={{
              marginLeft: '12px',
              marginTop: '4px',
              marginRight: '12px',
            }}
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
              <TaskControls
                task={task}
                onEditTask={handleEditAction}
                onStartTask={onStartTask}
                onStopTask={onStopTask}
                onDeleteTask={handleDeleteAction}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <TaskConfig
                task={task}
                detector={detector}
                onEditTask={handleEditAction}
              />
            </EuiFlexItem>
            <EuiFlexItem style={{ marginTop: '-32px' }}>
              <TaskResults task={task} isLoading={isLoading} />
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
