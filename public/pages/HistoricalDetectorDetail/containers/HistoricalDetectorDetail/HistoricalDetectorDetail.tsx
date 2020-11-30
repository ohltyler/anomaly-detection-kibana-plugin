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

import React, { useState, useEffect } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiHealth,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { get, isEmpty } from 'lodash';
import { RouteComponentProps } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useHideSideNavBar } from '../../../main/hooks/useHideSideNavBar';
import { Listener } from '../../../../utils/utils';
import { darkModeEnabled } from '../../../../utils/kibanaUtils';
import { AppState } from '../../../../redux/reducers';
import {
  startDetector,
  stopDetector,
  deleteDetector,
  getHistoricalDetector,
} from '../../../../redux/reducers/ad';
import { BREADCRUMBS } from '../../../../utils/constants';
import { DETECTOR_STATE } from '../../../../../server/utils/constants';
import { HistoricalDetectorConfig } from '../../components/HistoricalDetectorConfig/HistoricalDetectorConfig';
//import { HistoricalDetectorResults } from '../../components/HistoricalDetectorResults/HistoricalDetectorResults';
import { HistoricalDetectorControls } from '../../components/HistoricalDetectorControls/HistoricalDetectorControls';
import { EditHistoricalDetectorModal } from '../ActionModals/EditHistoricalDetectorModal/EditHistoricalDetectorModal';
import { DeleteHistoricalDetectorModal } from '../ActionModals/DeleteHistoricalDetectorModal/DeleteHistoricalDetectorModal';
import { stateToColorMap } from '../../../utils/constants';
import {
  HISTORICAL_DETECTOR_RESULT_REFRESH_RATE,
  HISTORICAL_DETECTOR_ACTION,
} from '../../utils/constants';
import { getCallout } from '../../utils/helpers';
import { CoreStart } from '../../../../../../../src/core/public';
import { CoreServicesContext } from '../../../../components/CoreServices/CoreServices';

export interface HistoricalDetectorRouterProps {
  detectorId?: string;
}
interface HistoricalDetectorDetailProps
  extends RouteComponentProps<HistoricalDetectorRouterProps> {}

interface HistoricalDetectorDetailModalState {
  isOpen: boolean;
  action: HISTORICAL_DETECTOR_ACTION | undefined;
}

