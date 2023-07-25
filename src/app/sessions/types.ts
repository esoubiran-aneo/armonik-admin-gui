import {SessionRaw as GrpcSessionRaw, StatusCount as GrpcStatusCount } from '@aneoconsultingfr/armonik.api.angular';
import { TaskOptions } from '@app/tasks/types';
import { ColumnKey, FieldKey } from '@app/types/data';
import { FiltersDefinition, FiltersOr } from '@app/types/filters';
import { ListOptions } from '@app/types/options';

export type SessionRaw = GrpcSessionRaw.AsObject;
export type SessionRawColumnKey = ColumnKey<SessionRaw, TaskOptions> | 'count';

export type SessionRawFieldKey = FieldKey<SessionRaw>;
export type SessionsFiltersDefinition = FiltersDefinition<SessionRaw>;
export type SessionRawFilter = FiltersOr<SessionRaw>;
export type SessionRawListOptions = ListOptions<SessionRaw>;

export type StatusCount = GrpcStatusCount.AsObject;
