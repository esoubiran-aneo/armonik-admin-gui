import { ListResultsRequest, ListResultsResponse, ResultStatus, ResultsClient } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { GrpcMessage } from '@ngx-grpc/common';
import { Observable } from 'rxjs';
import { AppGrpcService } from '@app/types/services';
import { UtilsService } from '@services/utils.service';
import {  ResultRaw, ResultRawFilter, ResultRawKeyField, ResultRawListOptions } from '../types';

@Injectable()
export class ResultsGrpcService implements AppGrpcService<ResultRaw> {
  readonly sortDirections: Record<SortDirection, ListResultsRequest.OrderDirection> = {
    'asc': ListResultsRequest.OrderDirection.ORDER_DIRECTION_ASC,
    'desc': ListResultsRequest.OrderDirection.ORDER_DIRECTION_DESC,
    '': ListResultsRequest.OrderDirection.ORDER_DIRECTION_ASC
  };

  readonly sortFields: Record<ResultRawKeyField, ListResultsRequest.OrderByField> = {
    'sessionId': ListResultsRequest.OrderByField.ORDER_BY_FIELD_SESSION_ID,
    'name': ListResultsRequest.OrderByField.ORDER_BY_FIELD_NAME,
    'status': ListResultsRequest.OrderByField.ORDER_BY_FIELD_STATUS,
    'createdAt': ListResultsRequest.OrderByField.ORDER_BY_FIELD_CREATED_AT,
    'ownerTaskId': ListResultsRequest.OrderByField.ORDER_BY_FIELD_OWNER_TASK_ID,
  };


  constructor(
    private _resultsClient: ResultsClient,
    private _utilsService: UtilsService<ResultRaw>
  ) { }

  list$(options: ResultRawListOptions, filters: ResultRawFilter[]): Observable<ListResultsResponse> {
    const findFilter = this._utilsService.findFilter;
    const convertFilterValue = this._utilsService.convertFilterValue;
    const convertFilterValueToNumber = this._utilsService.convertFilterValueToNumber;

    const listResultRequest = new ListResultsRequest({
      page: options.pageIndex,
      pageSize: options.pageSize,
      sort: {
        direction: this.sortDirections[options.sort.direction],
        field: this.sortFields[options.sort.active] ?? ListResultsRequest.OrderByField.ORDER_BY_FIELD_SESSION_ID
      },
      filter: {
        name: convertFilterValue(findFilter(filters, 'name')),
        // TODO: Find a way to convert the status (as sort direction, we can create a corresponding enum)
        status: ResultStatus.RESULT_STATUS_UNSPECIFIED,
        ownerTaskId: convertFilterValue(findFilter(filters, 'ownerTaskId')),
        sessionId: convertFilterValue(findFilter(filters, 'sessionId')),
        // TODO: Find a way to get the created after and the created before (for now, they are optional)
      }
    });

    return this._resultsClient.listResults(listResultRequest);
  }

  get$(id: string): Observable<never> {
    // TODO: Not available in ArmoniK.Api.Angular
    throw new Error('Method not implemented.');
  }
}