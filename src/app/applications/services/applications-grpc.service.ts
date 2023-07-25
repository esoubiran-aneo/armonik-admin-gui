import { ApplicationRawEnumField, ApplicationRawField, ApplicationsClient, SortDirection as ArmoniKSortDirection, CountTasksByStatusApplicationRequest, CountTasksByStatusApplicationResponse, ListApplicationsRequest, ListApplicationsResponse } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { AppGrpcService } from '@app/types/services';
import { UtilsService } from '@services/utils.service';
import { ApplicationRaw, ApplicationRawFieldKey, ApplicationRawFilter, ApplicationRawListOptions } from '../types';

@Injectable()
export class ApplicationsGrpcService implements AppGrpcService<ApplicationRaw> {
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

  constructor(
    private _applicationsClient: ApplicationsClient,
    private _utilsService: UtilsService<ApplicationRaw>
  ) {}

  list$(options: ApplicationRawListOptions, filters: ApplicationRawFilter): Observable<ListApplicationsResponse> {
    const findFilter = this._utilsService.findFilter;
    const convertFilterValue = this._utilsService.convertFilterValue;

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
    });

    return this._applicationsClient.listApplications(request);
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

    return this._applicationsClient.countTasksByStatus(request);
  }
}
