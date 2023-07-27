import { SortDirection as ArmoniKSortDirection, FilterArrayOperator, FilterNumberOperator, FilterStringOperator, GetPartitionRequest, GetPartitionResponse, ListPartitionsRequest, ListPartitionsResponse, PartitionFilterField, PartitionRawEnumField, PartitionsClient } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { Filter, FilterType } from '@app/types/filters';
import { AppGrpcService } from '@app/types/services';
import { UtilsService } from '@services/utils.service';
import { PartitionsIndexService } from './partitions-index.service';
import { PartitionRaw, PartitionRawFieldKey, PartitionRawFilter, PartitionRawListOptions } from '../types';


@Injectable()
export class PartitionsGrpcService implements AppGrpcService<PartitionRaw> {
  #partitionsIndexService = inject(PartitionsIndexService);
  #partitionsClient = inject(PartitionsClient);
  #utilsService = inject(UtilsService<PartitionRaw, PartitionRawEnumField>);

  readonly sortDirections: Record<SortDirection, ArmoniKSortDirection> = {
    'asc': ArmoniKSortDirection.SORT_DIRECTION_ASC,
    'desc': ArmoniKSortDirection.SORT_DIRECTION_DESC,
    '': ArmoniKSortDirection.SORT_DIRECTION_UNSPECIFIED
  };

  readonly sortFields: Record<PartitionRawFieldKey, PartitionRawEnumField> = {
    'id': PartitionRawEnumField.PARTITION_RAW_ENUM_FIELD_ID,
    'parentPartitionIds': PartitionRawEnumField.PARTITION_RAW_ENUM_FIELD_PARENT_PARTITION_IDS,
    'podConfiguration': PartitionRawEnumField.PARTITION_RAW_ENUM_FIELD_UNSPECIFIED,
    'podMax': PartitionRawEnumField.PARTITION_RAW_ENUM_FIELD_POD_MAX,
    'podReserved': PartitionRawEnumField.PARTITION_RAW_ENUM_FIELD_POD_RESERVED,
    'preemptionPercentage': PartitionRawEnumField.PARTITION_RAW_ENUM_FIELD_PREEMPTION_PERCENTAGE,
    'priority': PartitionRawEnumField.PARTITION_RAW_ENUM_FIELD_PRIORITY,
  };

  list$(options: PartitionRawListOptions, filters: PartitionRawFilter): Observable<ListPartitionsResponse> {
    const requestFilters = this.#utilsService.createFilters<PartitionFilterField.AsObject>(filters, this.#partitionsIndexService.filtersDefinitions, this.#buildFilterField);

    const listPartitionsRequest = new ListPartitionsRequest({
      page: options.pageIndex,
      pageSize: options.pageSize,
      sort: {
        direction: this.sortDirections[options.sort.direction],
        field: {
          partitionRawField: {
            field: this.sortFields[options.sort.active] ?? PartitionRawEnumField.PARTITION_RAW_ENUM_FIELD_ID
          }
        }
      },
      filters: requestFilters
    });

    return this.#partitionsClient.listPartitions(listPartitionsRequest);
  }

  get$(id: string) :Observable<GetPartitionResponse> {
    const getPartitionRequest = new GetPartitionRequest({
      id
    });

    return this.#partitionsClient.getPartition(getPartitionRequest);
  }

  #buildFilterField(filter: Filter<PartitionRaw>) {
    return (type: FilterType, field: PartitionRawEnumField) => {

      const filterField = {
        partitionRawField: {
          field
        }
      } satisfies PartitionFilterField.AsObject['field'];

      switch (type) {
      case 'string':
        return {
          field: filterField,
          filterString: {
            value: filter.value?.toString() || '',
            operator: filter.operator ?? FilterStringOperator.FILTER_STRING_OPERATOR_EQUAL
          }
        } satisfies PartitionFilterField.AsObject;
      case 'number':
        return {
          field: filterField,
          filterNumber: {
            value: filter.value?.toString() || '',
            operator: filter.operator ?? FilterNumberOperator.FILTER_NUMBER_OPERATOR_EQUAL
          }
        } satisfies PartitionFilterField.AsObject;
      case 'array':
        return {
          field: filterField,
          filterArray: {
            value: filter.value?.toString() || '',
            operator: filter.operator ?? FilterArrayOperator.FILTER_ARRAY_OPERATOR_CONTAINS
          }
        } satisfies PartitionFilterField.AsObject;
      default: {
        throw new Error(`Type ${type} not supported`);
      }
      }
    };
  }
}
