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
import { EuiIcon } from '@elastic/eui';
import { TaskAnomalySummary } from '../../../models/interfaces';

// Current backend implementation (not finalized): limited to running model on 1000 intervals every 6s.
// Frontend should refresh at this rate to always show updated task progress / partial anomaly results, etc.
export const TASK_RESULT_REFRESH_RATE = 6000;

export const INITIAL_TASK_ANOMALY_SUMMARY = {
  anomalyOccurrence: 0,
  minAnomalyGrade: 0.0,
  maxAnomalyGrade: 0.0,
  minConfidence: 0.0,
  maxConfidence: 0.0,
} as TaskAnomalySummary;
