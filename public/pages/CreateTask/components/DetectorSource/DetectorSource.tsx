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

import { EuiComboBox } from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import { debounce, get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../../redux/reducers';
import { getDetectorList } from '../../../../redux/reducers/ad';
import { getError, isInvalid, required } from '../../../../utils/utils';
import { sanitizeSearchText } from '../../../utils/helpers';
import { FormattedFormRow } from '../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import { GET_ALL_DETECTORS_QUERY_PARAMS } from '../../../utils/constants';
import { DetectorSettings } from '../../components/DetectorSettings/DetectorSettings';
import { searchDetector } from '../../../../redux/reducers/ad';

export function DetectorSource() {
  const dispatch = useDispatch();
  const [queryText, setQueryText] = useState('');
  const adState = useSelector((state: AppState) => state.ad);
  const detectorItems = adState.detectorList;
  const detectors = adState.detectors;

  const [selectedDetectorId, setSelectedDetectorId] = useState<string>('');
  const selectedDetector = detectors[selectedDetectorId];

  // Getting all detectors when first loading the page
  useEffect(() => {
    const getInitialDetectors = async () => {
      dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
    };
    getInitialDetectors();
  }, []);

  const getDetectorInfo = (detectorId: string) => {
    if (detectorId && detectorItems[detectorId]) {
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
      const searchRequest = {
        ...GET_ALL_DETECTORS_QUERY_PARAMS,
        search: sanitizedQuery,
      };
      dispatch(getDetectorList(searchRequest));
    }
  }, 300);

  return (
    <ContentPanel title="Detector source" titleSize="s">
      <Field name="detectorId" validate={required}>
        {({ field, form }: FieldProps) => {
          return (
            <FormattedFormRow
              title="Detector"
              hint="Select a detector to run the analysis"
              isInvalid={isInvalid(field.name, form)}
              error={getError(field.name, form)}
            >
              <EuiComboBox
                id="detectorId"
                placeholder="Find a detector"
                async
                isLoading={adState.requesting}
                options={Object.values(detectorItems).map((detector) => ({
                  label: detector.name,
                  id: detector.id,
                }))}
                onSearchChange={handleSearchChange}
                onBlur={() => {
                  form.setFieldTouched('detectorId', true);
                }}
                onChange={(options) => {
                  const detectorId = get(options, '0.id') as string;
                  form.setFieldValue('detectorId', detectorId);
                  setSelectedDetectorId(detectorId);
                  getDetectorInfo(detectorId);
                }}
                selectedOptions={
                  (field.value && [
                    { label: detectorItems[field.value].name },
                  ]) ||
                  []
                }
                singleSelection={true}
                isClearable={true}
              />
            </FormattedFormRow>
          );
        }}
      </Field>
      {selectedDetector ? (
        <DetectorSettings detector={selectedDetector} />
      ) : null}
    </ContentPanel>
  );
}
