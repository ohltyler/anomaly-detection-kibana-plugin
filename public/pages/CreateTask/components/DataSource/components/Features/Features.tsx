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
  EuiCallOut,
  EuiSpacer,
  EuiText,
  EuiFlexItem,
  EuiFlexGroup,
  EuiButton,
  EuiTitle,
  EuiLink,
  EuiIcon,
} from '@elastic/eui';
import { FieldArray, FieldArrayRenderProps, FormikProps } from 'formik';

import { get } from 'lodash';
import React, { useState, Fragment } from 'react';
import { Task } from '../../../../../../models/interfaces';
import { initialFeatureValue } from '../../../../../EditFeatures/utils/helpers';
import { MAX_FEATURE_NUM } from '../../../../../../utils/constants';
import { TaskFormikValues } from '../../../../utils/constants';
import { FeatureAccordion } from '../../../../../EditFeatures/components/FeatureAccordion/FeatureAccordion';

interface FeaturesProps {
  task: Task | undefined;
  isLoading: boolean;
  formikProps: FormikProps<TaskFormikValues>;
}

export function Features(props: FeaturesProps) {
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  return (
    <EuiFlexGroup direction="column" style={{ margin: '0px' }}>
      <EuiFlexItem style={{ marginLeft: '0px' }}>
        <EuiTitle size="s">
          <h3>Features</h3>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem style={{ marginLeft: '0px', marginTop: '-8px' }}>
        <EuiText className="content-panel-subTitle">
          Specify an index field that you want to find anomalies for by defining
          features. You can add up to 5 features.{' '}
          <EuiLink
            href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
            target="_blank"
          >
            Learn more <EuiIcon size="s" type="popout" />
          </EuiLink>
        </EuiText>
      </EuiFlexItem>
      <FieldArray name="featureList" validateOnChange={true}>
        {({ push, remove, form: { values } }: FieldArrayRenderProps) => {
          // @ts-ignore
          if (
            firstLoad &&
            get(props.task, 'featureAttributes', []).length === 0
          ) {
            push(initialFeatureValue());
          }
          setFirstLoad(false);
          return (
            <Fragment>
              {get(props.task, 'indices.0', '').includes(':') ? (
                <div>
                  <EuiCallOut
                    title="This task is using a remote cluster index, so you need to manually input the field."
                    color="warning"
                    iconType="alert"
                  />
                  <EuiSpacer size="m" />
                </div>
              ) : null}

              {values.featureList.map((feature: any, index: number) => (
                <FeatureAccordion
                  onDelete={() => {
                    remove(index);
                  }}
                  index={index}
                  feature={feature}
                  handleChange={props.formikProps.handleChange}
                />
              ))}

              <EuiFlexGroup
                alignItems="center"
                style={{ padding: '12px 24px' }}
              >
                <EuiFlexItem grow={false}>
                  <EuiButton
                    data-test-subj="addFeature"
                    isDisabled={values.featureList.length >= MAX_FEATURE_NUM}
                    onClick={() => {
                      push(initialFeatureValue());
                    }}
                  >
                    Add another feature
                  </EuiButton>
                  <EuiText className="content-panel-subTitle">
                    <p>
                      You can add{' '}
                      {Math.max(MAX_FEATURE_NUM - values.featureList.length, 0)}{' '}
                      more features.
                    </p>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </Fragment>
          );
        }}
      </FieldArray>
    </EuiFlexGroup>
  );
}