import { FilterStringRange, FilterNumberRange, FilterDateRange, FilterArrayRange } from "@aneoconsultingfr/armonik.api.angular";
import { Injectable } from "@angular/core";

@Injectable()
export class FiltersService {
  readonly filterStringRange: Record<FilterStringRange, string> = {
    [FilterStringRange.FILTER_STRING_RANGE_UNSPECIFIED]: $localize`unspecified`,
    [FilterStringRange.FILTER_STRING_RANGE_EQUAL]: $localize`equal`,
    [FilterStringRange.FILTER_STRING_RANGE_NOT_EQUAL]: $localize`not equal`,
    [FilterStringRange.FILTER_STRING_RANGE_CONTAINS]: $localize`contains`,
    [FilterStringRange.FILTER_STRING_RANGE_NOT_CONTAINS]: $localize`not contains`,
    [FilterStringRange.FILTER_STRING_RANGE_STARTS_WITH]: $localize`starts with`,
    [FilterStringRange.FILTER_STRING_RANGE_ENDS_WITH]: $localize`ends with`,
  }

  readonly filterNumberRange: Record<FilterNumberRange, string> = {
    [FilterNumberRange.FILTER_NUMBER_RANGE_UNSPECIFIED]: $localize`unspecified`,
    [FilterNumberRange.FILTER_NUMBER_RANGE_LESS_THAN]: $localize`less than`,
    [FilterNumberRange.FILTER_NUMBER_RANGE_LESS_THAN_OR_EQUAL]: $localize`less than or equal`,
    [FilterNumberRange.FILTER_NUMBER_RANGE_EQUAL]: $localize`equal`,
    [FilterNumberRange.FILTER_NUMBER_RANGE_NOT_EQUAL]: $localize`not equal`,
    [FilterNumberRange.FILTER_NUMBER_RANGE_GREATER_THAN]: $localize`greater than`,
    [FilterNumberRange.FILTER_NUMBER_RANGE_GREATER_THAN_OR_EQUAL]: $localize`greater than or equal`,
  }

  readonly filterDateRange: Record<FilterDateRange, string> = {
    [FilterDateRange.FILTER_DATE_RANGE_UNSPECIFIED]: $localize`unspecified`,
    [FilterDateRange.FILTER_DATE_RANGE_BEFORE]: $localize`before`,
    [FilterDateRange.FILTER_DATE_RANGE_BEFORE_OR_EQUAL]: $localize`before or equal`,
    [FilterDateRange.FILTER_DATE_RANGE_EQUAL]: $localize`equal`,
    [FilterDateRange.FILTER_DATE_RANGE_AFTER]: $localize`after`,
    [FilterDateRange.FILTER_DATE_RANGE_AFTER_OR_EQUAL]: $localize`after or equal`,
  }

  readonly filterArrayRange: Record<FilterArrayRange, string> = {
    [FilterArrayRange.FILTER_ARRAY_RANGE_UNSPECIFIED]: $localize`unspecified`,
    [FilterArrayRange.FILTER_ARRAY_RANGE_CONTAINS]: $localize`contains`,
    [FilterArrayRange.FILTER_ARRAY_RANGE_NOT_CONTAINS]: $localize`not contains`,
  }
}
