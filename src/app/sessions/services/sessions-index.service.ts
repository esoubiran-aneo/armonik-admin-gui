import { SessionField, SessionRawEnumField, SessionStatus } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { DefaultConfigService } from '@services/default-config.service';
import { TableService } from '@services/table.service';
import { SessionsStatusesService } from './sessions-statuses.service';
import { SessionRaw, SessionRawColumnKey, SessionRawField, SessionRawFilter, SessionRawListOptions, SessionsFiltersDefinition } from '../types';
import { Session } from '@aneoconsultingfr/armonik.api.angular/lib/generated/objects.pb';

@Injectable()
export class SessionsIndexService {
  #sessionsStatusesService = inject(SessionsStatusesService);
  #defaultConfigService = inject(DefaultConfigService);
  #tableService = inject(TableService);

  readonly defaultColumns: SessionRawColumnKey[] = this.#defaultConfigService.defaultSessions.columns;
  readonly availableColumns: SessionRawColumnKey[] = ['sessionId', 'status', 'cancelledAt', 'createdAt', 'options', 'actions', 'duration', 'partitionIds', 'count', 'options.options', 'options.applicationName', 'options.applicationNamespace', 'options.applicationService', 'options.applicationVersion', 'options.engineType', 'options.maxDuration', 'options.maxRetries', 'options.partitionId', 'options.priority'];

  readonly dateColumns: SessionRawColumnKey[] = ['cancelledAt', 'createdAt'];
  readonly durationColumns: SessionRawColumnKey[] = ['duration', 'options.maxDuration'];
  readonly objectColumns: SessionRawColumnKey[] = ['options', 'options.options', 'partitionIds'];

  readonly columnsLabels: Record<SessionRawColumnKey, string> = {
    sessionId: $localize`Session ID`,
    status: $localize`Status`,
    cancelledAt: $localize`Cancelled at`,
    createdAt: $localize`Created at`,
    options: $localize`Options`,
    actions: $localize`Actions`,
    duration: $localize`Duration`,
    partitionIds: $localize`Partition IDs`,
    count: $localize`Tasks by Status`,
    'options.options': $localize`Options Options`,
    'options.applicationName': $localize`Options Application Name`,
    'options.applicationNamespace': $localize`Options Application Namespace`,
    'options.applicationService': $localize`Options Application Service`,
    'options.applicationVersion': $localize`Options Application Version`,
    'options.engineType': $localize`Options Engine Type`,
    'options.maxDuration': $localize`Options Max Duration`,
    'options.maxRetries': $localize`Options Max Retries`,
    'options.partitionId': $localize`Options Partition ID`,
    'options.priority': $localize`Options Priority`,
  };

  readonly defaultOptions: SessionRawListOptions = this.#defaultConfigService.defaultSessions.options;

