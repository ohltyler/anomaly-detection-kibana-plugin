/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { EuiFlexGrid, EuiFlexItem, EuiText } from '@elastic/eui';
import React from 'react';
import moment from 'moment';
import { get, isEmpty } from 'lodash';
import { ConfigCell, FixedWidthRow } from '../../../components/ConfigCell';
import { convertTimestampToNumber } from '../../../utils/utils';
import { Detector } from '../../../models/interfaces';
import { getDetectorStateDetails } from '../../DetectorDetail/utils/helpers';

interface DetectorJobsProps {
  detector: Detector;
}

export const DetectorJobs = (props: DetectorJobsProps) => {
  const isHCDetector = !isEmpty(get(props, 'detector.categoryField', []));
  const historicalEnabled = !isEmpty(get(props, 'detector.detectionDateRange'));
  console.log('detector: ', props.detector);
  const startTimeAsNumber = convertTimestampToNumber(
    get(props, 'detector.detectionDateRange.startTime', 0)
  );
  const endTimeAsNumber = convertTimestampToNumber(
    get(props, 'detector.detectionDateRange.endTime', 0)
  );

  const historicalRangeString =
    moment(startTimeAsNumber).format('MM/DD/YYYY hh:mm A') +
    ' - ' +
    moment(endTimeAsNumber).format('MM/DD/YYYY hh:mm A');

  return (
    <ContentPanel
      title="Detector jobs"
      titleSize="s"
      panelStyles={{ margin: '0px' }}
      actions={[]}
    >
      <EuiFlexGrid columns={4} gutterSize="l" style={{ border: 'none' }}>
        <EuiFlexItem>
          <ConfigCell
            title="Real-time detector"
            //@ts-ignore
            description={
              <p className="enabled">
                {getDetectorStateDetails(
                  props.detector,
                  isHCDetector,
                  'enabled'
                )}
              </p>
            }
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <FixedWidthRow label={'Historical analysis detector'}>
            {historicalEnabled ? (
              <EuiText>
                <p className="enabled">{historicalRangeString}</p>
              </EuiText>
            ) : (
              <EuiText>
                <p className="enabled">{'Disabled'}</p>
              </EuiText>
            )}
          </FixedWidthRow>
        </EuiFlexItem>
      </EuiFlexGrid>
    </ContentPanel>
  );
};
