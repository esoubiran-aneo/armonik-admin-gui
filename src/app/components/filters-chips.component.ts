import { NgFor, NgIf } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { ColumnKey, FieldKey } from '@app/types/data';
import { Filter, FilterInputSelect, FiltersAnd, FiltersDefinition, FiltersOr } from '@app/types/filters';
import { FiltersService } from '@services/filters.service';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'app-filters-chips',
  template: `
<mat-chip-listbox>
   <ng-container *ngFor="let filter of filtersAnd; let last = last; trackBy:trackByFilter">
    <mat-chip class="mat-mdc-standard-chip mat-primary mat-mdc-chip-selected">
      <span *ngIf="filter.key;else noField"> {{ content(filter) }} </span>
    </mat-chip>
    <span class="text" *ngIf="!last">AND</span>
  </ng-container>
</mat-chip-listbox>

<ng-template #noField>
  <span i18n>No field</span>
</ng-template>
  `,
  styles: [`
.text {
  font-size: 1rem;
  font-weight: 400;

  margin-top: auto;
  margin-bottom: auto;

  margin-left: 8px;
}
  `],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatChipsModule,
  ],
  providers: [
    FiltersService,
  ],
})
export class FiltersChipsComponent<T extends object, U> {
  #filtersService = inject(FiltersService);
  #utilsService = inject(UtilsService<T, U>);

  @Input({ required: true }) filtersAnd: FiltersAnd<T> = [];
  @Input({ required: true }) filtersFields: FiltersDefinition<T, U>[] = [];
  @Input({ required: true }) columnsLabels: Record<ColumnKey<T>, string> | null = null;

  content(filter: Filter<T>): string {
    const label = this.columnToLabel(filter.key);

    if (!filter.value)
      return label + ' ' + $localize`has no value`;

    const type = this.#utilsService.recoverType(filter, this.filtersFields);
    const operator = this.#filtersService.findOperators(type)[filter.operator as number];

    return `${label} ${operator} ${filter.value}`;
  }

  columnToLabel(column: FieldKey<T> | null): string {
    if (column === null)
      return '';

    if (this.columnsLabels === null)
      return column.toString();
    else
      return this.columnsLabels[column];
  }

  trackByFilter(_: number, filter: Filter<T>): string {
    return (filter.key as string) ?? '';
  }
}
