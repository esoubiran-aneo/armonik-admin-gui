import { Injectable, inject } from '@angular/core';
import { ColumnKey } from '@app/types/data';
import { AppIndexService } from '@app/types/services';
import { TableService } from '@services/table.service';
import { ResultRaw, ResultRawColumnKey, ResultRawFilter, ResultRawFilterField, ResultRawListOptions } from '../types';

@Injectable()
export class ResultsIndexService implements AppIndexService<ResultRaw> {
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
      // TODO: Create a select filter (with some default options written in code)
      type: 'text',
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

  saveColumns(columns: ColumnKey<ResultRaw>[]): void {
    this.#tableService.saveColumns(this.tableName, columns);
  }

  restoreColumns(): ColumnKey<ResultRaw>[] {
    return this.#tableService.restoreColumns<ResultRawColumnKey[]>(this.tableName) ?? this.defaultColumns;
  }

  resetColumns(): ResultRawColumnKey[] {
    this.#tableService.resetColumns(this.tableName);

    return this.defaultColumns;
  }

  /**
   * Filters
   */

  saveFilters(filtersFields: ResultRawFilter[]): void {
    this.#tableService.saveFilters(this.tableName, filtersFields);
  }

  restoreFilters(): ResultRawFilter[] {
    return this.#tableService.restoreFilters<ResultRawFilter[]>(this.tableName) ?? this.defaultFilters;
  }

  resetFilters(): ResultRawFilter[] {
    this.#tableService.resetFilters(this.tableName);

    return this.defaultFilters;
  }
}
