import { Injectable } from '@angular/core';
import { FieldKey } from '@app/types/data';
import { Filter, FilterType, FiltersAnd, FiltersDefinition, FiltersOr } from '@app/types/filters';

@Injectable()
export class UtilsService<T extends object, U = null> {
  // TODO: remove this function
  findFilter(filters: Filter<T>[], field: FieldKey<T>): Filter<T> | null {
    const filter = filters.find(f => f.key === field);

    if (!filter) {
      return null;
    }

    return filter;
  }

  // TODO: remove this function
  convertFilterValue(filter: Filter<T> | null): string {
    if (!filter) {
      return '';
    }

    if (!filter.value) {
      return '';
    }

    return filter.value.toString();
  }

  // TODO: remove this function
  convertFilterValueToNumber(filter: Filter<T> | null): number | null {
    if (!filter) {
      return null;
    }

    if (!filter.value) {
      return null;
    }

    const numberValue = Number(filter.value);

    if (Number.isNaN(numberValue)) {
      return null;
    }

    return numberValue;
  }

  // TODO: remove this function
  convertFilterValueToStatus<S>(filter: Filter<T> | null): S | null {
    const status = this.convertFilterValueToNumber(filter);

    if (status === null) {
      return null;
    }

    return status as S;
  }

  createFilters<F>(filters: FiltersOr<T>, filtersDefinitions: FiltersDefinition<T, U>[], cb: (filter: Filter<T>) => (type: FilterType, field: U) => F) {
    const filtersOr = this.#createFiltersOr<F>(filters, filtersDefinitions, cb);

    return {
      filters: filtersOr
    }
  }

  /**
   * Used to create a group of lines (OR).
   */
  #createFiltersOr<F>(filters: FiltersOr<T>, filtersDefinitions: FiltersDefinition<T, U>[], cb: (filter: Filter<T>) => (type: FilterType, field: U) => F) {
    const filtersOr = [];

    for (const filter of filters) {
      const filtersAnd = this.#createFiltersAnd<F>(filter, filtersDefinitions, cb);

      if (filtersAnd.filters && filtersAnd.filters.length > 0) {
        filtersOr.push(filtersAnd);
      }
    }

    return {
      filters: filtersOr
    };
  }

  /**
   * Used to create a line of filters (AND).
   */
  #createFiltersAnd<F>(filters: FiltersAnd<T>, filtersDefinitions: FiltersDefinition<T, U>[], cb: (filter: Filter<T>) => (type: FilterType, field: U) => F) {
    const filtersAnd = [];

    for (const filter of filters) {
      const filterField = this.#createFilterField<F>(filter, filtersDefinitions, cb(filter));

      if (filterField) {
        filtersAnd.push(filterField);
      }
    }

    return {
      filters: filtersAnd
    };
  }

  /**
   * Used to define a filter field.
   */
  #createFilterField<F>(filter: Filter<T>, filtersDefinitions: FiltersDefinition<T, U>[], cb: (type: FilterType, field: U) => F): F | null {
    if (filter.key === null || filter.value === null || filter.operator === null) {
        return null;
    }

    const type = this.recoverType(filter, filtersDefinitions);
    const field = this.#recoverField(filter, filtersDefinitions);

    return cb(type, field);
  }

  /**
   * Recover the type of a filter definition using the filter.
   */
  recoverType(filter: Filter<T>, filtersDefinitions: FiltersDefinition<T, U>[]): FilterType  {
    const filterDefinition = this.#recoverFilterDefinition(filter, filtersDefinitions);

    return filterDefinition.type;
  }

  /**
   * Recover the field of a filter definition using the filter.
   */
  #recoverField(filter: Filter<T>, filtersDefinitions: FiltersDefinition<T, U>[]): U {
    const filterDefinition = this.#recoverFilterDefinition(filter, filtersDefinitions);

    // TODO: remove this cast once every filtersDefinition will be updated
    return filterDefinition.field as U;
  }


  /**
   * Recover the filter definition using the filter key.
   */
  #recoverFilterDefinition(filter: Filter<T>, filtersDefinitions: FiltersDefinition<T, U>[]): FiltersDefinition<T, U> {
    const filterDefinition = filtersDefinitions.find(filterDefinition => filterDefinition.key === filter.key);

    if (!filterDefinition) {
      throw new Error(`Filter definition not found for key ${filter.key?.toString()}`);
    }

    return filterDefinition;
  }
}
