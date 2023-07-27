import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FieldKey } from '@app/types/data';
import { Filter, FiltersDefinition, FiltersOr } from '@app/types/filters';
import { QueryParamsOptionsKey } from '@app/types/query-params';

/**
 * Service to manage the URL for the table.
 * It's a low level service that should be used by the TableService.
 */
@Injectable()
export class TableURLService {
  constructor(private _route: ActivatedRoute) {}

  getQueryParamsOptions<T>(key: QueryParamsOptionsKey) {
    return this.getQueryParam<T>(key, false);
  }

  getQueryParamsFilters<T extends object, R, U = null>(filtersDefinitions: FiltersDefinition<R, U>[]): FiltersOr<T> {
    const params: Map<string, Filter<T>[]>  = new Map();
    const filters: FiltersOr<T> = [];

    const extractValues = /or-(?<order>\d)-operator-(?<operator>\d)-(?<field>.*)/;
    const keys = this.getQueryParamKeys();

    for (const key of keys) {
      const match = key.match(extractValues);
      const order = match?.groups?.['order'];
      const field = match?.groups?.['field'];
      const operator = match?.groups?.['operator'];

      if (!order || !field || !operator) {
        console.error('Invalid key', key);
        continue;
      }

      const isInDefinition = filtersDefinitions.some(definition => definition.key === field);

      if (!isInDefinition) {
        console.error('Unknown field', field);
        continue;
      }

      const currentParams = params.get(order) ?? [] as Filter<T>[];

      currentParams.push({
        key: field as FieldKey<T>,
        operator: Number(operator),
        value: this.getQueryParam(key, false)
      });

      params.set(order, currentParams);
    }

    for (const [, value] of params) {
      filters.push(value);
    }

    return filters;
  }

  getQueryParamKeys(): string[] {
    return this._route.snapshot.queryParamMap.keys;
  }

  getQueryParam<T>(key: string, parse = true) {
    const data = this._route.snapshot.queryParamMap.get(key);

    if(data && parse) {
      return JSON.parse(data) as T;
    } else if (data) {
      return data as T;
    }

    return null;
  }

  #unreachable(x: never): never {
    throw new Error('Unreachable ' + x);
  }
}
