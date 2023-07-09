import { Injectable, inject } from '@angular/core';
import { AppIndexService } from '@app/types/services';
import { TableService } from '@services/table.service';
import { PartitionRaw, PartitionRawColumnKey, PartitionRawFilter, PartitionRawFilterField, PartitionRawListOptions } from '../types';

@Injectable()
export class PartitionsIndexService implements AppIndexService<PartitionRaw> {
  readonly tableName: string = 'partitions';

  readonly defaultColumns: PartitionRawColumnKey[] = ['id', 'actions'];
  readonly availableColumns: PartitionRawColumnKey[] = ['id', 'priority', 'parentPartitionIds', 'podConfiguration', 'podMax', 'podReserved', 'preemptionPercentage', 'actions'];

  readonly objectColumns: PartitionRawColumnKey[] = ['podConfiguration', 'parentPartitionIds'];

  readonly columnsLabels: Record<PartitionRawColumnKey, string> = {
    id: $localize`ID`,
    priority: $localize`Priority`,
    parentPartitionIds: $localize`Parent Partition Ids`,
    podConfiguration: $localize`Pod Configuration`,
    podMax: $localize`Pod Max`,
    podReserved: $localize`Pod Reserved`,
    preemptionPercentage: $localize`Preemption Percentage`,
    actions: $localize`Actions`,
  };

  readonly defaultOptions: PartitionRawListOptions = {
    pageIndex: 0,
    pageSize: 10,
    sort: {
      active: 'id',
      direction: 'asc'
    },
  };

  readonly defaultFilters: PartitionRawFilter[] = [];
  readonly availableFiltersFields: PartitionRawFilterField[] = [
    // Do not add filter on array or object fields
    {
      field: 'id',
      type: 'text',
    },
    {
      field: 'priority',
      type: 'number',
    },
    {
      field: 'podMax',
      type: 'number',
    },
    {
      field: 'podReserved',
      type: 'number',
    },
    {
      field: 'preemptionPercentage',
      type: 'number',
    },
  ];

  readonly defaultIntervalValue: number = 10;

  #tableService = inject(TableService);

  columnToLabel(column: PartitionRawColumnKey): string {
    return this.columnsLabels[column];
  }

  /**
   * Table
   */
  isPartitionIdColumn(column: PartitionRawColumnKey): boolean {
    return column === 'id';
  }

  isActionsColumn(column: PartitionRawColumnKey): boolean {
    return column === 'actions';
  }

  isNotSortableColumn(column: PartitionRawColumnKey): boolean {
    return this.isActionsColumn(column) || this.isObjectColumn(column);
  }

  isObjectColumn(column: PartitionRawColumnKey): boolean {
    return this.objectColumns.includes(column);
  }

  isSimpleColumn(column: PartitionRawColumnKey): boolean {
    return !this.isActionsColumn(column) && !this.isPartitionIdColumn(column) && !this.isObjectColumn(column);
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

  saveOptions(options: PartitionRawListOptions): void {
    this.#tableService.saveOptions(this.tableName, options);
  }

  restoreOptions(): PartitionRawListOptions {
    const options = this.#tableService.restoreOptions<PartitionRaw>(this.tableName, this.defaultOptions);

    return options;
  }

  /**
   * Columns
   */

  saveColumns(columns: PartitionRawColumnKey[]): void {
    this.#tableService.saveColumns(this.tableName, columns);
  }

  restoreColumns(): PartitionRawColumnKey[] {
    return this.#tableService.restoreColumns<PartitionRawColumnKey[]>(this.tableName) ?? this.defaultColumns;
  }

  resetColumns(): PartitionRawColumnKey[] {
    this.#tableService.resetColumns(this.tableName);

    return Array.from(this.defaultColumns);
  }

  /**
   * Filters
   */

  saveFilters(filters: PartitionRawFilter[]): void {
    this.#tableService.saveFilters(this.tableName, filters);
  }

  restoreFilters(): PartitionRawFilter[] {
    return this.#tableService.restoreFilters<PartitionRaw>(this.tableName, this.availableFiltersFields) ?? this.defaultFilters;
  }

  resetFilters(): PartitionRawFilter[] {
    this.#tableService.resetFilters(this.tableName);

    return this.defaultFilters;
  }
}
