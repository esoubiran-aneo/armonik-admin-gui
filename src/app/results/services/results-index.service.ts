import { ResultStatus } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { AppIndexService } from '@app/types/services';
import { TableService } from '@services/table.service';
import { ResultsStatusesService } from './results-statuses.service';
import { ResultRaw, ResultRawColumnKey, ResultRawFilter, ResultRawFilterField, ResultRawListOptions } from '../types';

@Injectable()
export class ResultsIndexService implements AppIndexService<ResultRaw> {
  #resultsStatusesService = inject(ResultsStatusesService);

  readonly tableName: string = 'results';

  readonly defaultColumns: ResultRawColumnKey[] = ['name', 'actions'];
  readonly availableColumns: ResultRawColumnKey[] = ['name', 'status', 'ownerTaskId', 'createdAt', 'sessionId', 'actions'];

  readonly dateColumns: ResultRawColumnKey[] = ['createdAt'];

  readonly columnsLabels: Record<ResultRawColumnKey, string> = {
    name: $localize`Name`,
    status: $localize`Status`,
    ownerTaskId: $localize`Owner Task ID`,
    createdAt: $localize`Created at`,
    sessionId: $localize`Session ID`,
    actions: $localize`Actions`,
    completedAt: $localize`Completed at`,
    resultId: $localize`Result ID`,
  };

  readonly defaultOptions: ResultRawListOptions = {
    pageIndex: 0,
    pageSize: 10,
    sort: {
      active: 'name',
      direction: 'asc'
    },
  };

  readonly defaultFilters: ResultRawFilter[] = [];
  readonly availableFiltersFields: ResultRawFilterField[] = [
    {
      field: 'name',
      type: 'text',
    },
    {
      field: 'status',
      type: 'select',
      options: Object.keys(this.#resultsStatusesService.statuses).map(status => {
        return {
          value: status,
          label: this.#resultsStatusesService.statuses[Number(status) as ResultStatus],
        };
      }),
    },
    {
      field: 'ownerTaskId',
      type: 'text',
    },
    {
      field: 'createdAt',
      type: 'date',
    },
    {
      field: 'sessionId',
      type: 'text',
    },
  ];

  readonly defaultIntervalValue: number = 10;

  #tableService = inject(TableService);

  columnToLabel(column: ResultRawColumnKey): string {
    return this.columnsLabels[column];
  }

  /**
   * Table
   */

  isSessionIdColumn(column: ResultRawColumnKey): boolean {
    return column === 'sessionId';
  }

  isActionsColumn(column: ResultRawColumnKey): boolean {
    return column === 'actions';
  }

  isStatusColumn(column: ResultRawColumnKey): boolean {
    return column === 'status';
  }

  isDateColumn(column: ResultRawColumnKey): boolean {
    return this.dateColumns.includes(column);
  }

  isNotSortableColumn(column: ResultRawColumnKey): boolean {
    return this.isActionsColumn(column);
  }

  isSimpleColumn(column: ResultRawColumnKey): boolean {
    return !this.isActionsColumn(column) && !this.isStatusColumn(column) && !this.isDateColumn(column) && !this.isSessionIdColumn(column);
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

  saveOptions(options: ResultRawListOptions): void {
    this.#tableService.saveOptions(this.tableName, options);
  }

  restoreOptions(): ResultRawListOptions {
    const options = this.#tableService.restoreOptions<ResultRaw>(this.tableName, this.defaultOptions);

    return options;
  }

  /**
   * Columns
   */

  saveColumns(columns: ResultRawColumnKey[]): void {
    this.#tableService.saveColumns(this.tableName, columns);
  }

  restoreColumns(): ResultRawColumnKey[] {
    return this.#tableService.restoreColumns<ResultRawColumnKey[]>(this.tableName) ?? this.defaultColumns;
  }

  resetColumns(): ResultRawColumnKey[] {
    this.#tableService.resetColumns(this.tableName);

    return Array.from(this.defaultColumns);
  }

  /**
   * Filters
   */

  saveFilters(filtersFields: ResultRawFilter[]): void {
    this.#tableService.saveFilters(this.tableName, filtersFields);
  }

  restoreFilters(): ResultRawFilter[] {
    return this.#tableService.restoreFilters<ResultRaw>(this.tableName, this.availableFiltersFields) ?? this.defaultFilters;
  }

  resetFilters(): ResultRawFilter[] {
    this.#tableService.resetFilters(this.tableName);

    return this.defaultFilters;
  }
}
