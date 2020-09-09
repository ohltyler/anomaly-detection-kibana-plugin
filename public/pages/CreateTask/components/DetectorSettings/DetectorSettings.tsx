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

import { EuiFieldText } from '@elastic/eui';
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { Detector } from '../../../../models/interfaces';
import { FormattedFormRow } from '../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import { getTitleWithCount } from '../../../../utils/utils';
import { Features } from '../../../DetectorConfig/containers/Features';

interface DetectorSettingsProps {
  detector: Detector;
}

export function DetectorSettings(props: DetectorSettingsProps) {
  return (
    <ContentPanel
      title="Detector settings"
      titleSize="xs"
      panelStyles={{ marginTop: '24px', marginBottom: '-8px' }}
    >
      <FormattedFormRow title="Index">
        <EuiFieldText
          name="indexName"
          placeholder={props.detector.indices[0]}
          readOnly={true}
        />
      </FormattedFormRow>
      <FormattedFormRow
        formattedTitle={getTitleWithCount(
          'Features',
          props.detector.featureAttributes.length,
          'xxxs'
        )}
        fullWidth={true}
      >
        <Features
          detectorId={props.detector.id}
          detector={props.detector}
          onEditFeatures={() => {
            return;
          }}
          tableOnly={true}
        />
      </FormattedFormRow>
    </ContentPanel>
  );
}
