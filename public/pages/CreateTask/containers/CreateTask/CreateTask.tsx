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
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { Formik } from 'formik';
import { get, isEmpty } from 'lodash';
import React, { Fragment, useEffect, useState } from 'react';
import { BREADCRUMBS, TASK_STATE } from '../../../../utils/constants';
import { MAX_TASKS } from '../../../utils/constants';
import { AppState } from '../../../../redux/reducers';
import { getMappings } from '../../../../redux/reducers/elasticsearch';
import { RouteComponentProps } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useHideSideNavBar } from '../../../main/hooks/useHideSideNavBar';
import { TaskInfo } from '../../components/TaskInfo/TaskInfo';
import { DataSource } from '../../components/DataSource/DataSource';
import { Features } from '../../components/Features/Features';
import { Settings } from '../../components/Settings/Settings';
import { ConfirmStartModal } from '../../components/ConfirmStartModal/ConfirmStartModal';
import { TaskFormikValues, SAVE_TASK_OPTIONS } from '../../utils/constants';
import { formikToTask, taskToFormik } from '../../utils/helpers';
//@ts-ignore
import chrome from 'ui/chrome';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import {
  createTask,
  getTask,
  updateTask,
  startTask,
} from '../../../../redux/reducers/task';
import moment from 'moment';
import { Task, DateRange } from '../../../../models/interfaces';

interface CreateRouterProps {
  taskId?: string;
}

interface CreateTaskProps extends RouteComponentProps<CreateRouterProps> {
  isEdit: boolean;
}

