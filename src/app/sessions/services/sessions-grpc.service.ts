import { SortDirection as ArmoniKSortDirection, CancelSessionRequest, CancelSessionResponse, CountTasksByStatusSessionRequest, CountTasksByStatusSessionResponse, GetSessionRequest, GetSessionResponse, ListSessionsRequest, ListSessionsResponse, SessionRawEnumField, SessionsClient } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { AppGrpcService } from '@app/types/services';
import { UtilsService } from '@services/utils.service';
import { SessionRaw, SessionRawFieldKey, SessionRawFilter, SessionRawListOptions } from '../types';

@Injectable()
export class SessionsGrpcService implements AppGrpcService<SessionRaw> {
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

  constructor(
    private _sessionsClient: SessionsClient,
    private _utilsService: UtilsService<SessionRaw>
  ) {}

  list$(options: SessionRawListOptions, filters: SessionRawFilter[]): Observable<ListSessionsResponse> {
    const findFilter = this._utilsService.findFilter;

    const listSessionsRequest = new ListSessionsRequest({
      page: options.pageIndex,
      pageSize: options.pageSize,
      sort: {
        direction: this.sortDirections[options.sort.direction],
        field: {
          // TODO: waiting for new sort field
          // @see https://github.com/aneoconsulting/ArmoniK.Api/pull/307
          sessionRawField: {
            field: this.sortFields[options.sort.active] ?? SessionRawEnumField.SESSION_RAW_ENUM_FIELD_SESSION_ID
          }
        }
      },
      // filter: {
      //   sessionId: this._utilsService.convertFilterValue(findFilter(filters, 'sessionId')),
      //   // TODO: waiting for the new filter
      //   // applicationName: convertFilterValue(findFilter(filters, '')),
      //   // applicationVersion: convertFilterValue(findFilter(filters, 'applicationVersion')),
      //   applicationName: '',
      //   applicationVersion: '',
      //   status: this._utilsService.convertFilterValueToStatus<SessionStatus>(findFilter(filters, 'status')) ?? SessionStatus.SESSION_STATUS_UNSPECIFIED,
      // }
    });

    return this._sessionsClient.listSessions(listSessionsRequest);
  }

  get$(sessionId: string): Observable<GetSessionResponse> {
    const getSessionRequest = new GetSessionRequest({
      sessionId
    });

    return this._sessionsClient.getSession(getSessionRequest);
  }

  cancel$(sessionId: string): Observable<CancelSessionResponse> {
    const cancelSessionRequest = new CancelSessionRequest({
      sessionId
    });

    return this._sessionsClient.cancelSession(cancelSessionRequest);
  }

  countTasksByStatus$(sessionId: string): Observable<CountTasksByStatusSessionResponse> {
    const request = new CountTasksByStatusSessionRequest({
      sessionId
    });

    return this._sessionsClient.countTasksByStatus(request);
  }
}
