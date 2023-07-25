import { SortDirection as ArmoniKSortDirection, CancelSessionRequest, CancelSessionResponse, CountTasksByStatusSessionRequest, CountTasksByStatusSessionResponse, GetSessionRequest, GetSessionResponse, ListSessionsRequest, ListSessionsResponse, SessionFilterField, SessionRawEnumField, SessionsClient } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { AppGrpcService } from '@app/types/services';
import { UtilsService } from '@services/utils.service';
import { SessionRaw, SessionRawField, SessionRawFieldKey, SessionRawFilter, SessionRawListOptions } from '../types';
import { SessionsIndexService } from './sessions-index.service';
import { Filter, FilterType } from '@app/types/filters';

@Injectable()
export class SessionsGrpcService implements AppGrpcService<SessionRaw> {
  readonly #sessionsIndexService = inject(SessionsIndexService);
  readonly #sessionsClient = inject(SessionsClient);
  readonly #utilsService = inject(UtilsService<SessionRaw, SessionRawField>);

  readonly sortDirections: Record<SortDirection, ArmoniKSortDirection> = {
    'asc': ArmoniKSortDirection.SORT_DIRECTION_ASC,
    'desc': ArmoniKSortDirection.SORT_DIRECTION_DESC,
    '': ArmoniKSortDirection.SORT_DIRECTION_UNSPECIFIED
  };

  readonly sortFields: Record<SessionRawFieldKey, SessionRawEnumField> = {
    'sessionId': SessionRawEnumField.SESSION_RAW_ENUM_FIELD_SESSION_ID,
    'status': SessionRawEnumField.SESSION_RAW_ENUM_FIELD_STATUS,
    'createdAt': SessionRawEnumField.SESSION_RAW_ENUM_FIELD_CREATED_AT,
    'cancelledAt': SessionRawEnumField.SESSION_RAW_ENUM_FIELD_CANCELLED_AT,
    'options': SessionRawEnumField.SESSION_RAW_ENUM_FIELD_OPTIONS,
    'partitionIds': SessionRawEnumField.SESSION_RAW_ENUM_FIELD_PARTITION_IDS,
    'duration': SessionRawEnumField.SESSION_RAW_ENUM_FIELD_DURATION,
  };

  list$(options: SessionRawListOptions, filters: SessionRawFilter): Observable<ListSessionsResponse> {

    const requestFilters = this.#utilsService.createFilters<SessionFilterField.AsObject>(filters, this.#sessionsIndexService.filtersDefinitions, this.#buildFilterField);

    const listSessionsRequest = new ListSessionsRequest({
      page: options.pageIndex,
      pageSize: options.pageSize,
      sort: {
        direction: this.sortDirections[options.sort.direction],
        field: {
          sessionRawField: {
            field: this.sortFields[options.sort.active] ?? SessionRawEnumField.SESSION_RAW_ENUM_FIELD_SESSION_ID
          }
        }
      },
      filters: requestFilters
    });

    return this.#sessionsClient.listSessions(listSessionsRequest);
  }

  get$(sessionId: string): Observable<GetSessionResponse> {
    const getSessionRequest = new GetSessionRequest({
      sessionId
    });

    return this.#sessionsClient.getSession(getSessionRequest);
  }

  cancel$(sessionId: string): Observable<CancelSessionResponse> {
    const cancelSessionRequest = new CancelSessionRequest({
      sessionId
    });

    return this.#sessionsClient.cancelSession(cancelSessionRequest);
  }

  countTasksByStatus$(sessionId: string): Observable<CountTasksByStatusSessionResponse> {
    const request = new CountTasksByStatusSessionRequest({
      sessionId
    });

    return this.#sessionsClient.countTasksByStatus(request);
  }

  #buildFilterField(filter: Filter<SessionRaw>) {
    return (type: FilterType, field: SessionRawField) => {
      switch (type) {
        case 'string':
          return {
            string: {
              field: {
                // TODO: to know the level, we need to check how many times the field is prefix by options.
                sessionRawField: {
                  field: field as SessionRawEnumField
                }
              },
              value: filter.value?.toString() ?? '',
              operator: filter.operator ?? 0
            }
          } satisfies SessionFilterField.AsObject;
        case 'status':
          return {
            status: {
              field: {
                sessionRawField: {
                  field: field as SessionRawEnumField
                }
              },
              value: Number(filter.value) ?? 0,
              operator: filter.operator ?? 0
            }
          } satisfies SessionFilterField.AsObject;
        default:
          throw new Error(`Type ${type} not supported`);
      }
    }
  }
}
