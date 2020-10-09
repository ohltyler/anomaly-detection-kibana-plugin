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
  //@ts-ignore
  EuiBasicTable,
  EuiButton,
  EuiComboBoxOptionProps,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiSpacer,
} from '@elastic/eui';
import { isEmpty, debounce } from 'lodash';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
//@ts-ignore
import chrome from 'ui/chrome';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import { TaskListItem, DetectorListItem } from '../../../../models/interfaces';
import { SORT_DIRECTION } from '../../../../../server/utils/constants';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../../redux/reducers';
import { getTaskList } from '../../../../redux/reducers/task';
import { getDetectorList } from '../../../../redux/reducers/ad';
import {
  BREADCRUMBS,
  APP_PATH,
  PLUGIN_NAME,
  TASK_STATE,
} from '../../../../utils/constants';
import { getTitleWithCount } from '../../../../utils/utils';
import {
  MAX_TASKS,
  ALL_TASK_STATES,
  ALL_DETECTORS,
  MAX_SELECTED_DETECTORS,
} from '../../../utils/constants';
import {
  getURLQueryParams,
  getTasksWithDetectorName,
} from '../../utils/helpers';
import {
  filterAndSortTasks,
  getTasksToDisplay,
  sanitizeSearchText,
  getDetectorOptions,
} from '../../../utils/helpers';
import { EmptyTaskMessage } from '../../components/EmptyTaskMessage/EmptyTaskMessage';
import { TASK_ACTION, taskListColumns } from '../../utils/constants';
import { TaskFilters } from '../../components/TaskFilters/TaskFilters';
import {
  GET_ALL_TASKS_QUERY_PARAMS,
  GET_ALL_DETECTORS_QUERY_PARAMS,
} from '../../../utils/constants';
import { getTasksForAction } from '../../utils/helpers';
import { TaskListActions } from '../../components/TaskListActions/TaskListActions';
import { CompareTasksModal } from '../ActionModals/CompareTasksModal/CompareTasksModal';

export interface TaskListRouterParams {
  from: string;
  size: string;
  search: string;
  sortDirection: SORT_DIRECTION;
  sortField: string;
}
interface TaskListProps extends RouteComponentProps<TaskListRouterParams> {}
interface TaskListState {
  page: number;
  queryParams: any;
  selectedTaskStates: TASK_STATE[];
  selectedDetectors: string[];
}
interface ActionModalState {
  isOpen: boolean;
  action: TASK_ACTION;
  isListLoading: boolean;
  isRequestingToClose: boolean;
  affectedTasks: TaskListItem[];
  affectedDetectors: DetectorListItem[];
}
interface TaskListActionsState {
  isDisabled: boolean;
  isCompareDisabled: boolean;
}

