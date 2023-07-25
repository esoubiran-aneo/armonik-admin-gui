import { KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnKey } from '@app/types/data';
import { FiltersDialogData } from '@app/types/dialog';
import { Filter, FiltersDefinition, FiltersOr } from '@app/types/filters';
import { FiltersService } from '@services/filters.service';
import { IconsService } from '@services/icons.service';
import { FiltersDialogInputComponent } from './filters-dialog-input.component';
import { FiltersDialogOrComponent } from './filters-dialog-or.component';

@Component({
  selector: 'app-filters-dialog',
  template: `
    <h2 mat-dialog-title i18n="Dialog title">Filters</h2>

    <mat-dialog-content>
      <p i18n="Dialog description">Build your filters</p>

      <div class="filters">
        <ng-container *ngFor="let filtersOr of filtersOr; let index = index; trackBy: trackByFilter">
          <app-filters-dialog-or
            [first]="index === 0"
            [filtersOr]="filtersOr"
            [filtersDefinitions]="filtersDefinitions()"
            [columnsLabels]="columnsLabels"
            (removeChange)="onRemoveOr($event)"
          ></app-filters-dialog-or>
        </ng-container>

        <div>
          <button mat-button (click)="onAdd()">
            <mat-icon aria-hidden="true" [fontIcon]="getIcon('add')"></mat-icon>
            <span i18n>Add an Or Group</span>
          </button>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()" i18n="Dialog action"> Cancel </button>
      <button mat-flat-button [mat-dialog-close]="filtersOr" color="primary" i18n="Dialog action"> Confirm </button>
    </mat-dialog-actions>
    `,
  styles: [`
.filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
export class FiltersDialogComponent<T extends object, U> implements OnInit {
  #iconsService = inject(IconsService);
  #dialogRef = inject(MatDialogRef<FiltersDialogComponent<T, U>>);

  filtersOr: FiltersOr<T> = [];
  columnsLabels: Record<ColumnKey<T>, string> | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: FiltersDialogData<T, U>){}

  ngOnInit(): void {
    this.columnsLabels = this.data.columnsLabels;

    if (!this.data.filtersOr.length) {
      this.onAdd();
    } else {
      this.filtersOr = structuredClone(this.data.filtersOr);
    }
  }

  onAdd() {
    this.filtersOr.push([
      {
        key: null,
        operator: null,
        value: null,
      }
    ]);
  }

  onRemoveOr(filters: Filter<T>[]) {
    const index = this.filtersOr.indexOf(filters);
    if (index > -1) {
      this.filtersOr.splice(index, 1);
    }
  }

  onNoClick(): void {
    this.#dialogRef.close();
  }

  getIcon(name: string): string {
    return this.#iconsService.getIcon(name);
  }

  /**
   * Get the available field (all the field that can be added)
   * Sort the field alphabetically
   */
  filtersDefinitions(): FiltersDefinition<T, U>[] {
    return this.data.filtersDefinitions.sort((a, b) => (a.key as string).localeCompare(b.key as string));
  }

  trackByFilter(index: number, filters: Filter<T>[]) {
    return index + filters.length;
  }
}
