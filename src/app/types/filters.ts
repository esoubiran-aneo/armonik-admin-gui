import { DateTime } from 'luxon';
import { FieldKey } from './data';

export type MaybeNull<T> = T | null;

export type FilterType = 'string' | 'number' | 'date' | 'array' | 'status';
export type FilterValueOptions = { key: string | number, value: string }[];

export type FiltersOr<T extends object> = FiltersAnd<T>[];
export type FiltersAnd<T extends object> = Filter<T>[];

// Filters used to filter the data.
export type Filter<T extends object> = {
  key: MaybeNull<FieldKey<T>>
  value: MaybeNull<FilterInputValue>
  operator: MaybeNull<number>
};


// Used to define filters available for the query builder.
type FilterDefinitionBase<T extends object> = {
  key: FieldKey<T>
  type: FilterType
};

export interface FiltersDefinitionString<T extends object> extends FilterDefinitionBase<T> {
  type: 'string'
};
export interface FiltersDefinitionNumber<T extends object> extends FilterDefinitionBase<T> {
  type: 'number'
};
export interface FiltersDefinitionDate<T extends object> extends FilterDefinitionBase<T> {
  type: 'date'
};
export interface FiltersDefinitionStatus<T extends object> extends FilterDefinitionBase<T> {
  type: 'status'
  statuses: FilterValueOptions;
};
// Filters used to create the query builder.
export type FiltersDefinition<T extends object> = FiltersDefinitionString<T> | FiltersDefinitionNumber<T> | FiltersDefinitionDate<T> | FiltersDefinitionStatus<T>;

// Value of a filter input.
export type FilterInputValueString = MaybeNull<string>;
export type FilterInputValueNumber = MaybeNull<number>;
export type FilterInputValueDate = { start: MaybeNull<string>, end: MaybeNull<string> };

// Input for a filter input.
interface FilterInputBase {
  type: FilterType;
}
export interface FilterInputString extends FilterInputBase {
  type: 'string';
  value: FilterInputValueString;
}
export interface FilterInputNumber extends FilterInputBase  {
  type: 'number';
  value: FilterInputValueNumber;
}
export interface FilterInputDate extends FilterInputBase {
  type: 'date';
  value: FilterInputValueDate;
}
export interface FilterInputSelect extends FilterInputBase  {
  type: 'status';
  value: MaybeNull<number>;
  options: FilterValueOptions;
}
export type FilterInput = FilterInputString | FilterInputNumber | FilterInputDate | FilterInputSelect;

export type FilterInputValue = FilterInput['value'];
export type FilterInputType = FilterInput['type'];

// Output of a filter input.
interface FilterInputOutputBase {
  type: FilterType | 'date-start' | 'date-end';
}
export interface FilterInputOutputString extends FilterInputOutputBase {
  type: 'string';
  value: MaybeNull<string>;
};
export interface FilterInputOutputNumber extends FilterInputOutputBase {
  type: 'number';
  value: MaybeNull<number>;
};
export interface FilterInputOutputDate extends FilterInputOutputBase {
  type: 'date-start' | 'date-end';
  value: MaybeNull<DateTime>;
};
export type FilterInputOutput = FilterInputOutputString | FilterInputOutputNumber | FilterInputOutputDate;
