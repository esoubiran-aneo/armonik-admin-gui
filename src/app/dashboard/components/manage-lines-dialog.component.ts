import { TaskStatus } from '@aneoconsultingfr/armonik.api.angular';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgFor } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Line, ManageGroupsDialogData, ManageGroupsDialogResult, ManageLinesDialogData, ManageLinesDialogResult, TasksStatusesGroup } from '@app/dashboard/types';
import { TasksStatusesService } from '@app/tasks/services/tasks-status.service';
import { ActionsToolbarGroupComponent } from '@components/actions-toolbar-group.component';
import { ActionsToolbarComponent } from '@components/actions-toolbar.component';
import { IconsService } from '@services/icons.service';
import { StorageService } from '@services/storage.service';
import { DashboardIndexService } from '../services/dashboard-index.service';
import { DashboardStorageService } from '../services/dashboard-storage.service';

@Component({
  template: `
<h2 mat-dialog-title i18n="Dialog title">Manage Lines</h2>

<mat-dialog-content>

  <ul cdkDropList (cdkDropListDropped)="drop($event)" [cdkDropListData]="lines" class="name-lines" cdkDropListGroup>
        <li *ngFor="let line of lines" cdkDrag class="name-lines">
          <mat-icon aria-hidden="true" [fontIcon]="getIcon('drag')"></mat-icon>
          <span>{{ line.name }}</span>
        </li>
  </ul>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="onNoClick()" i18n="Dialog action"> Cancel </button>
  <button mat-flat-button [mat-dialog-close]="{ lines }" color="primary" i18n="Dialog action"> Confirm </button>
</mat-dialog-actions>
  `,
  styles: [`
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.groups {
  margin-top: 1rem;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 2rem;
}

.groups ul {
  min-height: 2rem;
}

.groups ul li {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;

  padding: 0.5rem;
  border-radius: 0.5rem;
}

.groups ul li mat-icon {
  cursor: move;
}

.group-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.group-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.group-header-actions {
  display: flex;
  gap: 0.5rem;
}

.cdk-drag-preview {
  font-size: 1rem;

  list-style: none;
  padding: 0 0.5rem;
  border-radius: 0.5rem;

  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 0.5rem;

  color: rgba(0, 0, 0, 0.6);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.groups ul.cdk-drop-list-dragging li:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
  `],
  standalone: true,
  providers: [
    TasksStatusesService,
    StorageService,
    DashboardStorageService,
    DashboardIndexService
  ],
  imports: [
    ActionsToolbarComponent,
    ActionsToolbarGroupComponent,
    NgFor,
    MatButtonModule,
    MatDialogModule,
    MatToolbarModule,
    MatIconModule,
    DragDropModule
  ]
})
export class ManageLinesDialogComponent implements OnInit {
  lines: Line[] = [];
  #iconsServices = inject(IconsService);

  constructor(
    public _dialogRef: MatDialogRef<ManageLinesDialogComponent, ManageLinesDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: ManageLinesDialogData,
  ) {}

  ngOnInit(): void {
    this.lines = structuredClone(this.data.lines);
  }

  getIcon(name: string): string {
    return this.#iconsServices.getIcon(name);
  }


  drop(event: CdkDragDrop<Line[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }


  onNoClick(): void {
    this._dialogRef.close();
  }
}
