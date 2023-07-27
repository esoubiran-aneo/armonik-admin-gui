import { SortDirection as ArmoniKSortDirection, FilterStringOperator, GetResultRequest, GetResultResponse, ListResultsRequest, ListResultsResponse, ResultFilterField, ResultRawEnumField, ResultRawField, ResultStatus, ResultsClient } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { Filter, FilterType } from '@app/types/filters';
import { AppGrpcService } from '@app/types/services';
import { UtilsService } from '@services/utils.service';
import { ResultsIndexService } from './results-index.service';
import {  ResultRaw, ResultRawColumnKey, ResultRawFieldKey, ResultRawFilter, ResultRawListOptions } from '../types';

@Injectable()
export class ResultsGrpcService implements AppGrpcService<ResultRaw> {
  #utilsService = inject(UtilsService<ResultRaw, ResultRawColumnKey, ResultRawEnumField>);
  #resultsClient = inject(ResultsClient);
  #resultsIndexService = inject(ResultsIndexService);

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


  list$(options: ResultRawListOptions, filters: ResultRawFilter): Observable<ListResultsResponse> {

    const requestFilters = this.#utilsService.createFilters<ResultFilterField.AsObject>(filters, this.#resultsIndexService.filtersDefinitions, this.#buildFilterField);

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
      filters: requestFilters
    });

    return this.#resultsClient.listResults(listResultRequest);
  }

  get$(resultId: string): Observable<GetResultResponse> {
    const getResultRequest = new GetResultRequest({
      resultId
    });

    return this.#resultsClient.getResult(getResultRequest);
  }

  #buildFilterField(filter: Filter<ResultRaw>) {
    return (type: FilterType, field: ResultRawEnumField) => {

      const filterField = {
        resultRawField: {
          field: field as ResultRawEnumField
        }
      } satisfies ResultFilterField.AsObject['field'];


      switch (type) {
      case 'string':
        return {
          field: filterField,
          filterString: {
            value: filter.value?.toString() ?? '',
            operator: filter.operator ?? FilterStringOperator.FILTER_STRING_OPERATOR_EQUAL
          }
        } satisfies ResultFilterField.AsObject;
      default: {
        throw new Error(`Type ${type} not supported`);
      }
      }
    };
  }
}
