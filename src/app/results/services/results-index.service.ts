import { ResultRawEnumField, ResultStatus } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { DefaultConfigService } from '@services/default-config.service';
import { TableService } from '@services/table.service';
import { ResultsStatusesService } from './results-statuses.service';
import { ResultRaw, ResultRawColumnKey, ResultRawFilter, ResultRawListOptions, ResultsFiltersDefinition } from '../types';

// TODO: Add it to AppIndexService and to every index service
@Injectable()
export class ResultsIndexService {
  #defaultConfigService = inject(DefaultConfigService);
  #resultsStatusesService = inject(ResultsStatusesService);

  readonly defaultColumns: ResultRawColumnKey[] = this.#defaultConfigService.defaultResults.columns;
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

  readonly defaultOptions: ResultRawListOptions = this.#defaultConfigService.defaultResults.options;

  readonly defaultFilters: ResultRawFilter = this.#defaultConfigService.defaultResults.filters;
  readonly filtersDefinitions: ResultsFiltersDefinition[] = [
    {
      key: 'name',
      field: ResultRawEnumField.RESULT_RAW_ENUM_FIELD_NAME,
      type: 'string',
    },
    {
      key: 'sessionId',
      field: ResultRawEnumField.RESULT_RAW_ENUM_FIELD_SESSION_ID,
      type: 'string',
    },
    {
      key: 'ownerTaskId',
      field: ResultRawEnumField.RESULT_RAW_ENUM_FIELD_OWNER_TASK_ID,
      type: 'string',
    },
    {
      key: 'status',
      field: ResultRawEnumField.RESULT_RAW_ENUM_FIELD_STATUS,
      type: 'status',
      statuses: Object.keys(this.#resultsStatusesService.statuses).map(status => {
        return {
          key: status,
          value: this.#resultsStatusesService.statuses[Number(status) as ResultStatus],
        };
      }),
    }
    // {
    //   field: 'name',
    //   type: 'text',
    // },
    // {
    //   field: 'status',
    //   type: 'select',
    //   options: Object.keys(this.#resultsStatusesService.statuses).map(status => {
    //     return {
    //       value: status,
    //       label: this.#resultsStatusesService.statuses[Number(status) as ResultStatus],
    //     };
    //   }),
    // },
    // {
    //   field: 'ownerTaskId',
    //   type: 'text',
    // },
    // {
    //   field: 'createdAt',
    //   type: 'date',
    // },
    // {
    //   field: 'sessionId',
    //   type: 'text',
    // },
  ];

  readonly defaultIntervalValue: number = this.#defaultConfigService.defaultResults.interval;

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
    this.#tableService.saveIntervalValue('results-interval', value);
  }

  restoreIntervalValue(): number {
    return this.#tableService.restoreIntervalValue('results-interval') ?? this.defaultIntervalValue;
  }

  /**
   * Options
   */

  saveOptions(options: ResultRawListOptions): void {
    this.#tableService.saveOptions('results-options', options);
  }

  restoreOptions(): ResultRawListOptions {
    const options = this.#tableService.restoreOptions<ResultRaw>('results-options', this.defaultOptions);

    return options;
  }

  /**
   * Columns
   */

  saveColumns(columns: ResultRawColumnKey[]): void {
    this.#tableService.saveColumns('results-columns', columns);
  }

  restoreColumns(): ResultRawColumnKey[] {
    return this.#tableService.restoreColumns<ResultRawColumnKey[]>('results-columns') ?? this.defaultColumns;
  }

  resetColumns(): ResultRawColumnKey[] {
    this.#tableService.resetColumns('results-columns');

    return Array.from(this.defaultColumns);
  }

  /**
   * Filters
   */

  saveFilters(filtersFields: ResultRawFilter): void {
    this.#tableService.saveFilters('results-filters', filtersFields);
  }

  restoreFilters(): ResultRawFilter {
    return this.#tableService.restoreFilters<ResultRaw, ResultRawColumnKey, ResultRawEnumField>('results-filters', this.filtersDefinitions) ?? this.defaultFilters;
  }

  resetFilters(): ResultRawFilter {
    this.#tableService.resetFilters('results-filters');

    return this.defaultFilters;
  }
}
