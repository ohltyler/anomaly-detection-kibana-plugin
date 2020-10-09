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
  EuiText,
  EuiFlexItem,
  EuiFlexGroup,
  EuiSpacer,
  EuiComboBox,
  EuiCheckableCard,
} from '@elastic/eui';
import { FormikProps } from 'formik';
import { debounce, get } from 'lodash';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../../../redux/reducers';
import { Detector } from '../../../../../../models/interfaces';
import { getDetectorList } from '../../../../../../redux/reducers/ad';
import { getMappings } from '../../../../../../redux/reducers/elasticsearch';
import { GET_ALL_DETECTORS_QUERY_PARAMS } from '../../../../../utils/constants';
import { searchDetector } from '../../../../../../redux/reducers/ad';
import { FormattedFormRow } from '../../../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import {
  TaskFormikValues,
  INITIAL_TASK_VALUES,
} from '../../../../utils/constants';
import { CREATE_TASK_OPTIONS } from '../../../../utils/constants';
import { generateInitialFeatures } from '../../../../../EditFeatures/utils/helpers';
import { sanitizeSearchText } from '../../../../../utils/helpers';
import {
  populateDetectorFieldsFromDetector,
  populateDetectorFieldsToInitialValues,
  untouchDetectorFields,
} from './utils/helpers';

interface DetectorChooserProps {
  isLoading: boolean;
  formikProps: FormikProps<TaskFormikValues>;
}

export function DetectorChooser(props: DetectorChooserProps) {
  const dispatch = useDispatch();
  const adState = useSelector((state: AppState) => state.ad);
  const detectorItems = adState.detectorList;
  const detectors = adState.detectors;
  const [queryText, setQueryText] = useState('');
  const [selectedDetectorId, setSelectedDetectorId] = useState<string>('');
  const selectedDetector = detectors[selectedDetectorId];

  console.log('selected detector: ', selectedDetector);

  const [selection, setSelection] = useState<CREATE_TASK_OPTIONS>(
    CREATE_TASK_OPTIONS.USE_EXISTING
  );

  // Getting all detectors initially
  useEffect(() => {
    const getInitialDetectors = async () => {
      dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
    };
    getInitialDetectors();
  }, []);

  // Update the form if a change in selected detector, and get index mappings
  useEffect(() => {
    if (selectedDetector) {
      populateDetectorFieldsFromDetector(props.formikProps, selectedDetector);
      const indexName = selectedDetector.indices[0];
      dispatch(getMappings(indexName));
    } else {
      populateDetectorFieldsToInitialValues(props.formikProps);
    }
  }, [selectedDetector]);

  const getDetectorInfo = (detectorId: string) => {
    if (detectorId && detectorItems && detectorItems[detectorId]) {
      dispatch(
        searchDetector({
          query: { term: { 'name.keyword': detectorItems[detectorId].name } },
        })
      );
    }
  };

  const handleSearchChange = debounce(async (searchValue: string) => {
    if (searchValue !== queryText) {
      const sanitizedQuery = sanitizeSearchText(searchValue);
      setQueryText(sanitizedQuery);
      console.log('new sanitized query: ', sanitizedQuery);

      const searchRequest = {
        ...GET_ALL_DETECTORS_QUERY_PARAMS,
        search: sanitizedQuery,
      };
      dispatch(getDetectorList(searchRequest));
    }
  }, 300);

  return (
    <EuiFlexGroup direction="column" style={{ margin: '0px' }}>
      <EuiFlexGroup
        direction="row"
        gutterSize="none"
        justifyContent="spaceBetween"
        style={{ maxWidth: '400px' }}
      >
        <EuiFlexItem style={{ marginRight: '4px' }}>
          <EuiCheckableCard
            id={CREATE_TASK_OPTIONS.USE_EXISTING}
            label={
              <EuiText size="s">
                <p>Configure from existing real-time detector</p>
              </EuiText>
            }
            value={CREATE_TASK_OPTIONS.USE_EXISTING}
            checked={selection === CREATE_TASK_OPTIONS.USE_EXISTING}
            onChange={() => {
              setSelection(CREATE_TASK_OPTIONS.USE_EXISTING);
              populateDetectorFieldsToInitialValues(props.formikProps);
              untouchDetectorFields(props.formikProps);
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem style={{ marginLeft: '4px' }}>
          <EuiCheckableCard
            id={CREATE_TASK_OPTIONS.CREATE_NEW}
            label={
              <EuiText size="s">
                <p>
                  Create a new detector
                  <br></br>
                  <br></br>
                </p>
              </EuiText>
            }
            value={CREATE_TASK_OPTIONS.CREATE_NEW}
            checked={selection === CREATE_TASK_OPTIONS.CREATE_NEW}
            onChange={() => {
              setSelection(CREATE_TASK_OPTIONS.CREATE_NEW);
              setSelectedDetectorId('');
              populateDetectorFieldsToInitialValues(props.formikProps);
              untouchDetectorFields(props.formikProps);
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      {selection === CREATE_TASK_OPTIONS.USE_EXISTING ? (
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: '70%' }}>
            <FormattedFormRow
              fullWidth
              title="Real-time Detector"
              hint="Choose a real-time detector to use for your configuration."
            >
              <EuiComboBox
                id="existingDetectorsComboBox"
                placeholder="Real-time detectors"
                async
                isLoading={adState.requesting}
                options={Object.values(detectorItems).map((detector) => ({
                  label: detector.name,
                  id: detector.id,
                }))}
                onSearchChange={handleSearchChange}
                onBlur={() => {}}
                onChange={(options) => {
                  const detectorId = get(options, '0.id') as string;
                  setSelectedDetectorId(detectorId);
                  getDetectorInfo(detectorId);
                }}
                selectedOptions={
                  (selectedDetectorId &&
                    detectorItems &&
                    detectorItems[selectedDetectorId] && [
                      { label: detectorItems[selectedDetectorId].name },
                    ]) ||
                  []
                }
                singleSelection={true}
                isClearable={true}
              />
            </FormattedFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : null}

      {selection === CREATE_TASK_OPTIONS.USE_EXISTING ? (
        <EuiSpacer size="l" />
      ) : null}
    </EuiFlexGroup>
  );
}
