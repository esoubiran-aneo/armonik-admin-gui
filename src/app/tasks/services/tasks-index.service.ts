import {  TaskStatus } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { TableService } from '@services/table.service';
import { TasksStatusesService } from './task-status.service';
import { TaskSummary, TaskSummaryColumnKey, TaskSummaryFilter, TaskSummaryFilterField, TaskSummaryListOptions } from '../types';

@Injectable()
export class TasksIndexService {
  #TasksStatusesService = inject(TasksStatusesService);
  #tableService = inject(TableService);

  readonly tableName: string = 'tasks';

  readonly defaultColumns: TaskSummaryColumnKey[] = ['id', 'actions'];
  readonly availableColumns: TaskSummaryColumnKey[] = ['sessionId', 'id','status', 'endedAt','podTtl', 'statusMessage','status', 'createdAt', 'receivedAt', 'acquiredAt', 'submittedAt', 'creationToEndDuration','processingToEndDuration','initialTaskId', 'options', 'options.options', 'options.applicationName', 'options.applicationNamespace', 'options.applicationService', 'options.applicationVersion', 'options.engineType', 'options.maxDuration', 'options.maxRetries', 'options.partitionId', 'options.priority'];

  readonly dateColumns: TaskSummaryColumnKey[] = ['endedAt', 'createdAt', 'submittedAt', 'receivedAt', 'acquiredAt'];
  readonly durationColumns: TaskSummaryColumnKey[] = ['creationToEndDuration', 'processingToEndDuration', 'options.maxDuration'];
  readonly objectColumns: TaskSummaryColumnKey[] = ['options', 'options.options', 'countDataDependencies','countExpectedOutputIds', 'countParentTaskIds', 'countRetryOfIds','podTtl']

  readonly columnsLabels: Record<TaskSummaryColumnKey, string> = {
    id: $localize`Task ID`,
    ownerPodId: $localize`owner pod ID`,
    initialTaskId: $localize`initial task ID`,
    countDataDependencies: $localize`data dependencies`,
    countExpectedOutputIds: $localize`expected output`,
    statusMessage: $localize`status message`,
    submittedAt: $localize`Submitted at`,
    startedAt: $localize`Started at`,
    podTtl: $localize`pod Ttl`,
    podHostname: $localize`pod host name`,
    receivedAt: $localize`received at`,
    acquiredAt: $localize`acquired at`,
    sessionId: $localize`Session ID`,
    status: $localize`Status`,
    endedAt: $localize`Cancelled at`,
    createdAt: $localize`Created at`,
    options: $localize`Options`,
    actions: $localize`actions`,
    count: $localize`count`,
    countParentTaskIds: $localize `count parent task Ids`,
    countRetryOfIds: $localize `count retry of Ids`,
    error: $localize `error`,
    creationToEndDuration: $localize`creation to end duration`,
    processingToEndDuration: $localize`processing to end duration IDs`,
    'options.options': $localize`Options Options`,
    'options.applicationName': $localize`Options Application Name`,
    'options.applicationNamespace': $localize`Options Application Namespace`,
    'options.applicationService': $localize`Options Application Service`,
    'options.applicationVersion': $localize`Options Application Version`,
    'options.engineType': $localize`Options Engine Type`,
    'options.maxDuration': $localize`Options Max Duration`,
    'options.maxRetries': $localize`Options Max Retries`,
    'options.partitionId': $localize`Options Partition ID`,
    'options.priority': $localize`Options Priority`,
  };

  readonly defaultOptions: TaskSummaryListOptions = {
    pageIndex: 0,
    pageSize: 10,
    sort: {
      active: 'id',
      direction: 'asc'
    },
  };

