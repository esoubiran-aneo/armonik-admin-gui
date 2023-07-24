import { KeyValue, KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnKey, FieldKey } from '@app/types/data';
import { FiltersDialogData } from '@app/types/dialog';
import { Filter, FilterInput, FilterInputDate, FilterInputOutput, FilterInputString, FilterInputType, FilterInputValue, FiltersDefinition } from '@app/types/filters';
import { IconsService } from '@services/icons.service';
import { FiltersDialogInputComponent } from './filters-dialog-input.component';
import { FiltersService } from '@services/filters.service'
import { FiltersDialogOrComponent } from './filters-dialog-or.component';

@Component({
  selector: 'app-filters-dialog',
  template: `
    <h2 mat-dialog-title i18n="Dialog title">Filters</h2>

    <mat-dialog-content>
      <p i18n="Dialog description">Build your filters</p>

      <div class="filters">
        <ng-container *ngFor="let filtersOr of ngFilters; let index = index">
          <app-filters-dialog-or
            [first]="index === 0"
            [filtersOr]="filtersOr"
            [filtersDefinitions]="filtersDefinitions()"
            [columnsLabels]="columnsLabels"
            (removeChange)="onRemoveOr($event)"
          >

          </app-filters-dialog-or>
        </ng-container>

        <div>
          <button mat-button (click)="onAdd()">
            <mat-icon aria-hidden="true" [fontIcon]="getIcon('add')"></mat-icon>
            <span i18n>Add an Or Filter</span>
          </button>
        </div>

        <button (click)="save()">
          save
        </button>
      </div>

      <div class="filters">
        <div class="filter" *ngFor="let filter of filters; let index = index; trackBy:trackByFilter">
          <span *ngIf="index === 0" i18n="Filter condition">Where</span>
          <span *ngIf="index > 0" i18n="Filter condition">And</span>
          <mat-form-field appearance="outline"  subscriptSizing="dynamic">
            <mat-label i18n="Label input">Column</mat-label>
            <mat-select (valueChange)="onFieldChange(index, $event)" [value]="filter.key">
              <mat-option *ngFor="let column of filtersDefinitions(); trackBy: trackByField" [value]="column.key" [disabled]="disableField(column)">
                {{ columnToLabel(column) }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline"  subscriptSizing="dynamic">
            <mat-label i18n="Label input">Operator</mat-label>
            <mat-select>
              <mat-option *ngFor="let operator of accessFilterRange(findType(filter.key)) | keyvalue; trackBy: trackByRange" [value]="operator.key">
                {{ operator.value }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <app-filters-dialog-input [input]="findInput(filter)" (valueChange)="onInputValueChange(index, $event)"></app-filters-dialog-input>

          <button mat-icon-button aria-label="More options" mat-tooltip="More options" [matMenuTriggerFor]="menu">
            <mat-icon aria-hidden="true" [fontIcon]="getIcon('more')"></mat-icon>
          </button>

          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="onClear(filter)">
              <mat-icon aria-hidden="true" [fontIcon]="getIcon('clear')"></mat-icon>
              <span i18n>Clear</span>
            </button>
            <button mat-menu-item (click)="onRemove(index)" [disabled]="filters.length === 1 && index === 0">
              <mat-icon aria-hidden="true" [fontIcon]="getIcon('delete')"></mat-icon>
              <span i18n>Remove</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <button class="add-filter" mat-button (click)="addFilter()">
        <mat-icon aria-hidden="true" [fontIcon]="getIcon('add')"></mat-icon>
        <span i18n>Add a filter rule</span>
      </button>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()" i18n="Dialog action"> Cancel </button>
      <button mat-flat-button [mat-dialog-close]="filters" color="primary" i18n="Dialog action"> Confirm </button>
    </mat-dialog-actions>
    `,
  styles: [`
  .filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .filter {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .filter > span:first-child {
    min-width: 3rem;
    text-align: end;
  }

  .add-filter {
    margin-top: 1rem;
  }

  app-filters-dialog-input {
    flex: 1;
  }
  `],
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    KeyValuePipe,
    FiltersDialogOrComponent,
    FiltersDialogInputComponent,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  providers: [
    FiltersService
  ],
})
export class FiltersDialogComponent<T extends object> implements OnInit {

