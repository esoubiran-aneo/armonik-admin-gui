import {ResultRaw as GrpcResultRaw, ResultRawEnumField} from '@aneoconsultingfr/armonik.api.angular';
import { ColumnKey, FieldKey } from '@app/types/data';
import { FiltersDefinition, FiltersOr } from '@app/types/filters';
import { ListOptions } from '@app/types/options';

export type ResultRaw = GrpcResultRaw.AsObject;
export type ResultRawColumnKey = ColumnKey<ResultRaw, never>;

// We need to find a way to use filter field for _after and for _before
export type ResultRawFieldKey = FieldKey<ResultRaw>;
export type ResultsFiltersDefinition = FiltersDefinition<ResultRaw, ResultRawEnumField>;
export type ResultRawFilter = FiltersOr<ResultRaw>;
export type ResultRawListOptions = ListOptions<ResultRaw>;
