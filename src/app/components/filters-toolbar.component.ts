import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnKey } from '@app/types/data';
import { FiltersDialogData, FiltersDialogResult } from '@app/types/dialog';
import { FiltersAnd, FiltersDefinition, FiltersOr } from '@app/types/filters';
import { FiltersChipsComponent } from '@components/filters-chips.component';
import { FiltersDialogComponent } from '@components/filters-dialog.component';
import { IconsService } from '@services/icons.service';

@Component({
  selector: 'app-filters-toolbar',
  template: `
<div class="filters-toolbar">
  <ng-container  *ngFor="let filtersAnd of filters; let first = first; trackBy: trackByFilter">
    <div class="filters-toolbar-and">
      <span class="filters-toolbar-text" *ngIf="first">
        Where
      </span>
      <span class="filters-toolbar-text" *ngIf="!first">
        OR
      </span>
      <app-filters-chips [filtersAnd]="filtersAnd" [filtersFields]="filtersFields" [columnsLabels]="columnsLabels"></app-filters-chips>
    </div>
  </ng-container>

  <button mat-button (click)="openFiltersDialog()" matTooltip="Add or Remove Filters" i18n-matTooltip>
    <mat-icon aria-hidden="true" [fontIcon]="getIcon('add')"></mat-icon>
    <span i18n="User will be able the create or delete filters">Manage filters</span>
  </button>
</div>
  `,
  styles: [`
.filters-toolbar {
  display: flex;
  flex-direction: column;

  gap: 0.5rem;
}

.filters-toolbar-text {
  font-size: 1rem;
  font-weight: 400;

  min-width: 3rem;
  text-align: end;
}

.filters-toolbar-and {
  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 0.5rem;
}

button {
  align-self: flex-start;
}
  `],
  standalone: true,
  providers: [],
  imports: [
    NgIf,
    NgFor,
    FiltersChipsComponent,
    FiltersDialogComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
  ]
})
export class FiltersToolbarComponent<T extends object, U = null> {
  #iconsService = inject(IconsService);
  #dialog = inject(MatDialog);

  @Input({ required: true }) filters: FiltersOr<T> = [];
  @Input({ required: true }) filtersFields: FiltersDefinition<T, U>[] = [];
  @Input({ required: true }) columnsLabels: Record<ColumnKey<T>, string>;

  @Output() filtersChange: EventEmitter<FiltersOr<T>> = new EventEmitter<FiltersOr<T>>();

  getIcon(name: string): string {
    return this.#iconsService.getIcon(name);
  }

  showFilters(): boolean {
    return true;
    // return  this.filters.length > 1 || (this.filters[0]?.value !== null && this.filters.length === 1);
  }

  openFiltersDialog(): void {
    const dialogRef = this.#dialog.open<FiltersDialogComponent<T, U>, FiltersDialogData<T, U>, FiltersDialogResult<T>>(FiltersDialogComponent, {
      data: {
        filtersOr: Array.from(this.filters),
        filtersDefinitions: Array.from(this.filtersFields),
        columnsLabels: this.columnsLabels,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) {
        return;
      }

      this.filtersChange.emit(result);
    });
  }

  trackByFilter(index: number, filtersAnd: FiltersAnd<T>) {
    return index + filtersAnd.length;
  }
}
