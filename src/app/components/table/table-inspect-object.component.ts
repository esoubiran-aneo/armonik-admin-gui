import { Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconsService } from '@services/icons.service';
import { TableInspectObjectDialogComponent, TableInspectObjectDialogData } from './table-inspect-object-dialog.component';

@Component({
  selector: 'app-table-inspect-object',
  template: `
    <button mat-icon-button matTooltip="View" i18n-matTooltip (click)="onViewObject()" aria-label="view" i18n-aria-label>
      <mat-icon [fontIcon]="getIcon('view')"></mat-icon>
    </button>
  `,
  styles: [`
  `],
  standalone: true,
  imports: [
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [],
})
export class TableInspectObjectComponent
{
  @Input({ required: true }) object: Record<string, unknown>;
  @Input({ required: true }) label: string;

  #iconsService = inject(IconsService);
  #dialog = inject(MatDialog);

  getIcon(name: string): string {
    return this.#iconsService.getIcon(name);
  }

  onViewObject(): void {
    this.#dialog.open<TableInspectObjectDialogComponent, TableInspectObjectDialogData, void>(TableInspectObjectDialogComponent, {
      data: {
        label: this.label,
        object: this.object,
      },
    });
  }
}
