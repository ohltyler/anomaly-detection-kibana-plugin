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

import { Switch, Route, RouteComponentProps, Redirect } from 'react-router-dom';
import React from 'react';
import { AppState } from '../../redux/reducers';
import { CreateDetector } from '../createDetector';
import { DetectorList } from '../DetectorsList';
import { TaskList } from '../TaskList';
import { CreateTask } from '../CreateTask';
import { SampleData } from '../SampleData';
import { ListRouterParams } from '../DetectorsList/containers/List/List';
import { TaskListRouterParams } from '../TaskList/containers/TaskList/TaskList';
// @ts-ignore
import { EuiSideNav, EuiPage, EuiPageBody, EuiPageSideBar } from '@elastic/eui';
import { useSelector } from 'react-redux';
import { APP_PATH } from '../../utils/constants';
import { DetectorDetail } from '../DetectorDetail';
import { TaskDetail } from '../TaskDetail';
import { EditFeatures } from '../EditFeatures/containers/EditFeatures';
import { DashboardOverview } from '../Dashboard/Container/DashboardOverview';

enum Navigation {
  AnomalyDetection = 'Anomaly detection',
  Dashboard = 'Dashboard',
  Detectors = 'Detectors',
  SampleDetectors = 'Sample detectors',
  HistoricalAnalysis = 'Historical analysis',
}

enum Pathname {
  Dashboard = '/dashboard',
  Detectors = '/detectors',
  SampleDetectors = '/sample-detectors',
  HistoricalAnalysis = '/tasks',
}

interface MainProps extends RouteComponentProps {}

export function Main(props: MainProps) {
  const hideSideNavBar = useSelector(
    (state: AppState) => state.adApp.hideSideNavBar
  );
  const sideNav = [
    {
      name: Navigation.AnomalyDetection,
      id: 0,
      href: `#${Pathname.Dashboard}`,
      items: [
        {
          name: Navigation.Dashboard,
          id: 1,
          href: `#${Pathname.Dashboard}`,
          isSelected: props.location.pathname === Pathname.Dashboard,
        },
        {
          name: Navigation.Detectors,
          id: 2,
          href: `#${Pathname.Detectors}`,
          isSelected: props.location.pathname === Pathname.Detectors,
        },
        {
          name: Navigation.HistoricalAnalysis,
          id: 3,
          href: `#${Pathname.HistoricalAnalysis}`,
          isSelected: props.location.pathname === Pathname.HistoricalAnalysis,
        },
        {
          name: Navigation.SampleDetectors,
          id: 4,
          href: `#${Pathname.SampleDetectors}`,
          isSelected: props.location.pathname === Pathname.SampleDetectors,
        },
      ],
    },
  ];

  return (
    <EuiPage style={{ height: '100%' }}>
      <EuiPageSideBar style={{ minWidth: 150 }} hidden={hideSideNavBar}>
        <EuiSideNav style={{ width: 150 }} items={sideNav} />
      </EuiPageSideBar>
      <EuiPageBody>
        <Switch>
          <Route
            path={APP_PATH.DASHBOARD}
            render={(props: RouteComponentProps) => <DashboardOverview />}
          />
          <Route
            exact
            path={APP_PATH.LIST_DETECTORS}
            render={(props: RouteComponentProps<ListRouterParams>) => (
              <DetectorList {...props} />
            )}
          />
          <Route
            exact
            path={APP_PATH.LIST_TASKS}
            render={(props: RouteComponentProps<TaskListRouterParams>) => (
              <TaskList {...props} />
            )}
          />
          <Route
            exact
            path={APP_PATH.SAMPLE_DETECTORS}
            render={() => <SampleData />}
          />
          <Route
            exact
            path={APP_PATH.CREATE_DETECTOR}
            render={(props: RouteComponentProps) => (
              <CreateDetector {...props} isEdit={false} />
            )}
          />
          <Route
            exact
            path={APP_PATH.EDIT_DETECTOR}
            render={(props: RouteComponentProps) => (
              <CreateDetector {...props} isEdit={true} />
            )}
          />
          <Route
            exact
            path={APP_PATH.EDIT_FEATURES}
            render={(props: RouteComponentProps) => <EditFeatures {...props} />}
          />
          <Route
            path={APP_PATH.DETECTOR_DETAIL}
            render={(props: RouteComponentProps) => (
              <DetectorDetail {...props} />
            )}
          />
          <Route
            path={APP_PATH.TASK_DETAIL}
            render={(props: RouteComponentProps) => <TaskDetail {...props} />}
          />
          <Route
            exact
            path={APP_PATH.CREATE_TASK}
            render={(props: RouteComponentProps) => (
              <CreateTask {...props} isEdit={false} />
            )}
          />
          <Route
            exact
            path={APP_PATH.EDIT_TASK}
            render={(props: RouteComponentProps) => (
              <CreateTask {...props} isEdit={true} />
            )}
          />
          <Redirect from="/" to={APP_PATH.DASHBOARD} />
        </Switch>
      </EuiPageBody>
    </EuiPage>
  );
}
