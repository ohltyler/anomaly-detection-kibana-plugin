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

export interface TaskFormikValues {
  taskName: string;
  taskDescription: string;
  detectorId: string;
  startTime: number | string;
  endTime: number | string;
}

export const INITIAL_TASK_VALUES: TaskFormikValues = {
  taskName: '',
  taskDescription: '',
  detectorId: '',
  startTime: 'now-7d',
  endTime: 'now',
};

export const TASK_DATE_RANGE_COMMON_OPTIONS = [
  { start: 'now-24h', end: 'now', label: 'last 24 hours' },
  { start: 'now-7d', end: 'now', label: 'last 7 days' },
  { start: 'now-30d', end: 'now', label: 'last 30 days' },
  { start: 'now-90d', end: 'now', label: 'last 90 days' },

  { start: 'now/d', end: 'now', label: 'Today' },
  { start: 'now/w', end: 'now', label: 'Week to date' },
  { start: 'now/M', end: 'now', label: 'Month to date' },
  { start: 'now/y', end: 'now', label: 'Year to date' },
];

export enum SAVE_TASK_OPTIONS {
  START_TASK = 'start_task',
  KEEP_TASK_STOPPED = 'keep_task_stopped',
}