export function CreateTask(props: CreateTaskProps) {
  const dispatch = useDispatch();
  const taskId: string = get(props, 'match.params.taskId', '');
  const taskState = useSelector((state: AppState) => state.task);
  const tasks = taskState.tasks;
  const task = tasks[taskId];
  const errorGettingTask = taskState.errorMessage;

  console.log('task id: ', taskId);

  const isRequesting = useSelector((state: AppState) => state.ad.requesting);

  const initialStartDate = moment().subtract(7, 'days').valueOf();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: moment().subtract(7, 'days').valueOf(),
    endDate: moment().valueOf(),
  });
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [saveTaskOption, setSaveTaskOption] = useState<SAVE_TASK_OPTIONS>(
    SAVE_TASK_OPTIONS.START_TASK
  );

  console.log('create task - task: ', task);

  useHideSideNavBar(true, false);

  // Set breadcrumbs based on Create / Update
  useEffect(() => {
    const createOrEditBreadcrumb = props.isEdit
      ? BREADCRUMBS.EDIT_TASK
      : BREADCRUMBS.CREATE_TASK;
    let breadCrumbs = [
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.TASKS,
      createOrEditBreadcrumb,
    ];
    if (task && task.name) {
      breadCrumbs.splice(2, 0, {
        text: task.name,
        //@ts-ignore
        href: `#/tasks/${taskId}/details`,
      });
    }
    chrome.breadcrumbs.set(breadCrumbs);
  });
  // If no detector found with ID, redirect it to list
  useEffect(() => {
    if (props.isEdit && errorGettingTask) {
      toastNotifications.addDanger('Unable to find task for editing');
      props.history.push(`/tasks`);
    }
  }, [props.isEdit]);

  // Try to get the task initially
  useEffect(() => {
    const fetchTask = async (taskId: string) => {
      dispatch(getTask(taskId));
    };
    if (taskId) {
      fetchTask(taskId);
    }
  }, []);

  // Get corresponding index mappings if there is an existing task
  useEffect(() => {
    const fetchIndexMappings = async (index: string) => {
      dispatch(getMappings(index));
    };
    if (task) {
      fetchIndexMappings(task.indices[0]);
    }
  }, [task]);

  // Using the task-specified date range (if it exists)
  useEffect(() => {
    if (task?.dataStartTime && task?.dataEndTime) {
      setDateRange({
        startDate: task.dataStartTime,
        endDate: task.dataEndTime,
      });
    }
  }, [task]);

  // TODO: stub for now. Will want to make sure no duplicates can be created
  const handleValidateName = async (taskName: string) => {
    if (taskName.length === 0) {
      return 'Required';
    }
    return undefined;
  };

  const handleValidateDescription = async (taskDescription: string) => {
    if (taskDescription.length > 400) {
      throw 'Description should not exceed 400 characters';
    }
    return undefined;
  };

  const handleUpdate = async (
    taskToUpdate: Task,
    option: SAVE_TASK_OPTIONS
  ) => {
    try {
      await dispatch(updateTask(taskId, taskToUpdate));
      if (option === SAVE_TASK_OPTIONS.KEEP_TASK_STOPPED) {
        toastNotifications.addSuccess(`Task updated: ${taskToUpdate.name}`);
      } else {
        await dispatch(startTask(taskId));
        toastNotifications.addSuccess(`Task has been started successfully`);
      }
      props.history.push(`/tasks/${taskId}/details/`);
    } catch (err) {
      if (option === SAVE_TASK_OPTIONS.KEEP_TASK_STOPPED) {
        toastNotifications.addDanger(
          `There was a problem updating the task: ${err}`
        );
      } else {
        toastNotifications.addDanger(
          `There was a problem updating and starting the task: ${err}`
        );
      }
    }
  };

  const handleCreate = async (
    taskToCreate: Task,
    option: SAVE_TASK_OPTIONS
  ) => {
    try {
      const response = await dispatch(createTask(taskToCreate));
      const createdTaskId = response.data.response.id;
      if (option === SAVE_TASK_OPTIONS.KEEP_TASK_STOPPED) {
        toastNotifications.addSuccess(`Task created: ${taskToCreate.name}`);
      } else {
        await dispatch(startTask(createdTaskId));
        toastNotifications.addSuccess(`Task has been started successfully`);
      }
      props.history.push(`/tasks/${createdTaskId}/details/`);
    } catch (err) {
      if (option === SAVE_TASK_OPTIONS.KEEP_TASK_STOPPED) {
        toastNotifications.addDanger(
          `There was a problem creating the task: ${err}`
        );
      } else {
        toastNotifications.addDanger(
          `There was a problem creating and starting the task: ${err}`
        );
      }
    }
  };

  const handleSubmit = async (values: TaskFormikValues, formikBag: any) => {
    const apiRequest = formikToTask(values, task);
    console.log('api request: ', apiRequest);
    try {
      if (props.isEdit) {
        await handleUpdate(apiRequest, saveTaskOption);
      } else {
        await handleCreate(apiRequest, saveTaskOption);
      }
      formikBag.setSubmitting(false);
    } catch (e) {
      formikBag.setSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    taskId
      ? props.history.push(`/tasks/${taskId}/details`)
      : props.history.push('/tasks');
  };

  const handleSaveTaskOptionChange = (option: SAVE_TASK_OPTIONS) => {
    setSaveTaskOption(option);
  };

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>{props.isEdit ? 'Edit task' : 'Create task'} </h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>
        <Formik
          enableReinitialize={true}
          initialValues={taskToFormik(task)}
          onSubmit={handleSubmit}
          isInitialValid={props.isEdit ? true : false}
          //validate={validateInputs}
        >
          {(formikProps) => (
            <Fragment>
              {showConfirmModal ? (
                <ConfirmStartModal
                  selectedOption={saveTaskOption}
                  onCancel={() => setShowConfirmModal(false)}
                  onConfirm={() => {
                    formikProps.handleSubmit();
                    setShowConfirmModal(false);
                  }}
                  onOptionChange={handleSaveTaskOptionChange}
                />
              ) : null}
              <TaskInfo
                onValidateTaskName={handleValidateName}
                onValidateTaskDescription={handleValidateDescription}
              />
              <EuiSpacer />
              <DataSource isLoading={isRequesting} formikProps={formikProps} />
              <EuiSpacer />
              <Features
                task={task}
                isLoading={isRequesting}
                formikProps={formikProps}
              />
              <EuiSpacer />
              <Settings isLoading={isRequesting} formikProps={formikProps} />
              <EuiSpacer />
              <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty onClick={handleCancelClick}>
                    Cancel
                  </EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    fill
                    type="submit"
                    isLoading={formikProps.isSubmitting}
                    //@ts-ignore
                    onClick={() => {
                      if (
                        props.isEdit &&
                        task.curState === TASK_STATE.RUNNING
                      ) {
                        toastNotifications.addDanger(
                          'Task cannot be updated while the task is running'
                        );
                      } else {
                        // validate on all of the fields (except date range)
                        formikProps.validateForm();
                        if (
                          formikProps.isValid &&
                          formikProps.values.rangeValid
                        ) {
                          setShowConfirmModal(true);
                        } else {
                          toastNotifications.addDanger(
                            'One or more input fields is invalid'
                          );
                        }
                      }
                    }}
                  >
                    {props.isEdit
                      ? 'Save and start task'
                      : 'Create and start task'}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </Fragment>
          )}
        </Formik>
      </EuiPageBody>
    </EuiPage>
  );
}
