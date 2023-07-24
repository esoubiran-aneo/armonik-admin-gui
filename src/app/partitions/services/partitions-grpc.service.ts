import { SortDirection as ArmoniKSortDirection, GetPartitionRequest, GetPartitionResponse, ListPartitionsRequest, ListPartitionsResponse, PartitionRawEnumField, PartitionRawField, PartitionsClient } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { AppGrpcService } from '@app/types/services';
import { UtilsService } from '@services/utils.service';
import { PartitionRaw, PartitionRawFieldKey, PartitionRawFilter, PartitionRawListOptions } from '../types';

@Injectable()
export class PartitionsGrpcService implements AppGrpcService<PartitionRaw> {
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

  constructor(
    private _partitionsClient: PartitionsClient,
    private _utilsService: UtilsService<PartitionRaw>
  ) {}

  list$(options: PartitionRawListOptions, filters: PartitionRawFilter[]): Observable<ListPartitionsResponse> {
    const findFilter = this._utilsService.findFilter;
    const convertFilterValue = this._utilsService.convertFilterValue;
    const convertFilterValueToNumber = this._utilsService.convertFilterValueToNumber;

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
      // filter: {
      //   id: convertFilterValue(findFilter(filters, 'id')),
      //   parentPartitionId: convertFilterValue(findFilter(filters, 'parentPartitionIds')),
      //   podReserved:
      //     convertFilterValueToNumber(findFilter(filters, 'podReserved')) as number,
      //   podMax: convertFilterValueToNumber(findFilter(filters, 'podMax')) as number,
      //   preemptionPercentage: convertFilterValueToNumber(findFilter(filters, 'preemptionPercentage')) as number,
      //   priority: convertFilterValueToNumber(findFilter(filters, 'priority')) as number
      // }
    });

    return this._partitionsClient.listPartitions(listPartitionsRequest);
  }

  get$(id: string) :Observable<GetPartitionResponse> {
    const getPartitionRequest = new GetPartitionRequest({
      id
    });

    return this._partitionsClient.getPartition(getPartitionRequest);
  }
}
