import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgFor } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EditNameLineData, EditNameLineResult, ReorganizeLinesDialogData, ReorganizeLinesDialogResult } from '@app/types/dialog';
import { IconsService } from '@services/icons.service';
import { EditNameLineDialogComponent } from './edit-name-line-dialog.component';
import { Line } from '../types';

@Component({
  selector: 'app-dashboard-reorganize-lines-dialog',
  template: `
<h2 mat-dialog-title i18n="Dialog title">Reorganize lines</h2>

<mat-dialog-content>
  <p i18n="Dialog description">Drag and drop lines to update the order</p>

  <div class="lines" cdkDropList (cdkDropListDropped)="drop($event)">
    <div class="line" *ngFor="let line of lines" cdkDrag>
      <mat-icon mat-icon aria-hidden="true" i18n-aria-label aria-label="Drag status" [fontIcon]="getIcon('drag')"></mat-icon>
      <span class="line-name">{{ line.name }}</span>
      <button mat-menu-item (click)="onEditNameLine(line.name)">
            <mat-icon aria-hidden="true"  [fontIcon]="getIcon('edit')"></mat-icon>
              <span i18n>
                Edit name line
              </span>
          </button>
          <button mat-menu-item (click)="onDeleteLine(line)">
              <mat-icon aria-hidden="true" [fontIcon]="getIcon('delete')"></mat-icon>
              <span i18n>
                Delete line
              </span>
      </button>
      <!-- TODO: Add a button to rename the line (use same dialog as the one used for a line "Edit Name Line") -->
      <!-- TODO: Add a button to remove the line -->
    </div>
  </div>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="onNoClick()" i18n="Dialog action"> Cancel </button>
  <button mat-flat-button [mat-dialog-close]="{ lines }" color="primary" i18n="Dialog action"> Confirm </button>
</mat-dialog-actions>
  `,
  styles: [`
.lines {
  display: flex;
  flex-direction: column;
}

.line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;

  cursor: move;
}

.cdk-drag-preview {
  color: rgba(0, 0, 0, 0.6);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.lines.cdk-drop-list-dragging .line:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
  `],
  standalone: true,
  providers: [
    IconsService,
  ],
  imports: [
    NgFor,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    DragDropModule,
    MatDialogModule,
  ]
})
export class ReorganizeLinesDialogComponent implements OnInit {

  @Input({ required: true }) line: Line;
  @Output() lineChange: EventEmitter<void> = new EventEmitter<void>();
  @Output() lineDelete: EventEmitter<Line> = new EventEmitter<Line>();


  readonly #dialogRef = inject(MatDialogRef<ReorganizeLinesDialogData, ReorganizeLinesDialogResult>);
  readonly #iconsService = inject(IconsService);
  readonly #dialog = inject(MatDialog);
  lines: Line[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReorganizeLinesDialogData,
  ) {}

  ngOnInit(): void {
    this.lines = this.data.lines;
  }

  getIcon(name: string): string {
    return this.#iconsService.getIcon(name);
  }

  onNoClick(): void {
    this.#dialogRef.close();
  }

  drop(event: CdkDragDrop<Line[]>) {
    moveItemInArray(this.lines, event.previousIndex, event.currentIndex);
  }

  onDeleteLine(value: Line) {
    console.log(`yoyu ${value.name}`);
  }
  
  onEditNameLine(value: string) {
    const dialogRef: MatDialogRef<EditNameLineDialogComponent, EditNameLineResult> = this.#dialog.open<EditNameLineDialogComponent, EditNameLineData, EditNameLineResult>(EditNameLineDialogComponent, {
      data: {
        name: value
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return; 
      console.log(this.lines);
      this.lines.map( line => line); 
    });

  }
  trackByLine(index: number, line: Line): string {
    return line.name + index;
  }
}
