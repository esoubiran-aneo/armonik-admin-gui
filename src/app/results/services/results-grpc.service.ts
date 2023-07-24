import { SortDirection as ArmoniKSortDirection, GetResultRequest, GetResultResponse, ListResultsRequest, ListResultsResponse, ResultRawEnumField, ResultRawField, ResultStatus, ResultsClient } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { AppGrpcService } from '@app/types/services';
import { UtilsService } from '@services/utils.service';
import {  ResultRaw, ResultRawFieldKey, ResultRawFilter, ResultRawListOptions } from '../types';

@Injectable()
export class ResultsGrpcService implements AppGrpcService<ResultRaw> {
  #utilsService = inject(UtilsService<ResultRaw>);
  #resultsClient = inject(ResultsClient);

  readonly sortDirections: Record<SortDirection, ArmoniKSortDirection> = {
    'asc': ArmoniKSortDirection.SORT_DIRECTION_ASC,
    'desc': ArmoniKSortDirection.SORT_DIRECTION_DESC,
    '': ArmoniKSortDirection.SORT_DIRECTION_UNSPECIFIED
  };

  readonly sortFields: Record<ResultRawFieldKey, ResultRawEnumField> = {
    'sessionId': ResultRawEnumField.RESULT_RAW_ENUM_FIELD_SESSION_ID,
    'name': ResultRawEnumField.RESULT_RAW_ENUM_FIELD_NAME,
    'status': ResultRawEnumField.RESULT_RAW_ENUM_FIELD_STATUS,
    'createdAt': ResultRawEnumField.RESULT_RAW_ENUM_FIELD_CREATED_AT,
    'ownerTaskId': ResultRawEnumField.RESULT_RAW_ENUM_FIELD_OWNER_TASK_ID,
    'resultId': ResultRawEnumField.RESULT_RAW_ENUM_FIELD_RESULT_ID,
    'completedAt': ResultRawEnumField.RESULT_RAW_ENUM_FIELD_COMPLETED_AT,
  };


  list$(options: ResultRawListOptions, filters: ResultRawFilter[]): Observable<ListResultsResponse> {
    const findFilter = this.#utilsService.findFilter;
    const convertFilterValue = this.#utilsService.convertFilterValue;

    const listResultRequest = new ListResultsRequest({
      page: options.pageIndex,
      pageSize: options.pageSize,
      sort: {
        direction: this.sortDirections[options.sort.direction],
        field: {
          resultRawField: {
            field: this.sortFields[options.sort.active] ?? ResultRawEnumField.RESULT_RAW_ENUM_FIELD_RESULT_ID
          }
        }
      },
      // filter: {
      //   name: convertFilterValue(findFilter(filters, 'name')),
      //   // TODO: Find a way to convert the status (as sort direction, we can create a corresponding enum)
      //   status: this.#utilsService.convertFilterValueToStatus<ResultStatus>(findFilter(filters, 'status')) ?? ResultStatus.RESULT_STATUS_UNSPECIFIED,
      //   ownerTaskId: convertFilterValue(findFilter(filters, 'ownerTaskId')),
      //   sessionId: convertFilterValue(findFilter(filters, 'sessionId')),
      //   resultId: convertFilterValue(findFilter(filters, 'resultId')),
      //   // TODO: Find a way to get the created after and the created before (for now, they are optional)
      // }
    });

    return this.#resultsClient.listResults(listResultRequest);
  }

  get$(resultId: string): Observable<GetResultResponse> {
    const getResultRequest = new GetResultRequest({
      resultId
    });

    return this.#resultsClient.getResult(getResultRequest);
  }
}
