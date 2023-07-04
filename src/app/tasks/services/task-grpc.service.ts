import { CountTasksByStatusRequest, CountTasksByStatusResponse, TasksClient, ListTasksRequest, ListTasksResponse, TaskStatus, SessionField, SortDirection, TaskOptionField, TaskSummaryField, TaskField  } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class TaskGrpcService {

  constructor(
    private _tasksClient: TasksClient,
  ) {}


  countByStatu$(): Observable<CountTasksByStatusResponse> {
    const request = new CountTasksByStatusRequest();
    return this._tasksClient.countTasksByStatus(request);
  }
  displayTasksList$(): Observable<ListTasksResponse> {
    const tasksRequest = new ListTasksRequest({
      page : 0, 
      pageSize: 10,
      filter: {
        sessionId: TaskField.id,
        status: [
          TaskStatus.TASK_STATUS_CANCELLED,
          TaskStatus.TASK_STATUS_CANCELLING,
          TaskStatus.TASK_STATUS_COMPLETED,
          TaskStatus.TASK_STATUS_DISPATCHED,
          TaskStatus.TASK_STATUS_CREATING,
          TaskStatus.TASK_STATUS_PROCESSED,
          TaskStatus.TASK_STATUS_RETRIED,
          TaskStatus.TASK_STATUS_SUBMITTED,
          TaskStatus.TASK_STATUS_TIMEOUT, 
          TaskStatus.TASK_STATUS_UNSPECIFIED,
          TaskStatus.TASK_STATUS_ERROR 
        ]
      },
      sort : {
        direction: SortDirection.SORT_DIRECTION_ASC,
        field: {
          taskSummaryField: TaskSummaryField.TASK_SUMMARY_FIELD_STARTED_AT,
          taskOptionField: TaskOptionField.TASK_OPTION_FIELD_UNSPECIFIED,
          taskOptionGenericField: { field: 'h' }
        }
      },
      withErrors: true
    });
    return this._tasksClient.listTasks(tasksRequest);
  }

  
}

