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

//@ts-ignore
import moment from 'moment';
import React from 'react';
import {
  EuiCallOut,
  EuiFlexGroup,
  EuiLoadingSpinner,
  EuiText,
} from '@elastic/eui';
import { Detector } from '../../../models/interfaces';
import { DETECTOR_STATE } from '../../../../server/utils/constants';

export const getCallout = (detector: Detector) => {
  if (!detector || !detector.curState) {
    return null;
  }
  switch (detector.curState) {
    case DETECTOR_STATE.DISABLED:
      return (
        <EuiCallOut
          title="The historical detector is stopped"
          color="primary"
          iconType="alert"
        />
      );
    case DETECTOR_STATE.INIT:
      return (
        <EuiCallOut
          title={
            <div>
              <EuiFlexGroup direction="row" gutterSize="xs">
                <EuiLoadingSpinner size="l" style={{ marginRight: '8px' }} />
                <EuiText>
                  <p>The historical detector is initializing</p>
                </EuiText>
              </EuiFlexGroup>
            </div>
          }
          color="primary"
        />
      );
    case DETECTOR_STATE.RUNNING:
      return (
        <EuiCallOut
          title={
            <div>
              <EuiFlexGroup direction="row" gutterSize="xs">
                <EuiLoadingSpinner size="l" style={{ marginRight: '8px' }} />
                <EuiText>
                  <p>Running the historical detector</p>
                </EuiText>
              </EuiFlexGroup>
            </div>
          }
          color="primary"
        />
      );
    default:
      return null;
  }
};