export const HistoricalDetectorDetail = (
  props: HistoricalDetectorDetailProps
) => {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  const isDark = darkModeEnabled();
  useHideSideNavBar(true, false);
  const dispatch = useDispatch();
  const detectorId: string = get(props, 'match.params.detectorId', '');

  const adState = useSelector((state: AppState) => state.ad);
  const allDetectors = adState.detectors;
  const errorGettingDetectors = adState.errorMessage;
  const detector = allDetectors[detectorId];
  const callout = getCallout(detector);

  const [isLoadingDetector, setIsLoadingDetector] = useState<boolean>(true);
  const [
    historicalDetectorDetailModalState,
    setHistoricalDetectorDetailModalState,
  ] = useState<HistoricalDetectorDetailModalState>({
    isOpen: false,
    action: undefined,
  });

  useEffect(() => {
    if (errorGettingDetectors) {
      core.notifications.toasts.addDanger('Unable to get historical detector');
      props.history.push('/historical-detectors');
    }
  }, [errorGettingDetectors]);

  useEffect(() => {
    if (detector) {
      core.chrome.setBreadcrumbs([
        BREADCRUMBS.ANOMALY_DETECTOR,
        BREADCRUMBS.HISTORICAL_DETECTORS,
        { text: detector ? detector.name : '' },
      ]);
    }
  }, [detector]);

  const fetchDetector = async () => {
    try {
      await dispatch(getHistoricalDetector(detectorId));
      setIsLoadingDetector(false);
    } catch {
      core.notifications.toasts.addDanger(
        'Error retrieving historical detector'
      );
    }
  };

  // Try to get the detector initially
  useEffect(() => {
    if (detectorId) {
      setIsLoadingDetector(true);
      fetchDetector();
    }
  }, []);

  // If detector is running: keep fetching every second to quickly update state/results/percentage bar, etc.
  useEffect(() => {
    if (detector?.curState === DETECTOR_STATE.RUNNING) {
      const intervalId = setInterval(
        fetchDetector,
        HISTORICAL_DETECTOR_RESULT_REFRESH_RATE
      );
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [detector]);

  const handleDeleteAction = () => {
    setHistoricalDetectorDetailModalState({
      ...historicalDetectorDetailModalState,
      isOpen: true,
      action: HISTORICAL_DETECTOR_ACTION.DELETE,
    });
  };

  const handleEditAction = () => {
    detector?.curState === DETECTOR_STATE.RUNNING
      ? setHistoricalDetectorDetailModalState({
          ...historicalDetectorDetailModalState,
          isOpen: true,
          action: HISTORICAL_DETECTOR_ACTION.EDIT,
        })
      : props.history.push(`/historical-detectors/${detectorId}/edit`);
  };

  const onStartDetector = async () => {
    try {
      await dispatch(startDetector(detectorId, true));
      core.notifications.toasts.addSuccess(
        `Historical detector has been started successfully`
      );
    } catch (err) {
      core.notifications.toasts.addDanger(
        `There was a problem starting the historical detector: ${err}`
      );
    }
  };

  const onStopDetector = async (isDelete: boolean, listener?: Listener) => {
    try {
      await dispatch(stopDetector(detectorId));
      if (!isDelete) {
        core.notifications.toasts.addSuccess(
          'Historical detector has been stopped successfully'
        );
      }
      if (listener) listener.onSuccess();
    } catch (err) {
      core.notifications.toasts.addDanger(
        `There was a problem stopping the historical detector: ${err}`
      );
      if (listener) listener.onException();
    }
  };

  const onDeleteDetector = async () => {
    try {
      await dispatch(deleteDetector(detectorId));
      core.notifications.toasts.addSuccess(
        `Historical detector has been deleted successfully`
      );
      handleHideModal();
      props.history.push('/historical-detectors');
    } catch (err) {
      core.notifications.toasts.addDanger(
        `There was a problem deleting the historical detector: ${err}`
      );
      handleHideModal();
    }
  };

  const onStopDetectorForEditing = async () => {
    const listener: Listener = {
      onSuccess: () => {
        props.history.push(`/historical-detectors/${detectorId}/edit`);
        handleHideModal();
      },
      onException: handleHideModal,
    };
    onStopDetector(false, listener);
  };

  const onStopDetectorForDeleting = async () => {
    const listener: Listener = {
      onSuccess: onDeleteDetector,
      onException: handleHideModal,
    };
    onStopDetector(true, listener);
  };

  const handleHideModal = () => {
    setHistoricalDetectorDetailModalState({
      ...historicalDetectorDetailModalState,
      isOpen: false,
      action: undefined,
    });
  };

  const getHistoricalDetectorDetailModal = () => {
    if (historicalDetectorDetailModalState.isOpen) {
      switch (historicalDetectorDetailModalState.action) {
        case HISTORICAL_DETECTOR_ACTION.EDIT: {
          return (
            <EditHistoricalDetectorModal
              detector={detector}
              onHide={handleHideModal}
              onStopDetectorForEditing={onStopDetectorForEditing}
            />
          );
        }
        case HISTORICAL_DETECTOR_ACTION.DELETE: {
          return (
            <DeleteHistoricalDetectorModal
              detector={detector}
              onHide={handleHideModal}
              onStopDetectorForDeleting={onStopDetectorForDeleting}
            />
          );
        }
        default: {
          return null;
        }
      }
    } else {
      return null;
    }
  };

  const lightStyles = {
    backgroundColor: '#FFF',
  };

  const isLoading = adState.requesting || isLoadingDetector;

  return (
    <React.Fragment>
      {!isEmpty(detector) && !errorGettingDetectors
        ? getHistoricalDetectorDetailModal()
        : null}
      {!isEmpty(detector) && !errorGettingDetectors ? (
        <EuiFlexGroup
          direction="column"
          style={{
            ...(isDark
              ? { flexGrow: 'unset' }
              : { ...lightStyles, flexGrow: 'unset' }),
          }}
        >
          <EuiFlexGroup
            justifyContent="spaceBetween"
            style={{
              marginLeft: '12px',
              marginTop: '4px',
              marginRight: '12px',
            }}
          >
            <EuiFlexItem grow={false}>
              <EuiTitle size="l">
                <h1>
                  {detector && detector.name}{' '}
                  {detector?.curState ? (
                    <EuiHealth color={stateToColorMap.get(detector.curState)}>
                      {detector.curState}
                    </EuiHealth>
                  ) : null}
                </h1>
              </EuiTitle>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <HistoricalDetectorControls
                detector={detector}
                onEditDetector={handleEditAction}
                onStartDetector={onStartDetector}
                onStopDetector={onStopDetector}
                onDeleteDetector={handleDeleteAction}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup
            direction="column"
            justifyContent="spaceBetween"
            style={{
              marginLeft: '12px',
              marginTop: '4px',
              marginRight: '12px',
            }}
          >
            {callout ? (
              <EuiFlexItem
                grow={false}
                style={{ marginLeft: '12px', marginRight: '12px' }}
              >
                {callout}
              </EuiFlexItem>
            ) : null}
            <EuiFlexItem>
              <HistoricalDetectorConfig
                detector={detector}
                onEditDetector={handleEditAction}
              />
            </EuiFlexItem>
            {/* <EuiFlexItem>
              <HistoricalDetectorResults
                detector={detector}
                isLoading={isLoading}
              />
            </EuiFlexItem> */}
          </EuiFlexGroup>
        </EuiFlexGroup>
      ) : (
        <div>
          <EuiLoadingSpinner size="xl" />
        </div>
      )}
    </React.Fragment>
  );
};
