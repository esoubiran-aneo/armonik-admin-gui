import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Filter } from '@app/types/filters';
import { IconsService } from '@services/icons.service';
import { FiltersDialogAndComponent } from './filters-dialog-and.component';

@Component({
  selector: 'app-filters-dialog-or',
  template: `
<span *ngIf="first" i18n="Filter condition">Where</span>
<span *ngIf="!first" i18n="Filter condition">Or</span>

<div class="filters">
  <div class="filters-and">
    <ng-container *ngFor="let filtersAnd of filtersOr; let index = index">
      <app-filters-dialog-and
        [first]="index === 0"
        [filter]="filtersAnd"
        (removeChange)="onRemoveAnd($event)"
      >
      </app-filters-dialog-and>
    </ng-container>

    <div>
      <button mat-button (click)="onAdd()">
        <mat-icon aria-hidden="true" [fontIcon]="getIcon('add')"></mat-icon>
        <span i18n>Add an And Filter</span>
      </button>
    </div>
  </div>
</div>

<button mat-icon-button aria-label="More options" mat-tooltip="More options" [matMenuTriggerFor]="menu">
  <mat-icon aria-hidden="true" [fontIcon]="getIcon('more')"></mat-icon>
</button>

<mat-menu #menu="matMenu">
  <button mat-menu-item (click)="onRemoveOr()">
    <mat-icon aria-hidden="true" [fontIcon]="getIcon('delete')"></mat-icon>
    <span i18n>Remove</span>
  </button>
</mat-menu>
<!-- TODO: add a button to remove this or group -->
  `,
  styles: [`
:host {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

span {
  padding-top: 1rem;
  min-width: 3rem;
  text-align: end;
}

.filters {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.filters-and {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FiltersDialogAndComponent,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ],
  providers: [
    IconsService
  ],
})
export class FiltersDialogOrComponent<T extends number, U extends number | null = null> {
  @Input({ required: true }) first: boolean;
  @Input({ required: true }) filtersOr: Filter<T, U>[];

  @Output() removeChange: EventEmitter<Filter<T, U>[]> = new EventEmitter<Filter<T, U>[]>();

  #iconsService = inject(IconsService);

  getIcon(name: string) {
    return this.#iconsService.getIcon(name);
  }

  onAdd() {
    this.filtersOr.push({
      for: null,
      field: null,
      operator: null,
      value: null,
    });
  }

  onRemoveAnd(filter: Filter<T, U>) {
    const index = this.filtersOr.indexOf(filter);
    if (index > -1) {
      this.filtersOr.splice(index, 1);
    }
  }

  onRemoveOr() {
    this.removeChange.emit(this.filtersOr);
  }
}