  readonly defaultFilters: SessionRawFilter = this.#defaultConfigService.defaultSessions.filters;
  readonly filtersDefinitions: SessionsFiltersDefinition[] = [
    // Do not filter object fields
    {
      key: 'sessionId',
      field: SessionRawEnumField.SESSION_RAW_ENUM_FIELD_SESSION_ID,
      type: 'string',
    },
    {
      key: 'partitionIds',
      field: SessionRawEnumField.SESSION_RAW_ENUM_FIELD_PARTITION_IDS,
      type: 'array'
    },
    {
      key: 'status',
      field: SessionRawEnumField.SESSION_RAW_ENUM_FIELD_STATUS,
      type: 'status',
      statuses: Object.keys(this.#sessionsStatusesService.statuses).map(status => {
        return {
          key: status,
          value: this.#sessionsStatusesService.statuses[Number(status) as SessionStatus],
        };
      }),
      // TODO: ajouter les options
    }
    // TODO: ajouter les times
    // TODO: ajouter les durations dans les api (avec le support des filtres dans les groupes by)
    // TODO: simplifier les filtres en retirant une couche.
    // {
    //   field: 'partitionIds',
    //   type: 'text',
    // },
    // {
    //   field: 'createdAt',
    //   type: 'date',
    // },
    // {
    //   field: 'cancelledAt',
    //   type: 'date',
    // },
    // {
    //   field: 'status',
    //   type: 'select',
    //   options: Object.keys(this.#sessionsStatusesService.statuses).map(status => {
    //     return {
    //       value: status,
    //       label: this.#sessionsStatusesService.statuses[Number(status) as SessionStatus],
    //     };
    //   }),
    // },
    // FIXME: Not implemented yet in Core
    // {
    //   field: 'duration',
    //   type: 'number'
    // }
  ];

  readonly defaultIntervalValue: number = this.#defaultConfigService.defaultSessions.interval;

  columnToLabel(column: SessionRawColumnKey): string {
    return this.columnsLabels[column];
  }

  /**
   * Table
   */
  isActionsColumn(column: SessionRawColumnKey): boolean {
    return column === 'actions';
  }

  isSessionIdColumn(column: SessionRawColumnKey): boolean {
    return column === 'sessionId';
  }

  isStatusColumn(column: SessionRawColumnKey): boolean {
    return column === 'status';
  }

  isCountColumn(column: SessionRawColumnKey): boolean {
    return column === 'count';
  }

  isDateColumn(column: SessionRawColumnKey): boolean {
    return this.dateColumns.includes(column);
  }

  isDurationColumn(column: SessionRawColumnKey): boolean {
    return this.durationColumns.includes(column);
  }

  isObjectColumn(column: SessionRawColumnKey): boolean {
    return this.objectColumns.includes(column);
  }

  isSimpleColumn(column: SessionRawColumnKey): boolean {
    return !this.isActionsColumn(column) && !this.isSessionIdColumn(column) && !this.isStatusColumn(column) && !this.isCountColumn(column) && !this.isDateColumn(column) && !this.isDurationColumn(column) && !this.isObjectColumn(column);
  }

  isNotSortableColumn(column: SessionRawColumnKey): boolean {
    // FIXME: Not implemented yet in Core (for duration, once implemented, it will be sortable)
    return this.isActionsColumn(column) || this.isCountColumn(column) || this.isObjectColumn(column) || this.isDurationColumn(column);
  }

  /**
   * Interval
   */

  saveIntervalValue(value: number): void {
    this.#tableService.saveIntervalValue('sessions-interval', value);
  }

  restoreIntervalValue(): number {
    return this.#tableService.restoreIntervalValue('sessions-interval') ?? this.defaultIntervalValue;
  }

  /**
   * Options
   */

  saveOptions(options: SessionRawListOptions): void {
    this.#tableService.saveOptions('sessions-options', options);
  }

  restoreOptions(): SessionRawListOptions {
    const options = this.#tableService.restoreOptions<SessionRaw>('sessions-options', this.defaultOptions);

    return options;
  }

  /**
   * Columns
   */

  saveColumns(columns: SessionRawColumnKey[]): void {
    this.#tableService.saveColumns('sessions-columns', columns);
  }

  restoreColumns(): SessionRawColumnKey[] {
    const columns = this.#tableService.restoreColumns<SessionRawColumnKey[]>('sessions-columns') ?? this.defaultColumns;

    return [...columns];
  }

  resetColumns(): SessionRawColumnKey[] {
    this.#tableService.resetColumns('sessions-columns');

    return Array.from(this.defaultColumns);
  }

  /**
   * Filters
   */

  saveFilters(filters: SessionRawFilter): void {
    this.#tableService.saveFilters('sessions-filters', filters);
  }

  restoreFilters(): SessionRawFilter {
    return this.#tableService.restoreFilters<SessionRaw, SessionRawField>('sessions-filters', this.filtersDefinitions) ?? this.defaultFilters;
  }

  resetFilters(): SessionRawFilter {
    this.#tableService.resetFilters('sessions-filters');

    return this.defaultFilters;
  }
}