  ngFilters: any = [
    [
      {
        field: 'name',
        operator: 3,
        value: 'test',
      },
      {
        field: 'service',
        operator: 1,
        value: 'super',
      }
    ],
    [
      {
        field: 'version',
        operator: 5,
        value: 'test',
      }
    ],
  ]

  #iconsService = inject(IconsService);
  #filtersService = inject(FiltersService);

  filters: Filter<T>[] = [];
  columnsLabels: Record<ColumnKey<T>, string> | null = null;

  constructor(public dialogRef: MatDialogRef<FiltersDialogComponent<T>>, @Inject(MAT_DIALOG_DATA) public data: FiltersDialogData<T>){}

  ngOnInit(): void {
    this.columnsLabels = this.data.columnsLabels;

    if (this.data.filters.length === 0) {
      this.addFilter();
    } else {
      // Avoid to mutate original data
      this.filters = this.data.filters.map(filter => ({ ...filter }));
    }
  }

  save() {
    console.log(this.ngFilters);
  }

  onAdd() {
    this.ngFilters.push([
      {
        field: null,
        operator: null,
        value: null,
      }
    ]);
  }

  onRemoveOr(filters: Filter<T>[]) {
    const index = this.ngFilters.indexOf(filters);
    if (index > -1) {
      this.ngFilters.splice(index, 1);
    }
  }

  accessFilterRange(type: string) {
    const range = this.#filtersService.findOperators(type as any);

    return range;
  }

  getIcon(name: string): string {
    return this.#iconsService.getIcon(name);
  }

  /**
   * Get the available field (all the field that can be added)
   * Sort the field alphabetically
   */
  filtersDefinitions(): FiltersDefinition<T>[] {
    return this.data.filtersDefinitions.sort((a, b) => (a.key as string).localeCompare(b.key as string));
  }

  columnToLabel(column: FiltersDefinition<T>): string {
    if (this.columnsLabels === null)
      return column.key.toString();
    else
      return this.columnsLabels[column.key];
  }

  addFilter(): void {
    this.filters.push({
      key: null,
      value: null,
      operator: null
    });
  }

  onFieldChange(index: number, name: FieldKey<T>): void {
    this.filters[index].key = name;
  }

  onInputValueChange(index: number, event: FilterInputOutput): void {
    if (event.type === 'string')
      this.filters[index].value = event.value;
    else if (event.type === 'number')
      this.filters[index].value = event.value;
    else if (event.type === 'date-start')
      this.filters[index].value = { start: event.value?.toISODate() ?? null, end: (this.filters[index].value as {end: string | null })?.end };
    else if (event.type === 'date-end')
      this.filters[index].value = { start: (this.filters[index].value as {start: string | null })?.start, end: event.value?.toISODate() ?? null };
  }

  onValueChange(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    this.filters[index].value = value;
  }

  onClear(filter: Filter<T>): void {
    filter.key = null;
    filter.value = null;
  }

  onRemove(index: number): void {
    this.filters.splice(index, 1);
  }

  selectedField(filterName: FiltersDefinition<T>, field: FiltersDefinition<T>): boolean {
    return filterName === field;
  }

  disableField(field: FiltersDefinition<T>): boolean {
    const usedFields = this.filters.map(filter => filter.key);
    return usedFields.includes(field.key);
  }

  findType(field: FieldKey<T> | null): FilterInputType {
    if (!field) {
      return 'string' as any;
    }

    const filter = this.data.filtersDefinitions.find(filter => filter.key === field);

    // FIXME: as any
    return filter?.type as any ?? 'string';
  }

  findInput(filter: Filter<T>): FilterInput {
    const type = this.findType(filter.key);

    if (type === 'number') {
      return {
        type: 'number',
        value: Number(filter.value) || null,
      };
    }

    if (type === 'date') {
      return {
        type: 'date',
        value: filter.value as FilterInputDate['value'] || { start: null, end: null }
      };
    }

    // if (type === 'select') {
    //   const options = (this.data.filtersDefinitions.find(f => f.key === filter.key) as FilterFieldSelect<T>).options;
    //   return {
    //     type: 'select',
    //     value: filter.value as FilterInputSelect['value'] || null,
    //     options,
    //   };
    // }

    return {
      type: 'string',
      value: filter.value as FilterInputString['value'],
    };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  trackByFilter(index: number) {
    return index;
  }

  trackByField(_: number, field: FiltersDefinition<T>) {
    return field.key;
  }

  trackByRange(_: number, range: KeyValue<string, string>) {
    return range.key;
  }
}
