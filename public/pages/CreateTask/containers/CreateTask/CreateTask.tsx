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
import { BREADCRUMBS } from '../../../../utils/constants';
import { MAX_TASKS } from '../../../utils/constants';
import { AppState } from '../../../../redux/reducers';
import { RouteComponentProps } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useHideSideNavBar } from '../../../main/hooks/useHideSideNavBar';
import { TaskInfo } from '../../components/TaskInfo/TaskInfo';
import { DetectorSource } from '../../components/DetectorSource/DetectorSource';
import { DateRangePicker } from '../../components/DateRangePicker/DateRangePicker';
import { TaskFormikValues } from '../../utils/constants';
import { formikToTask, taskToFormik } from '../../utils/helpers';
//@ts-ignore
import chrome from 'ui/chrome';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import { getDetector, updateDetector } from '../../../../redux/reducers/ad';
import {
  createTask,
  getTask,
  updateTask,
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

  // const task = {
  //   dataStartTime: 1598400591419,
  //   dataEndTime: 1599610191420,
  // } as Task;
  const isRequesting = useSelector((state: AppState) => state.ad.requesting);

  const initialStartDate = moment().subtract(7, 'days').valueOf();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: moment().subtract(7, 'days').valueOf(),
    endDate: moment().valueOf(),
  });

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

  // Using the task-specified date range (if it exists)
  useEffect(() => {
    console.log('task changed');
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

  // TODO: stub for now
  const handleUpdate = async (taskToUpdate: Task) => {
    try {
      await dispatch(updateTask(taskId, taskToUpdate));
      toastNotifications.addSuccess(`Task updated: ${taskToUpdate.name}`);
      props.history.push(`/tasks/${taskId}/details/`);
    } catch (err) {
      toastNotifications.addDanger(
        `There was a problem updating the task: ${err}`
      );
    }
  };

  const handleCreate = async (taskToCreate: Task) => {
    try {
      const taskResp = await dispatch(createTask(taskToCreate));
      toastNotifications.addSuccess(
        `Task created: ${taskResp.data.response.name}`
      );
      props.history.push(`/tasks/${taskResp.data.response.id}/details`);
    } catch (err) {
      toastNotifications.addDanger(
        `There was a problem creating the task: ${err}`
      );
    }
  };

  const handleSubmit = async (values: TaskFormikValues, formikBag: any) => {
    const apiRequest = formikToTask(values, task);
    console.log('api request: ', apiRequest);
    try {
      if (props.isEdit) {
        await handleUpdate(apiRequest);
      } else {
        await handleCreate(apiRequest);
      }
      formikBag.setSubmitting(false);
    } catch (e) {
      formikBag.setSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    taskId
      ? props.history.push(`/tasks/${taskId}/configurations`)
      : props.history.push('/tasks');
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
        >
          {(formikProps) => (
            <Fragment>
              <TaskInfo
                onValidateTaskName={handleValidateName}
                onValidateTaskDescription={handleValidateDescription}
              />
              <EuiSpacer />
              <DetectorSource />
              <EuiSpacer />
              <DateRangePicker isLoading={isRequesting} />
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
                    onClick={formikProps.handleSubmit}
                  >
                    {props.isEdit ? 'Save changes' : 'Create'}
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
