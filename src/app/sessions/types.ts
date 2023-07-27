import {SessionRaw as GrpcSessionRaw, SessionRawEnumField, SessionTaskOptionEnumField, SessionTaskOptionGenericField } from '@aneoconsultingfr/armonik.api.angular';
import { TaskOptions } from '@app/tasks/types';
import { ColumnKey, FieldKey } from '@app/types/data';
import { FiltersDefinition, FiltersOr } from '@app/types/filters';
import { ListOptions } from '@app/types/options';

export type SessionRaw = GrpcSessionRaw.AsObject;
// Instead of using this column key, I will need to create a new one using the TaskOptions type called SessionRawFilterKey
export type SessionRawColumnKey = ColumnKey<SessionRaw, TaskOptions> | 'count';

export type SessionRawFieldKey = FieldKey<SessionRaw>;
export type SessionRawField = SessionRawEnumField | SessionTaskOptionEnumField | SessionTaskOptionGenericField;
export type SessionsFiltersDefinition = FiltersDefinition<SessionRawColumnKey, SessionRawField>;
export type SessionRawFilter = FiltersOr<SessionRaw>;
export type SessionRawListOptions = ListOptions<SessionRaw>;
