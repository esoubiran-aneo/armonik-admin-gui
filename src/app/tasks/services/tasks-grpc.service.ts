import { SortDirection as ArmoniKSortDirection, CountTasksByStatusRequest, CountTasksByStatusResponse, TasksClient, ListTasksRequest, ListTasksResponse, TaskSummaryField, GetTaskResponse, GetTaskRequest, CancelTasksResponse, CancelTasksRequest, TaskStatus, TaskOptionField } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { AppGrpcService } from '@app/types/services';
import { Observable } from 'rxjs';
import  { TaskSummaryFieldKey,TaskSummaryListOptions, TaskSummaryFilter, TaskSummary } from '../types';
import { UtilsService } from '@services/utils.service';

@Injectable()
export class TaskGrpcService implements AppGrpcService<TaskSummary>  {

  constructor(
    private _tasksClient: TasksClient,
    private _utilsService: UtilsService<TaskSummary>
  ) {}
  
  readonly sortDirections: Record<SortDirection, ArmoniKSortDirection> = {
    'asc': ArmoniKSortDirection.SORT_DIRECTION_ASC,
    'desc': ArmoniKSortDirection.SORT_DIRECTION_DESC,
    '': ArmoniKSortDirection.SORT_DIRECTION_UNSPECIFIED
  };

  readonly sortFields: Record<TaskSummaryFieldKey, TaskSummaryField> = {
    'id': TaskSummaryField.TASK_SUMMARY_FIELD_TASK_ID,
    'sessionId': TaskSummaryField.TASK_SUMMARY_FIELD_SESSION_ID,
    'ownerPodId': TaskSummaryField.TASK_SUMMARY_FIELD_OWNER_POD_ID,
    'initialTaskId': TaskSummaryField.TASK_SUMMARY_FIELD_INITIAL_TASK_ID,
    'status': TaskSummaryField.TASK_SUMMARY_FIELD_STATUS,
    'statusMessage': TaskSummaryField.TASK_SUMMARY_FIELD_UNSPECIFIED,
    'options': TaskSummaryField.TASK_SUMMARY_FIELD_UNSPECIFIED,
    'createdAt': TaskSummaryField.TASK_SUMMARY_FIELD_CREATED_AT,
    'submittedAt': TaskSummaryField.TASK_SUMMARY_FIELD_SUBMITTED_AT,
    'startedAt': TaskSummaryField.TASK_SUMMARY_FIELD_STARTED_AT,
    'endedAt': TaskSummaryField.TASK_SUMMARY_FIELD_ENDED_AT,
    'creationToEndDuration': TaskSummaryField.TASK_SUMMARY_FIELD_CREATION_TO_END_DURATION,
    'processingToEndDuration': TaskSummaryField.TASK_SUMMARY_FIELD_PROCESSING_TO_END_DURATION,
    'podTtl': TaskSummaryField.TASK_SUMMARY_FIELD_POD_TTL,
    'podHostname': TaskSummaryField.TASK_SUMMARY_FIELD_POD_HOSTNAME,
    'receivedAt': TaskSummaryField.TASK_SUMMARY_FIELD_RECEIVED_AT,
    'acquiredAt': TaskSummaryField.TASK_SUMMARY_FIELD_ACQUIRED_AT,
    'countParentTaskIds': TaskSummaryField.TASK_SUMMARY_FIELD_UNSPECIFIED,
    'countDataDependencies': TaskSummaryField.TASK_SUMMARY_FIELD_UNSPECIFIED,
    'countExpectedOutputIds': TaskSummaryField.TASK_SUMMARY_FIELD_UNSPECIFIED,
    'countRetryOfIds': TaskSummaryField.TASK_SUMMARY_FIELD_UNSPECIFIED,
    'error': TaskSummaryField.TASK_SUMMARY_FIELD_UNSPECIFIED
  };

  countByStatu$(): Observable<CountTasksByStatusResponse> {
    const request = new CountTasksByStatusRequest();
    return this._tasksClient.countTasksByStatus(request);
  }
  list$(options: TaskSummaryListOptions, filters: TaskSummaryFilter[]): Observable<ListTasksResponse> {
    
    const findFilter = this._utilsService.findFilter;

    const listTaskRequest = new ListTasksRequest({
      page: options.pageIndex,
      pageSize: options.pageSize,
      sort: {
        direction: this.sortDirections[options.sort.direction],
        field: {
            taskSummaryField: this.sortFields[options.sort.active] ?? TaskSummaryField.TASK_SUMMARY_FIELD_SESSION_ID, 
            taskOptionField: null as any,
        }
      },
      filter: {
        sessionId: this._utilsService.convertFilterValue(findFilter(filters, 'sessionId')),
        status: [this._utilsService.convertFilterValueToStatus<TaskStatus>(findFilter(filters, 'status')) ?? TaskStatus.TASK_STATUS_UNSPECIFIED],
      }
    });

    console.log(listTaskRequest)

    return this._tasksClient.listTasks(listTaskRequest);

  }

  get$(taskId: string ): Observable<GetTaskResponse> {
    const getTaskRequest = new GetTaskRequest({
      taskId
    });

    return this._tasksClient.getTask(getTaskRequest);
  }


  cancel$(taskIds: string[]): Observable<CancelTasksResponse> {
    const cancelTasksRequest = new CancelTasksRequest({
      taskIds
    });

    return this._tasksClient.cancelTasks(cancelTasksRequest);
  }


  
}

