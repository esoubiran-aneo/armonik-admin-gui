import { StatusCount as GrpcStatusCount, TaskOptions as GrpcTaskOptions, TaskRaw as GrpcTaskRaw, TaskSummary as GrpcTaskSummary, TaskOptionEnumField, TaskOptionGenericField, TaskSummaryEnumField } from '@aneoconsultingfr/armonik.api.angular';
import { ColumnKey, FieldKey, PrefixedOptions } from '@app/types/data';
import { FiltersDefinition, FiltersOr } from '@app/types/filters';
import { ListOptions } from '@app/types/options';

export type TaskRaw = GrpcTaskRaw.AsObject;
export type TaskSummary = GrpcTaskSummary.AsObject;
export type TaskSummaryColumnKey = ColumnKey<TaskSummary, TaskOptions> | 'select';

export type TaskSummaryFieldKey = FieldKey<TaskSummary>;
export type TaskSummaryField = TaskSummaryEnumField | TaskOptionEnumField | TaskOptionGenericField;
export type TasksFiltersDefinition = FiltersDefinition<TaskSummary, TaskSummaryField>;
export type TaskSummaryFilters = FiltersOr<TaskSummary>;
export type TaskSummaryListOptions = ListOptions<TaskSummary>;

export type TaskOptions = GrpcTaskOptions.AsObject;
export type StatusCount = GrpcStatusCount.AsObject;
export type PrefixedTaskOptions = PrefixedOptions<TaskOptions>;
