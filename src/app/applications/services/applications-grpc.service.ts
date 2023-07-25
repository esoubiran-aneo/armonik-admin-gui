import { ApplicationFiltersAnd, ApplicationRawEnumField, ApplicationRawField, ApplicationsClient, SortDirection as ArmoniKSortDirection, CountTasksByStatusApplicationRequest, CountTasksByStatusApplicationResponse, ListApplicationsRequest, ListApplicationsResponse } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { AppGrpcService } from '@app/types/services';
import { UtilsService } from '@services/utils.service';
import { ApplicationRaw, ApplicationRawFieldKey, ApplicationRawFilter, ApplicationRawListOptions } from '../types';
// FIXME: we need to export Filters from @aneoconsultingfr/armonik-api-angular
import { Filters as ApplicationsFilters, FiltersOr as ApplicationsFiltersOr, FilterField } from '@aneoconsultingfr/armonik.api.angular/lib/generated/applications-filters.pb';
import { Filter, FilterType, FiltersAnd, FiltersDefinition, FiltersOr } from '@app/types/filters';
import { ApplicationsIndexService } from './applications-index.service';

@Injectable()
export class ApplicationsGrpcService implements AppGrpcService<ApplicationRaw> {
  readonly #applicationsIndexService = inject(ApplicationsIndexService);
  readonly #applicationsClient = inject(ApplicationsClient);
  readonly #utilsService = inject(UtilsService<ApplicationRaw>);

  readonly sortDirections: Record<SortDirection, ArmoniKSortDirection> = {
    'asc': ArmoniKSortDirection.SORT_DIRECTION_ASC,
    'desc': ArmoniKSortDirection.SORT_DIRECTION_DESC,
    '': ArmoniKSortDirection.SORT_DIRECTION_UNSPECIFIED
  };

  readonly sortFields: Record<ApplicationRawFieldKey, ApplicationRawEnumField> = {
    'name': ApplicationRawEnumField.APPLICATION_RAW_ENUM_FIELD_NAME,
    'namespace': ApplicationRawEnumField.APPLICATION_RAW_ENUM_FIELD_NAMESPACE,
    'service': ApplicationRawEnumField.APPLICATION_RAW_ENUM_FIELD_SERVICE,
    'version': ApplicationRawEnumField.APPLICATION_RAW_ENUM_FIELD_VERSION,
  };

  list$(options: ApplicationRawListOptions, filters: ApplicationRawFilter): Observable<ListApplicationsResponse> {

    const requestFilters = this.createFilters(filters, this.#applicationsIndexService.filtersDefinitions);

    const request = new ListApplicationsRequest({
      page: options.pageIndex,
      pageSize: options.pageSize,
      sort: {
        direction: this.sortDirections[options.sort.direction],
        fields: [{
          applicationField: {
            field: this.sortFields[options.sort.active]
          }
        }]
      },
      filters: requestFilters
    });

    return this.#applicationsClient.listApplications(request);
  }

  get$(): Observable<never> {
    throw new Error('This method must never be called.');
  }

  // TODO: rename to countTasksByStatus$
  countByStatus$(name: string, version: string): Observable<CountTasksByStatusApplicationResponse> {
    const request = new CountTasksByStatusApplicationRequest({
      name,
      version
    });

    return this.#applicationsClient.countTasksByStatus(request);
  }

  createFilters(filters: FiltersOr<ApplicationRaw>, filtersDefinitions: FiltersDefinition<ApplicationRaw, ApplicationRawEnumField>[]): ApplicationsFilters.AsObject {
    const filtersOr = this.createFiltersOr(filters, filtersDefinitions);

    return {
      filters: filtersOr
    }
  }

  /**
   * Used to create a group of lines (OR).
   */
  createFiltersOr(filters: FiltersOr<ApplicationRaw>, filtersDefinitions: FiltersDefinition<ApplicationRaw, ApplicationRawEnumField>[]): ApplicationsFiltersOr.AsObject {
    const filtersOr = [];

    for (const filter of filters) {
      const filtersAnd = this.createFilterAnd(filter, filtersDefinitions);

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
  createFilterAnd(filters: FiltersAnd<ApplicationRaw>, filtersDefinitions: FiltersDefinition<ApplicationRaw, ApplicationRawEnumField>[]): ApplicationFiltersAnd.AsObject {
    const filtersAnd = [];

    for (const filter of filters) {
      const filterField = this.createFilterField(filter, filtersDefinitions);

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
  createFilterField(filter: Filter<ApplicationRaw>, filtersDefinitions: FiltersDefinition<ApplicationRaw, ApplicationRawEnumField>[]): FilterField.AsObject | null {
    if (filter.key === null || filter.value === null || filter.operator === null) {
      return null;
    }

    const type = this.#recoverType(filter, filtersDefinitions);
    const field = this.#recoverField(filter, filtersDefinitions);

    switch (type) {
      case 'string':
        return {
          string: {
            field: {
              applicationField: {
                // TODO: remove this cast when every filtersDefinition will be updated
                field: field as any
              },
            },
            value: filter.value.toString(),
            operator: filter.operator
        }
      }
      default: {
        throw new Error(`Type ${type} not supported`);
      }
    }
  }

  #recoverType(filter: Filter<ApplicationRaw>, filtersDefinitions: FiltersDefinition<ApplicationRaw, ApplicationRawEnumField>[]): FilterType  {
    const filterDefinition = filtersDefinitions.find(filterDefinition => filterDefinition.key === filter.key);

    if (!filterDefinition) {
      throw new Error(`Filter definition not found for key ${filter.key}`);
    }

    return filterDefinition.type;
  }

  // TODO: remove ths undefined once every filtersDefinition will be updated
  #recoverField(filter: Filter<ApplicationRaw>, filtersDefinitions: FiltersDefinition<ApplicationRaw, ApplicationRawEnumField>[]): ApplicationRawEnumField | undefined {
    const filterDefinition = filtersDefinitions.find(filterDefinition => filterDefinition.key === filter.key);

    if (!filterDefinition) {
      throw new Error(`Filter definition not found for key ${filter.key}`);
    }

    return filterDefinition.field;
  }
}
