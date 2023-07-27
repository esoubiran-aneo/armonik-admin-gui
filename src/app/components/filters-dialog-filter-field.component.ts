import { KeyValue, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FieldKey } from '@app/types/data';
import { Filter, FilterInput, FilterInputOutput, FilterInputType, FilterInputValueString, FilterValueOptions, FiltersDefinition } from '@app/types/filters';
import { FiltersService } from '@services/filters.service';
import { FiltersDialogInputComponent } from './filters-dialog-input.component';

@Component({
  selector: 'app-filters-dialog-filter-field',
  template: `
<span *ngIf="first" i18n="Filter condition">Where</span>
<span *ngIf="!first" i18n="Filter condition">And</span>
<mat-form-field appearance="outline"  subscriptSizing="dynamic">
  <mat-label i18n="Label input">Column</mat-label>
  <mat-select (valueChange)="onFieldChange($event)" [value]="filter.key">
    <mat-option *ngFor="let definition of filtersDefinitions; trackBy: trackByField" [value]="definition.key">
      {{ definitionToLabel(definition) }}
    </mat-option>
  </mat-select>
</mat-form-field>

<mat-form-field appearance="outline"  subscriptSizing="dynamic">
  <mat-label i18n="Label input">Operator</mat-label>
  <mat-select (valueChange)="onOperatorChange($event)" [value]="filter.operator?.toString()">
    <mat-option *ngFor="let operator of findOperator(filter) | keyvalue; trackBy: trackByOperator" [value]="operator.key">
      {{ operator.value }}
    </mat-option>
  </mat-select>
</mat-form-field>

<app-filters-dialog-input [input]="findInput(filter)" (valueChange)="onInputChange($event)"></app-filters-dialog-input>
  `,
  styles: [`
:host {
  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 1rem;
}

span {
  min-width: 3rem;
  text-align: end;
}
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    KeyValuePipe,
    MatFormFieldModule,
    MatSelectModule,
    FiltersDialogInputComponent,
  ],
  providers: [
    FiltersService,
  ],
})
// Every functions take a filter as parameter in order to simplify reusability.
export class FiltersDialogFilterFieldComponent<T extends object, R extends string, U = null> {
  @Input({ required: true }) first: boolean;
  @Input({ required: true }) filter: Filter<T>;
  @Input({ required: true }) filtersDefinitions: FiltersDefinition<R, U>[];
  @Input({ required: true }) columnsLabels: Record<R, string> | null;

  #filtersService = inject(FiltersService);

  onFieldChange(event: FieldKey<T>) {
    this.filter.key = event;
  }

  onOperatorChange(event: string) {
    this.filter.operator = Number(event);
  }

  onInputChange(event: FilterInputOutput) {
    switch (event.type) {
    case 'string':
      this.filter.value = event.value;
      break;
    case 'number':
      this.filter.value = Number(event.value);
      break;
    }
  }

  definitionToLabel(filter: FiltersDefinition<R, U>): string {
    const field = filter.key;

    if (!field) {
      return $localize`Select a column`;
    }

    const label =  this.columnsLabels?.[field] ?? field;

    return label.toString();
  }

  findInput(filter: Filter<T>): FilterInput {
    // TODO: use the utils service
    const type = this.findType(filter);
    const statuses = this.findStatuses(filter);

    switch (type) {
    case 'string':
      return {
        type: 'string',
        value: filter.value as FilterInputValueString || null
      };
    case 'number': {
      return {
        type: 'number',
        value: Number(filter.value) || null
      };
    }
    case 'array':
      return {
        type: 'string',
        value: filter.value as FilterInputValueString || null
      };
    case 'status':
      return {
        type: 'status',
        value: filter.value as string || null,
        statuses
      };
    default:
      throw new Error(`Unknown type ${type}`);
    }
  }

  findType(filter: Filter<T>): FilterInputType {

    if (!filter.key) {
      return 'string';
    }

    // TODO: fix filter type
    const field = this.#findFilterMetadata(filter.key as any);

    return field?.type ?? 'string';
  }

  findStatuses(filter: Filter<T>): FilterValueOptions {
    if (!filter.key) {
      return [];
    }

    // TODO: fix filter type
    const field = this.#findFilterMetadata(filter.key as any);

    if (!field) {
      return [];
    }

    if (field.type !== 'status') {
      return [];
    }

    return field.statuses;
  }

  findOperator(filter: Filter<T>) {
    const type = this.findType(filter);
    const operators = this.#filtersService.findOperators(type);
    return operators;
  }

  trackByField(_: number, definition: FiltersDefinition<R, U>) {
    return definition.key;
  }

  trackByOperator(_: number, operator: KeyValue<string, string>) {
    return operator.key;
  }

  #findFilterMetadata(key: R): FiltersDefinition<R, U> | null {
    return this.filtersDefinitions.find(f => f.key === key) ?? null;
  }
}