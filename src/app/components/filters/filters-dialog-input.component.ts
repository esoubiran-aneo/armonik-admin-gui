import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LuxonDateAdapter, MAT_LUXON_DATE_ADAPTER_OPTIONS, MAT_LUXON_DATE_FORMATS  } from '@angular/material-luxon-adapter';
import { DateTime } from 'luxon';
import { FilterInput, FilterInputOutput, FilterInputType } from '@app/types/filters';



@Component({
  selector: 'app-filters-dialog-input',
  template: `
<mat-form-field appearance="outline" subscriptSizing="dynamic" *ngIf="input.type === 'string'">
  <mat-label i18n="Input label">Value</mat-label>
  <input matInput [type]="getInputType()" placeholder="Value" [value]="input.value" (change)="onStringChange($event)">
</mat-form-field>

<mat-form-field appearance="outline" subscriptSizing="dynamic" *ngIf="input.type === 'number'">
  <mat-label i18n="Input label">Value</mat-label>
  <input matInput type="number" placeholder="Value" [value]="input.value" (change)="onNumberChange($event)">
</mat-form-field>

<mat-form-field appearance="outline" subscriptSizing="dynamic" *ngIf="input.type === 'date'">
  <mat-label i18n="Input label">Enter a date range</mat-label>
  <mat-date-range-input [rangePicker]="picker">
    <input matStartDate placeholder="Start date" [value]="input.value.start" (dateChange)="onDateChange('start', $event)">
    <input matEndDate placeholder="End date" [value]="input.value.end" (dateChange)="onDateChange('end', $event)">
  </mat-date-range-input>
  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-date-range-picker #picker></mat-date-range-picker>
</mat-form-field>

<mat-form-field appearance="outline" subscriptSizing="dynamic" *ngIf="input.type === 'status'">
  <mat-label i18n="Input label">Value</mat-label>
  <mat-select [value]="input.value?.toString()" (valueChange)="onStatusChange($event)">
    <mat-option *ngFor="let option of input.statuses; trackBy: trackBySelect" [value]="option.key">{{ option.value }}</mat-option>
  </mat-select>
</mat-form-field>
  `,
  styles: [`
mat-form-field {
  width: 100%;
}
  `],
  standalone: true,
  providers: [
    // Not working with the module import. (https://stackblitz.com/edit/components-issue-j5ktcc?file=src/app/not-working-datepicker.component.ts)
    {provide: MAT_DATE_FORMATS, useValue: MAT_LUXON_DATE_FORMATS},
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_LUXON_DATE_ADAPTER_OPTIONS],
    },
  ],
  imports: [
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
})
export class FiltersDialogInputComponent {
  @Input({ required: true }) input: FilterInput;

  // Maybe we will need to emit the type of value in order to be able to correctly handle the value.
  // Créer des types en fonction du type de champ
  @Output() valueChange: EventEmitter<FilterInputOutput> = new EventEmitter<FilterInputOutput>();

  onStringChange(event: Event): void {
    this.valueChange.emit({
      type: 'string',
      value: (event.target as HTMLInputElement).value,
    });
  }

  onNumberChange(event: Event): void {
    this.valueChange.emit({
      type: 'number',
      value: Number((event.target as HTMLInputElement).value),
    });
  }

  onDateChange(dateType: 'end' | 'start', event: MatDatepickerInputEvent<DateTime>): void {
    this.valueChange.emit({
      type: `date-${dateType}`,
      value: event.value,
    });
  }

  onStatusChange(event: string): void {
    this.valueChange.emit({
      type: 'string',
      value: event,
    });
  }

  getInputType(): FilterInputType  {
    switch (this.input.type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    case 'array':
      return 'string';
    case 'status':
      return 'status';
    default:
      return 'string';
    }
  }

  trackBySelect(_: number, item: { value: string }): string {
    return item.value;
  }
}
