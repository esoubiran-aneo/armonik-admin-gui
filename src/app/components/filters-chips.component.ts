import { NgFor, NgIf } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { ColumnKey, FieldKey } from '@app/types/data';
import { Filter, FiltersAnd, FiltersDefinition } from '@app/types/filters';
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
export class FiltersChipsComponent<T extends object, R extends string, U> {
  #filtersService = inject(FiltersService);
  #utilsService = inject(UtilsService<T, R, U>);

  @Input({ required: true }) filtersAnd: FiltersAnd<T> = [];
  @Input({ required: true }) filtersFields: FiltersDefinition<R, U>[] = [];
  @Input({ required: true }) columnsLabels: Record<R, string> | null = null;

  content(filter: Filter<T>): string {
    // TODO: fix filter type
    const label = this.columnToLabel(filter.key as any);

    if (!filter.value)
      return label + ' ' + $localize`has no value`;

    const type = this.#utilsService.recoverType(filter, this.filtersFields);
    const operator = this.#filtersService.findOperators(type)[filter.operator as number];

    if (type === 'status') {
      const statuses = this.#utilsService.recoverStatuses(filter, this.filtersFields);
      const status = statuses.find(s => s.key.toString() === filter.value?.toString());
      return `${label} ${operator} ${status?.value}`;
    }

    return `${label} ${operator} ${filter.value}`;
  }

  columnToLabel(column: R | null): string {
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
