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

import React, { useState, Fragment } from 'react';
import {
  EuiText,
  EuiOverlayMask,
  EuiFlexGroup,
  EuiFlexItem,
  EuiRadioGroup,
} from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { ConfirmModal } from '../../../DetectorDetail/components/ConfirmModal/ConfirmModal';
import { SAVE_TASK_OPTIONS } from '../../utils/constants';

interface ConfirmStartModalProps {
  //readyToStartAdJob: boolean;
  selectedOption: SAVE_TASK_OPTIONS;
  onCancel(): void;
  onConfirm(): void;
  onOptionChange(id: string): void;
}

export const ConfirmStartModal = (props: ConfirmStartModalProps) => {
  const startTaskOptions = (disableStartAdJob: boolean) => {
    return [
      {
        id: SAVE_TASK_OPTIONS.START_TASK,
        label: 'Automatically run analysis',
        //disabled: disableStartAdJob,
      },
      {
        id: SAVE_TASK_OPTIONS.KEEP_TASK_STOPPED,
        label: 'Manually run the analysis at a later time',
      },
    ];
  };

  const confirmModalDescription = () => (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiText>
          <p>
            Choose to start your historical analysis now or save for a later
            date. It is recommended that you run this analysis when your system
            is idle.
          </p>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiRadioGroup
          name="start ad radio group"
          //options={startAdJobOptions(!props.readyToStartAdJob)}
          options={startTaskOptions(true)}
          idSelected={props.selectedOption}
          onChange={props.onOptionChange}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  return (
    <EuiOverlayMask>
      <ConfirmModal
        title="Automatically start the analysis?"
        description={confirmModalDescription()}
        confirmButtonText="Confirm"
        confirmButtonColor="primary"
        onClose={props.onCancel}
        onCancel={props.onCancel}
        onConfirm={props.onConfirm}
      />
    </EuiOverlayMask>
  );
};
