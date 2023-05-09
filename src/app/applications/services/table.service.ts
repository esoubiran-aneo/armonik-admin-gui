import { Injectable } from "@angular/core";
import { TableURLService } from "./table-url.service";
import { TableStorageService } from "./table-storage.service";
import { ListOptions } from "../types";
import { SortDirection } from "@angular/material/sort";

/**
 * Service to save and restore table state using the URL and the storage.
 */
@Injectable()
export class TableService {
  private _columnsKey = 'columns';
  private _intervalKey = 'interval';
  private _optionsKey = 'options';
  private _filtersKey = 'filters';

  constructor(private _storage: Storage, private _tableURLService: TableURLService, private _tableStorageService: TableStorageService) {}

  saveIntervalValue(tableName: string, value: number): void {
    const storageKey = this._buildKey(tableName, this._intervalKey);

    this._tableStorageService.save(storageKey, value);
  }

  restoreIntervalValue(tableName: string): number | null {
    const storageKey = this._buildKey(tableName, this._intervalKey);

    const value =  this._tableStorageService.restore<string>(storageKey, false);

    if (!value) {
      return null;
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return null;
    }

    return numberValue;
  }


  /**
   * Save options to the storage
   */
  saveOptions<T>(tableName: string, options: T): void {
    const storageKey = this._buildKey(tableName, this._optionsKey);

    this._tableStorageService.save(storageKey, options);
  }

  /**
   * Restore options from the storage
   */
  restoreOptions<T extends string>(tableName: string, defaultOptions: ListOptions<T>): ListOptions<T> {
    const storageKey = this._buildKey(tableName, this._optionsKey);
    const storageData = this._tableStorageService.restore<T>(storageKey) as ListOptions<T> | null;

    function convertValueToNumber(value: string | null): number | null {
      if (!value) {
        return null;
      }

      const numberValue = Number(value);

      if (Number.isNaN(numberValue)) {
        return null;
      }

      return numberValue;
    }

    const options: ListOptions<T> = {
      pageIndex: convertValueToNumber(this._tableURLService.getQueryParams('pageIndex', false)) ?? storageData?.pageIndex ?? defaultOptions?.pageIndex,
      pageSize: convertValueToNumber(this._tableURLService.getQueryParams('pageSize', false)) ?? storageData?.pageSize ?? defaultOptions?.pageSize,
      sort: {
        active: this._tableURLService.getQueryParams<T>('sort', false) ?? storageData?.sort.active ?? defaultOptions?.sort.active,
        direction: this._tableURLService.getQueryParams<SortDirection>('order', false) ?? storageData?.sort.direction ?? defaultOptions?.sort.direction,
      },
    }

    return options
  }

  /**
   * Restore filters from the URL and then from the storage
   */
  restoreFilters<T>(tableName:string): T | null {
    const storageKey = this._buildKey(tableName, this._filtersKey);

    const queryParams = this._tableURLService.getQueryParams<T>(this._filtersKey) as T;
    const storageData = this._tableStorageService.restore<T>(storageKey) as T;

    return queryParams || storageData;
  }

  /**
   * Restore filters from the URL and then from the storage
   */
  saveFilters(tableName: string, filters: unknown) {
    const storageKey = this._buildKey(tableName, this._filtersKey);

    this._tableStorageService.save(storageKey, filters);
  }


  /**
   * Save columns to the local storage
   */
  saveColumns(tableName: string, columns: string[]): void {
    const key = this._buildKey(tableName, this._columnsKey);
    this._storage.setItem(key, JSON.stringify(columns));
  }

  /**
   * Restore columns from the local storage
   */
  restoreColumns<T>(tableName: string): T | null {
    const key = this._buildKey(tableName, this._columnsKey);

    return this._tableStorageService.restore<T>(key) as T;
  }

  /**
   * Build the key to store data in local storage
   */
  private _buildKey(tableName: string, key: string): string {
    return `${tableName}_${key}`;
  }
}
