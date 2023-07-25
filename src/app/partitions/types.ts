import { PartitionRaw as GrpcPartitionRaw } from '@aneoconsultingfr/armonik.api.angular';
import { ColumnKey, FieldKey } from '@app/types/data';
import { FiltersDefinition, FiltersOr } from '@app/types/filters';
import { ListOptions } from '@app/types/options';

export type PartitionRaw = GrpcPartitionRaw.AsObject;
export type PartitionRawColumnKey = ColumnKey<PartitionRaw, never>;
export type PartitionRawFieldKey = FieldKey<PartitionRaw>;
export type PartitionRawFilterField = FiltersDefinition<PartitionRaw>;
export type PartitionRawFilter = FiltersOr<PartitionRaw>;
export type PartitionRawListOptions = ListOptions<PartitionRaw>;
