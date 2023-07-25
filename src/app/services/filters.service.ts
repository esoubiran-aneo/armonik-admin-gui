import { FilterArrayOperator, FilterDateOperator, FilterNumberOperator, FilterStatusOperator, FilterStringOperator } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable } from '@angular/core';
import { FilterType } from '@app/types/filters';

@Injectable()
export class FiltersService {
  readonly filterStringOperators: Record<Exclude<FilterStringOperator, FilterStringOperator.FILTER_STRING_OPERATOR_UNSPECIFIED>, string> = {
    [FilterStringOperator.FILTER_STRING_OPERATOR_EQUAL]: $localize`Equal`,
    [FilterStringOperator.FILTER_STRING_OPERATOR_NOT_EQUAL]: $localize`Not Equal`,
    [FilterStringOperator.FILTER_STRING_OPERATOR_CONTAINS]: $localize`Contains`,
    [FilterStringOperator.FILTER_STRING_OPERATOR_NOT_CONTAINS]: $localize`Not Contains`,
    [FilterStringOperator.FILTER_STRING_OPERATOR_STARTS_WITH]: $localize`Starts With`,
    [FilterStringOperator.FILTER_STRING_OPERATOR_ENDS_WITH]: $localize`Ends With`,
  };

  readonly filterNumberOperators: Record<Exclude<FilterNumberOperator, FilterNumberOperator.FILTER_NUMBER_OPERATOR_UNSPECIFIED>, string> = {
    [FilterNumberOperator.FILTER_NUMBER_OPERATOR_LESS_THAN]: $localize`Less Than`,
    [FilterNumberOperator.FILTER_NUMBER_OPERATOR_LESS_THAN_OR_EQUAL]: $localize`Less Than or Equal`,
    [FilterNumberOperator.FILTER_NUMBER_OPERATOR_EQUAL]: $localize`Equal`,
    [FilterNumberOperator.FILTER_NUMBER_OPERATOR_NOT_EQUAL]: $localize`Not Equal`,
    [FilterNumberOperator.FILTER_NUMBER_OPERATOR_GREATER_THAN]: $localize`Greater Than`,
    [FilterNumberOperator.FILTER_NUMBER_OPERATOR_GREATER_THAN_OR_EQUAL]: $localize`Greater Than or Equal`,
  };

  readonly filterDateOperators: Record<Exclude<FilterDateOperator, FilterDateOperator.FILTER_DATE_OPERATOR_UNSPECIFIED>, string> = {
    [FilterDateOperator.FILTER_DATE_OPERATOR_BEFORE]: $localize`Before`,
    [FilterDateOperator.FILTER_DATE_OPERATOR_BEFORE_OR_EQUAL]: $localize`Before or Equal`,
    [FilterDateOperator.FILTER_DATE_OPERATOR_EQUAL]: $localize`Equal`,
    // TODO: missing not equal (see notion for more info about missing operators) (or we have to translate the ui into a and)
    [FilterDateOperator.FILTER_DATE_OPERATOR_AFTER]: $localize`After`,
    [FilterDateOperator.FILTER_DATE_OPERATOR_AFTER_OR_EQUAL]: $localize`After or Equal`,
  };

  // TODO: maybe we want a time filter

  readonly filterArrayOperators: Record<Exclude<FilterArrayOperator, FilterArrayOperator.FILTER_ARRAY_OPERATOR_UNSPECIFIED>, string> = {
    [FilterArrayOperator.FILTER_ARRAY_OPERATOR_CONTAINS]: $localize`Contains`,
    [FilterArrayOperator.FILTER_ARRAY_OPERATOR_NOT_CONTAINS]: $localize`Not Contains`,
  };

  readonly filterStatusOperators: Record<Exclude<FilterStatusOperator, FilterStatusOperator.FILTER_STATUS_OPERATOR_UNSPECIFIED>, string> = {
    [FilterStatusOperator.FILTER_STATUS_OPERATOR_EQUAL]: $localize`Equal`,
    [FilterStatusOperator.FILTER_STATUS_OPERATOR_NOT_EQUAL]: $localize`Not Equal`,
  };

  readonly filterOperators: Record<FilterType, Record<number, string>> = {
    'string': this.filterStringOperators,
    'number': this.filterNumberOperators,
    'date': this.filterDateOperators,
    'array': this.filterArrayOperators,
    'status': this.filterStringOperators,
  };

  findOperators(type: FilterType) {
    return this.filterOperators[type];
  }
}
