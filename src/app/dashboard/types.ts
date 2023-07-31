import {TaskStatus } from '@aneoconsultingfr/armonik.api.angular';

export type Line = {
  name: string,
  interval: number,
  hideGroupsHeader: boolean,
  // TODO: waiting for full filters before adding correct type.
  filters: [],
  taskStatusesGroups: TasksStatusesGroup[],
};

export type TasksStatusesGroup = {
  name: string;
  color?: string;
  statuses: TaskStatus[];
};

export type ManageGroupsDialogData = {
  groups: TasksStatusesGroup[];
};

export type ManageGroupsDialogResult = {
  groups: TasksStatusesGroup[];
};

export type StatusLabeled = { name: string, value: string };

export type AddStatusGroupDialogData = {
  statuses: StatusLabeled[];
};

export type EditStatusGroupDialogData = {
  group: TasksStatusesGroup;
  statuses: StatusLabeled[];
};


export type ManageLinesDialogData = {
  lines: Line[]
};

export type ManageLinesDialogResult = {
  lines: Line[]
};