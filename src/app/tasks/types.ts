import { StatusCount as GrpcStatusCount, TaskOptions as GrpcTaskOptions, TaskSummary as GrpcTaskSummary } from '@aneoconsultingfr/armonik.api.angular';
import { ColumnKey, PrefixedOptions } from '@app/types/data';
import { FieldKey } from '@app/types/data';
import { Filter, FilterField } from '@app/types/filters';
import { ListOptions } from '@app/types/options';


export type TaskSummary = GrpcTaskSummary.AsObject; 
export type StatusCount = GrpcStatusCount.AsObject;
export type TaskOptions = GrpcTaskOptions.AsObject;
export type PrefixedTaskOptions = PrefixedOptions<TaskOptions>; 

export type TaskSummaryColumnKey = ColumnKey<TaskSummary, TaskOptions> | 'count';

export type TaskSummaryFieldKey = FieldKey<TaskSummary>;
export type TaskSummaryFilterField = FilterField<TaskSummary>;
export type TaskSummaryFilter = Filter<TaskSummary>;
export type TaskSummaryListOptions = ListOptions<TaskSummary>;


