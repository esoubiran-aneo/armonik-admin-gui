import { SortDirection as ArmoniKSortDirection, GetPartitionRequest, GetPartitionResponse, ListPartitionsRequest, ListPartitionsResponse, PartitionRawEnumField, PartitionsClient, PartitionFiltersAnd, PartitionFiltersOr, PartitionFilterField, PartitionFilters } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { AppGrpcService } from '@app/types/services';
import { PartitionRaw, PartitionRawFieldKey, PartitionRawFilter, PartitionRawListOptions } from '../types';
import { PartitionsIndexService } from './partitions-index.service';
import { Filter, FilterType, FiltersAnd, FiltersDefinition, FiltersOr } from '@app/types/filters';
import { UtilsService } from '@services/utils.service';


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
      switch (type) {
        case 'string':
          return {
            string: {
              field: {
                partitionRawField: {
                  field
                },
              },
              value: filter.value?.toString() ?? '',
              operator: filter.operator ?? 0
          }
        } satisfies PartitionFilterField.AsObject;
        default: {
          throw new Error(`Type ${type} not supported`);
        }
      }
    }
  }
}
