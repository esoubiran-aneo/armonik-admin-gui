import {SessionRaw as GrpcSessionRaw, StatusCount as GrpcStatusCount, SessionRawEnumField, SessionTaskOptionEnumField, SessionTaskOptionGenericField } from '@aneoconsultingfr/armonik.api.angular';
import { TaskOptions } from '@app/tasks/types';
import { ColumnKey, FieldKey } from '@app/types/data';
import { FiltersDefinition, FiltersOr } from '@app/types/filters';
import { ListOptions } from '@app/types/options';

export type SessionRaw = GrpcSessionRaw.AsObject;
export type SessionRawColumnKey = ColumnKey<SessionRaw, TaskOptions> | 'count';

export type SessionRawFieldKey = FieldKey<SessionRaw>;
export type SessionRawField = SessionRawEnumField | SessionTaskOptionEnumField | SessionTaskOptionGenericField
export type SessionsFiltersDefinition = FiltersDefinition<SessionRaw, SessionRawField>;
export type SessionRawFilter = FiltersOr<SessionRaw>;
export type SessionRawListOptions = ListOptions<SessionRaw>;

export type StatusCount = GrpcStatusCount.AsObject;
