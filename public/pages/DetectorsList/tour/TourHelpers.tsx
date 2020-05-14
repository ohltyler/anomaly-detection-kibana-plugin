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

/*
 *   A tour container which handles tour state and a helper method
 *   to create a tour step
 */

import React from 'react';
import { EuiTourStep, EuiButtonEmpty } from '@elastic/eui';
import { TourStepProps } from 'public/models/interfaces';

// constructs an EuiTourStep
export const convertToTourStep = (props: TourStepProps) => {
  return (
    <EuiTourStep
      content={props.stepContent}
      isStepOpen={
        props.tour.currentStep === props.stepNumber && props.tour.isActive
      }
      minWidth={props.tour.popoverWidth}
      onFinish={props.finishTour}
      step={props.stepNumber}
      stepsTotal={props.tour.totalSteps}
      subtitle={props.tour.title}
      title={props.stepTitle}
      anchorPosition="rightUp"
    >
      {props.pageContent}
    </EuiTourStep>
  );
};

// takes the set of props and builds an array of tour step props
export const constructAndReturnSteps = (props: TourStepProps) =>
  [
    {
      ...props,
      stepNumber: 1,
      stepTitle: 'Step 1',
      stepContent: (
        <span>
          <p>Search for detectors by name from here.</p>
          <EuiButtonEmpty onClick={props.incrementStep}>Next</EuiButtonEmpty>
        </span>
      ),
    },
    {
      ...props,
      stepNumber: 2,
      stepTitle: 'Step 2',
      stepContent: (
        <span>
          <p>Filter by detector state here.</p>
          <EuiButtonEmpty onClick={props.incrementStep}>Next</EuiButtonEmpty>
        </span>
      ),
    },
    {
      ...props,
      stepNumber: 3,
      stepTitle: 'Step 3',
      stepContent: (
        <span>
          <p>Filter by indices here.</p>
          <EuiButtonEmpty onClick={props.incrementStep}>Finish</EuiButtonEmpty>
        </span>
      ),
    },
  ] as TourStepProps[];