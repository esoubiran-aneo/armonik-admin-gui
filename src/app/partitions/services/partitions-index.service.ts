import { Injectable } from '@angular/core';
import { ListOptions } from '@app/types/options';
import { AppIndexService } from '@app/types/services';
import { TableService } from '@services/table.service';
import { PartitionRaw, PartitionRawColumn, PartitionRawFilter, PartitionRawFilterField, PartitionRawListOptions } from '../types';

@Injectable()
export class PartitionsIndexService implements AppIndexService<PartitionRaw> {
  readonly tableName: string = 'partitions';

  readonly defaultColumns: PartitionRawColumn[] = ['id', 'actions'];
  readonly availableColumns: PartitionRawColumn[] = ['id', 'priority', 'parentPartitionIds', 'podConfiguration', 'podMax', 'podReserved', 'preemptionPercentage', 'actions'];

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
    {
      field: 'id',
      type: 'text',
    },
    {
      field: 'priority',
      type: 'text',
    },
    {
      field: 'parentPartitionIds',
      type: 'text',
    },
    {
      field: 'podConfiguration',
      type: 'text',
    },
    {
      field: 'podMax',
      type: 'text',
    },
    {
      field: 'podReserved',
      type: 'text',
    },
    {
      field: 'preemptionPercentage',
      type: 'text',
    },
  ];

  readonly defaultIntervalValue: number = 10;

  constructor(private _tableService: TableService) {}

  generateSharableURL(options: PartitionRawListOptions, filters: PartitionRawFilter[]): string {
    return this._tableService.generateSharableURL(options, filters);
  }

  /**
   * Interval
   */

  saveIntervalValue(value: number): void {
    this._tableService.saveIntervalValue(this.tableName, value);
  }

  restoreIntervalValue(): number {
    return this._tableService.restoreIntervalValue(this.tableName) ?? this.defaultIntervalValue;
  }

  /**
   * Options
   */

  saveOptions(options: PartitionRawListOptions): void {
    this._tableService.saveOptions(this.tableName, options);
  }

  restoreOptions(): PartitionRawListOptions {
    const options = this._tableService.restoreOptions<PartitionRaw>(this.tableName, this.defaultOptions);

    return options;
  }

  /**
   * Columns
   */

  saveColumns(columns: PartitionRawColumn[]): void {
    this._tableService.saveColumns(this.tableName, columns);
  }

  restoreColumns(): PartitionRawColumn[] {
    return this._tableService.restoreColumns<PartitionRawColumn[]>(this.tableName) ?? this.defaultColumns;
  }

  resetColumns(): PartitionRawColumn[] {
    this._tableService.resetColumns(this.tableName);

    return this.defaultColumns;
  }

  /**
   * Filters
   */

  saveFilters(filters: PartitionRawFilter[]): void {
    this._tableService.saveFilters(this.tableName, filters);
  }

  restoreFilters(): PartitionRawFilter[] {
    return this._tableService.restoreFilters<PartitionRawFilter[]>(this.tableName) ?? this.defaultFilters;
  }

  resetFilters(): PartitionRawFilter[] {
    this._tableService.resetFilters(this.tableName);

    return this.defaultFilters;
  }
}