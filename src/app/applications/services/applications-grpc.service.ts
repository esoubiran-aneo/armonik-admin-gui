import { ApplicationFilterField, ApplicationRawEnumField, ApplicationsClient, SortDirection as ArmoniKSortDirection, CountTasksByStatusApplicationRequest, CountTasksByStatusApplicationResponse, ListApplicationsRequest, ListApplicationsResponse } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { Filter, FilterType } from '@app/types/filters';
import { AppGrpcService } from '@app/types/services';
import { UtilsService } from '@services/utils.service';
import { ApplicationsIndexService } from './applications-index.service';
import { ApplicationRaw, ApplicationRawFieldKey, ApplicationRawFilter, ApplicationRawListOptions } from '../types';

@Injectable()
export class ApplicationsGrpcService implements AppGrpcService<ApplicationRaw> {
  readonly #applicationsIndexService = inject(ApplicationsIndexService);
  readonly #applicationsClient = inject(ApplicationsClient);
  readonly #utilsService = inject(UtilsService<ApplicationRaw, ApplicationRawEnumField>);

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

    const requestFilters = this.#utilsService.createFilters<ApplicationFilterField.AsObject>(filters, this.#applicationsIndexService.filtersDefinitions, this.#buildFilterField);

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

  #buildFilterField(filter: Filter<ApplicationRaw>) {
    return (type: FilterType, field: ApplicationRawEnumField) => {
      switch (type) {
        case 'string':
          return {
            string: {
              field: {
                applicationField: {
                  field: field
                },
              },
              value: filter.value?.toString() ?? '',
              operator: filter.operator ?? 0
            }
          } satisfies ApplicationFilterField.AsObject;
        default: {
          throw new Error(`Type ${type} not supported`);
        }
      }
    };
  }
}
