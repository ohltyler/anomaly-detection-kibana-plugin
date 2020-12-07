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
import {
  EuiText,
  EuiOverlayMask,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { Detector } from '../../../../../models/interfaces';
import { ConfirmModal } from '../../../../DetectorDetail/components/ConfirmModal/ConfirmModal';

interface EditHistoricalDetectorModalProps {
  detector: Detector;
  isStoppingDetector: boolean;
  onHide(): void;
  onStopDetectorForEditing(): void;
}

export const EditHistoricalDetectorModal = (
  props: EditHistoricalDetectorModalProps
) => {
  return (
    <EuiOverlayMask>
      <ConfirmModal
        title="Stop historical detector to proceed?"
        description={
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiText>
                <p>
                  The historical detector needs to stop before you can edit the
                  configuration. Make sure to restart the detector after making
                  changes.
                </p>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        confirmButtonText="Stop and proceed to edit"
        confirmButtonColor="primary"
        confirmButtonDisabled={false}
        confirmButtonIsLoading={props.isStoppingDetector}
        onClose={props.onHide}
        onCancel={props.onHide}
        onConfirm={() => props.onStopDetectorForEditing()}
      />
    </EuiOverlayMask>
  );
};
