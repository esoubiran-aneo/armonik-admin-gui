import { Injectable } from '@angular/core';
import { Filter, FilterType, FilterValueOptions, FiltersAnd, FiltersDefinition, FiltersOr } from '@app/types/filters';

@Injectable()
export class UtilsService<T extends object, R, U = null> {

  createFilters<F>(filters: FiltersOr<T>, filtersDefinitions: FiltersDefinition<R, U>[], cb: (filter: Filter<T>) => (type: FilterType, field: U) => F) {
    const or = this.#createFiltersOr<F>(filters, filtersDefinitions, cb);

    return or;
  }

  /**
   * Used to create a group of lines (OR).
   */
  #createFiltersOr<F>(filters: FiltersOr<T>, filtersDefinitions: FiltersDefinition<R, U>[], cb: (filter: Filter<T>) => (type: FilterType, field: U) => F) {
    const filtersOr = [];

    for (const filter of filters) {
      const filtersAnd = this.#createFiltersAnd<F>(filter, filtersDefinitions, cb);

      if (filtersAnd.and && filtersAnd.and.length > 0) {
        filtersOr.push(filtersAnd);
      }
    }

    return {
      or: filtersOr
    };
  }

  /**
   * Used to create a line of filters (AND).
   */
  #createFiltersAnd<F>(filters: FiltersAnd<T>, filtersDefinitions: FiltersDefinition<R, U>[], cb: (filter: Filter<T>) => (type: FilterType, field: U) => F) {
    const filtersAnd = [];

    for (const filter of filters) {
      const filterField = this.#createFilterField<F>(filter, filtersDefinitions, cb(filter));

      if (filterField) {
        filtersAnd.push(filterField);
      }
    }

    return {
      and: filtersAnd
    };
  }

  /**
   * Used to define a filter field.
   */
  #createFilterField<F>(filter: Filter<T>, filtersDefinitions: FiltersDefinition<R, U>[], cb: (type: FilterType, field: U) => F): F | null {
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
  recoverType(filter: Filter<T>, filtersDefinitions: FiltersDefinition<R, U>[]): FilterType  {
    const filterDefinition = this.#recoverFilterDefinition(filter, filtersDefinitions);

    return filterDefinition.type;
  }

  /**
   * Recover statuses of a filter definition using the filter.
   */
  recoverStatuses(filter: Filter<T>, filtersDefinitions: FiltersDefinition<R, U>[]): FilterValueOptions {
    const filterDefinition = this.#recoverFilterDefinition(filter, filtersDefinitions);

    if (filterDefinition.type !== 'status') {
      throw new Error('Filter definition is not a status');
    }

    return filterDefinition.statuses;
  }

  /**
   * Recover the field of a filter definition using the filter.
   */
  #recoverField(filter: Filter<T>, filtersDefinitions: FiltersDefinition<R, U>[]): U {
    const filterDefinition = this.#recoverFilterDefinition(filter, filtersDefinitions);

    // TODO: remove this cast once every filtersDefinition will be updated
    return filterDefinition.field as U;
  }


  /**
   * Recover the filter definition using the filter key.
   */
  #recoverFilterDefinition(filter: Filter<T>, filtersDefinitions: FiltersDefinition<R, U>[]): FiltersDefinition<R, U> {
    const filterDefinition = filtersDefinitions.find(filterDefinition => filterDefinition.key === filter.key);

    if (!filterDefinition) {
      throw new Error(`Filter definition not found for key ${filter.key?.toString()}`);
    }

    return filterDefinition;
  }
}