  readonly defaultFilters: TaskSummaryFilter[] = [];
  readonly availableFiltersFields: TaskSummaryFilterField[] = [
    {
      field: 'id',
      type: 'text',
    },
    {
      field: 'sessionId',
      type: 'text',
    },
    {
      field: 'initialTaskId',
      type: 'text',
    },
    {
      field: 'createdAt',
      type: 'date',
    },
    {
      field: 'ownerPodId',
      type: 'text',
    },
    {
      field: 'podHostname',
      type: 'text',
    },
    {
      field: 'endedAt',
      type: 'date',
    },
    {
      field: 'statusMessage',
      type: 'text',
    },
    {
      field: 'submittedAt',
      type: 'date',
    },
    {
      field: 'id',
      type: 'text',
    },
    {
      field: 'status',
      type: 'select',
      options: Object.keys(this.#TasksStatusesService.statuses).map(status => {
        return {
          value: status,
          label: this.#TasksStatusesService.statuses[Number(status) as TaskStatus],
        };
      }),
    }
  ];

  readonly defaultIntervalValue: number = 10;

  columnToLabel(column: TaskSummaryColumnKey): string {
    return this.columnsLabels[column];
  }

  /**
   * Table
   */
  isActionsColumn(column: TaskSummaryColumnKey): boolean {
    return column === 'actions';
  }

  isStatusColumn(column: TaskSummaryColumnKey): boolean {
    return column === 'status';
  }

  isTaskIdColumn(column: TaskSummaryColumnKey): boolean {
    return column === 'id';
  }

  isCountColumn(column: TaskSummaryColumnKey): boolean {
    return column === 'count';
  }

  isDateColumn(column: TaskSummaryColumnKey): boolean {
    return this.dateColumns.includes(column);
  }

  isDurationColumn(column: TaskSummaryColumnKey): boolean {
    return this.durationColumns.includes(column);
  }

  isObjectColumn(column: TaskSummaryColumnKey): boolean {
    return this.objectColumns.includes(column);
  }

  isSimpleColumn(column: TaskSummaryColumnKey): boolean {
    return !this.isActionsColumn(column) && !this.isStatusColumn(column) && !this.isCountColumn(column) && !this.isDateColumn(column) && !this.isDurationColumn(column) && !this.isObjectColumn(column);
  }

  isNotSortableColumn(column: TaskSummaryColumnKey): boolean {
    return this.isActionsColumn(column) || this.isCountColumn(column) || this.isObjectColumn(column);
  }

  /**
   * Interval
   */

  saveIntervalValue(value: number): void {
    this.#tableService.saveIntervalValue(this.tableName, value);
  }

  restoreIntervalValue(): number {
    return this.#tableService.restoreIntervalValue(this.tableName) ?? this.defaultIntervalValue;
  }

  /**
   * Options
   */

  saveOptions(options: TaskSummaryListOptions): void {
    this.#tableService.saveOptions(this.tableName, options);
  }

  restoreOptions(): TaskSummaryListOptions {
    const options = this.#tableService.restoreOptions<TaskSummary>(this.tableName, this.defaultOptions);

    return options;
  }

  /**
   * Columns
   */

  saveColumns(columns: TaskSummaryColumnKey[]): void {
    this.#tableService.saveColumns(this.tableName, columns);
  }

  restoreColumns(): TaskSummaryColumnKey[] {
    const columns = this.#tableService.restoreColumns<TaskSummaryColumnKey[]>(this.tableName) ?? this.defaultColumns;

    return [...columns];
  }

  resetColumns(): TaskSummaryColumnKey[] {
    this.#tableService.resetColumns(this.tableName);

    return Array.from(this.defaultColumns);
  }

  /**
   * Filters
   */

  saveFilters(filters: TaskSummaryFilter[]): void {
    this.#tableService.saveFilters(this.tableName, filters);
  }

  restoreFilters(): TaskSummaryFilter[] {
    return this.#tableService.restoreFilters<TaskSummaryFilter[]>(this.tableName) ?? this.defaultFilters;
  }

  resetFilters(): TaskSummaryFilter[] {
    this.#tableService.resetFilters(this.tableName);

    return this.defaultFilters;
  }
}
