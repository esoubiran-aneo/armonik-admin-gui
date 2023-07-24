import { SortDirection as ArmoniKSortDirection, CancelTasksRequest, CancelTasksResponse, CountTasksByStatusRequest, CountTasksByStatusResponse, GetTaskRequest, GetTaskResponse, ListTasksRequest, ListTasksResponse, TaskStatus, TaskSummary, TaskSummaryEnumField, TaskSummaryField, TasksClient } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { UtilsService } from '@services/utils.service';
import { TaskSummaryFieldKey, TaskSummaryFilter, TaskSummaryListOptions } from '../types';

@Injectable()
export class TasksGrpcService {
  readonly #utilsService = inject(UtilsService<TaskSummary>);
  readonly #tasksClient = inject(TasksClient);

  readonly sortDirections: Record<SortDirection, ArmoniKSortDirection> = {
    'asc': ArmoniKSortDirection.SORT_DIRECTION_ASC,
    'desc': ArmoniKSortDirection.SORT_DIRECTION_DESC,
    '': ArmoniKSortDirection.SORT_DIRECTION_UNSPECIFIED
  };

  readonly sortFields: Record<TaskSummaryFieldKey, TaskSummaryEnumField> = {
    id: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_TASK_ID,
    sessionId: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_SESSION_ID,
    ownerPodId: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_OWNER_POD_ID,
    initialTaskId: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_INITIAL_TASK_ID,
    status: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_STATUS,
    createdAt: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_CREATED_AT,
    submittedAt: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_SUBMITTED_AT,
    startedAt: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_STARTED_AT,
    endedAt: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_ENDED_AT,
    creationToEndDuration: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_CREATION_TO_END_DURATION,
    processingToEndDuration: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_PROCESSING_TO_END_DURATION,
    podTtl: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_POD_TTL,
    podHostname: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_POD_HOSTNAME,
    receivedAt: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_RECEIVED_AT,
    acquiredAt: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_ACQUIRED_AT,
    options: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_UNSPECIFIED,
    statusMessage: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_UNSPECIFIED,
    countDataDependencies: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_UNSPECIFIED,
    countExpectedOutputIds: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_UNSPECIFIED,
    countParentTaskIds: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_UNSPECIFIED,
    countRetryOfIds: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_UNSPECIFIED,
    error: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_UNSPECIFIED,
  };

  list$(options: TaskSummaryListOptions, filters: TaskSummaryFilter[]): Observable<ListTasksResponse> {
    const findFilter = this.#utilsService.findFilter;

    const status = this.#utilsService.convertFilterValueToStatus<TaskStatus>(findFilter(filters, 'status'));

    const listTasksRequest = new ListTasksRequest({
      page: options.pageIndex,
      pageSize: options.pageSize,
      sort: {
        direction: this.sortDirections[options.sort.direction],
        field: {
          taskSummaryField: {
            field: this.sortFields[options.sort.active] ?? TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_TASK_ID
          }
        }
      },
    });

    return this.#tasksClient.listTasks(listTasksRequest);
  }

  get$(taskId: string): Observable<GetTaskResponse> {
    const getTaskRequest = new GetTaskRequest({
      taskId
    });

    return this.#tasksClient.getTask(getTaskRequest);
  }

  cancel$(tasksIds: string[]): Observable<CancelTasksResponse> {
    const request = new CancelTasksRequest({
      // TODO: upstream typo in armonik.api.angular
      taskIds: tasksIds
    });

    return this.#tasksClient.cancelTasks(request);
  }

  countByStatu$(): Observable<CountTasksByStatusResponse> {
    const request = new CountTasksByStatusRequest();
    return this.#tasksClient.countTasksByStatus(request);
  }
}