export function TaskList(props: TaskListProps) {
  const dispatch = useDispatch();

  // get task store
  const taskState = useSelector((state: AppState) => state.task);
  const allTasks = taskState.taskList;
  const errorGettingTasks = taskState.errorMessage;
  const isRequestingTasks = taskState.requesting;

  // get AD / detector store
  const adState = useSelector((state: AppState) => state.ad);
  const allDetectors = adState.detectorList;
  const errorGettingDetectors = adState.errorMessage;
  const isRequestingDetectors = adState.requesting;

  const [selectedTasks, setSelectedTasks] = useState([] as TaskListItem[]);
  const [tasksToDisplay, setTasksToDisplay] = useState([] as TaskListItem[]);
  const [isLoadingFinalTasks, setIsLoadingFinalTasks] = useState<boolean>(true);
  const [selectedTasksForAction, setSelectedTasksForAction] = useState(
    [] as TaskListItem[]
  );
  const [detectorQuery, setDetectorQuery] = useState('');

  // if loading tasks, detectors, or sorting/filtering: set whole page in loading state
  const isLoading =
    isRequestingTasks || isRequestingDetectors || isLoadingFinalTasks;

  const [state, setState] = useState<TaskListState>({
    page: 0,
    queryParams: getURLQueryParams(props.location),
    selectedTaskStates: ALL_TASK_STATES,
    selectedDetectors: ALL_DETECTORS,
  });
  const [actionModalState, setActionModalState] = useState<ActionModalState>({
    isOpen: false,
    //@ts-ignore
    action: null,
    isListLoading: false,
    isRequestingToClose: false,
    affectedTasks: [],
    affectedDetectors: [],
  });
  const [taskListActionsState, setTaskListActionsState] = useState<
    TaskListActionsState
  >({
    isDisabled: true,
    isCompareDisabled: false,
  });

  // Set breadcrumbs on page initialization
  useEffect(() => {
    chrome.breadcrumbs.set([BREADCRUMBS.ANOMALY_DETECTOR, BREADCRUMBS.TASKS]);
  }, []);

  // Refresh data if user change any parameters / filter / sort
  useEffect(() => {
    const { history, location } = props;
    const updatedParams = {
      ...state.queryParams,
      from: state.page * state.queryParams.size,
    };

    history.replace({
      ...location,
      search: queryString.stringify(updatedParams),
    });

    setIsLoadingFinalTasks(true);
    getUpdatedTasks();
    getUpdatedDetectors();
  }, [
    state.page,
    state.queryParams,
    state.selectedTaskStates,
    state.selectedDetectors,
  ]);

  // Handle all filtering / sorting of tasks
  useEffect(() => {
    const curSelectedTasks = filterAndSortTasks(
      Object.values(allTasks),
      allDetectors,
      state.queryParams.search,
      state.selectedTaskStates,
      state.selectedDetectors,
      state.queryParams.sortField,
      state.queryParams.sortDirection
    );
    setSelectedTasks(curSelectedTasks);

    const tasksToDisplay = getTasksToDisplay(
      curSelectedTasks,
      state.page,
      state.queryParams.size
    );

    const tasksToDisplayWithDetectorName = getTasksWithDetectorName(
      tasksToDisplay,
      allDetectors
    );

    setTasksToDisplay(tasksToDisplayWithDetectorName);

    if (!isRequestingTasks && !isRequestingDetectors) {
      setIsLoadingFinalTasks(false);
    }
  }, [allTasks, allDetectors]);

  const getUpdatedTasks = async () => {
    dispatch(getTaskList(GET_ALL_TASKS_QUERY_PARAMS));
  };

  const getUpdatedDetectors = async () => {
    dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ ...state, page: pageNumber });
  };

  const handleTableChange = ({ page: tablePage = {}, sort = {} }: any) => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    setState({
      ...state,
      page,
      queryParams: {
        ...state.queryParams,
        size,
        sortField,
        sortDirection,
      },
    });
  };

  // Refresh data is user is typing in the search bar
  const handleSearchTaskChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const searchText = e.target.value;
    setState({
      ...state,
      page: 0,
      queryParams: {
        ...state.queryParams,
        search: searchText,
      },
    });
  };

  // Refresh data if user is selecting a task state filter
  const handleTaskStateChange = (options: EuiComboBoxOptionProps[]): void => {
    let states: TASK_STATE[];
    states =
      options.length == 0
        ? ALL_TASK_STATES
        : options.map((option) => option.label as TASK_STATE);
    setState((state) => ({
      ...state,
      page: 0,
      selectedTaskStates: states,
    }));
  };

  // Refresh data if user is typing in the detector filter
  const handleSearchDetectorChange = debounce(async (searchValue: string) => {
    if (searchValue !== detectorQuery) {
      const sanitizedQuery = sanitizeSearchText(searchValue);
      setDetectorQuery(sanitizedQuery);
      dispatch(
        getDetectorList({
          ...GET_ALL_DETECTORS_QUERY_PARAMS,
          search: sanitizedQuery,
        })
      );
      setState((state) => ({
        ...state,
        page: 0,
      }));
    }
  }, 300);

  // Refresh data if user is selecting an index filter
  const handleDetectorChange = (options: EuiComboBoxOptionProps[]): void => {
    let detectors: string[];
    detectors =
      options.length == 0
        ? ALL_DETECTORS
        : options
            .map((option) => option.label)
            .slice(0, MAX_SELECTED_DETECTORS);

    setState({
      ...state,
      page: 0,
      selectedDetectors: detectors,
    });
  };

  const handleCompareTasksAction = () => {
    const validTasks = getTasksForAction(
      selectedTasksForAction,
      TASK_ACTION.COMPARE
    );
    if (!isEmpty(validTasks)) {
      setActionModalState({
        isOpen: true,
        action: TASK_ACTION.COMPARE,
        isListLoading: false,
        isRequestingToClose: false,
        affectedTasks: validTasks,
        affectedDetectors: [],
      });
    } else {
      toastNotifications.addWarning(
        'All selected detectors are unable to start. Make sure selected \
          detectors have features and are not already running'
      );
    }
  };

  const handleSelectionChange = (currentSelected: TaskListItem[]) => {
    setSelectedTasksForAction(currentSelected);
    setTaskListActionsState({
      ...taskListActionsState,
      isDisabled: isEmpty(currentSelected),
      isCompareDisabled: isEmpty(
        getTasksForAction(currentSelected, TASK_ACTION.COMPARE)
      ),
    });
  };

  const handleResetFilter = () => {
    setState((state) => ({
      ...state,
      queryParams: {
        ...state.queryParams,
        search: '',
      },
      selectedTaskStates: ALL_TASK_STATES,
    }));
  };

  const getItemId = (item: any) => {
    return `${item.id}-${item.currentTime}`;
  };

  const handleHideModal = () => {
    setActionModalState({
      ...actionModalState,
      isOpen: false,
    });
  };

  const handleConfirmModal = () => {
    setActionModalState({
      ...actionModalState,
      isRequestingToClose: true,
    });
  };

  const getActionModal = () => {
    if (actionModalState.isOpen) {
      //@ts-ignore
      switch (actionModalState.action) {
        case TASK_ACTION.COMPARE: {
          return (
            <CompareTasksModal
              tasks={actionModalState.affectedTasks}
              onHide={handleHideModal}
              isListLoading={isLoading}
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

  const sorting = {
    sort: {
      direction: state.queryParams.sortDirection,
      field: state.queryParams.sortField,
    },
  };

  const isFilterApplied =
    !isEmpty(state.queryParams.search) ||
    !isEmpty(state.selectedTaskStates) ||
    !isEmpty(state.selectedDetectors);

  const pagination = {
    pageIndex: state.page,
    pageSize: state.queryParams.size,
    totalItemCount: Math.min(MAX_TASKS, selectedTasks.length),
    pageSizeOptions: [5, 10, 20, 50],
  };

  const selection = {
    onSelectionChange: handleSelectionChange,
  };

  return (
    <EuiPage>
      <EuiPageBody>
        <ContentPanel
          title={
            isLoading
              ? getTitleWithCount('Tasks', '...')
              : getTitleWithCount('Tasks', selectedTasks.length)
          }
          actions={[
            <TaskListActions
              onCompareTasks={handleCompareTasksAction}
              isActionsDisabled={taskListActionsState.isDisabled}
              isCompareDisabled={taskListActionsState.isCompareDisabled}
            />,
            <EuiButton
              style={{ width: '150px' }}
              data-test-subj="createTaskButton"
              fill
              href={`${PLUGIN_NAME}#${APP_PATH.CREATE_TASK}`}
            >
              Create task
            </EuiButton>,
          ]}
        >
          {getActionModal()}
          <TaskFilters
            activePage={state.page}
            pageCount={
              isLoading
                ? 0
                : Math.ceil(selectedTasks.length / state.queryParams.size) || 1
            }
            search={state.queryParams.search}
            selectedTaskStates={state.selectedTaskStates}
            selectedDetectors={state.selectedDetectors}
            detectorOptions={getDetectorOptions(Object.values(allDetectors))}
            onDetectorChange={handleDetectorChange}
            onSearchDetectorChange={handleSearchDetectorChange}
            onTaskStateChange={handleTaskStateChange}
            onSearchTaskChange={handleSearchTaskChange}
            onPageClick={handlePageChange}
          />
          <EuiSpacer size="s" />
          <EuiHorizontalRule margin="s" style={{ marginBottom: '0px' }} />
          <EuiBasicTable<any>
            items={isLoading ? [] : tasksToDisplay}
            /*
              itemId here is used to keep track of the selected detectors and render appropriately.
              Because the item id is dependent on the current time (see getItemID() above), all selected
              detectors will be deselected once new detectors are retrieved because the page will
              re-render with a new timestamp. This logic is borrowed from Alerting Kibana plugins'
              monitors list page.
            */
            itemId={getItemId}
            columns={taskListColumns}
            onChange={handleTableChange}
            isSelectable={true}
            selection={selection}
            sorting={sorting}
            pagination={pagination}
            noItemsMessage={
              isLoading ? (
                'Loading tasks...'
              ) : (
                <EmptyTaskMessage
                  isFilterApplied={isFilterApplied}
                  onResetFilters={handleResetFilter}
                />
              )
            }
          />
        </ContentPanel>
      </EuiPageBody>
    </EuiPage>
  );
}