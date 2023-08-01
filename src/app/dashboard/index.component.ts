import { TaskStatus } from '@aneoconsultingfr/armonik.api.angular';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule  } from '@angular/material/tooltip';
import { TasksGrpcService } from '@app/tasks/services/tasks-grpc.service';
import { TasksStatusesService } from '@app/tasks/services/tasks-status.service';
import { AddLineDialogData, AddLineDialogResult } from '@app/types/dialog';
import { Page } from '@app/types/pages';
import { ActionsToolbarGroupComponent } from '@components/actions-toolbar-group.component';
import { ActionsToolbarComponent } from '@components/actions-toolbar.component';
import { AutoRefreshButtonComponent } from '@components/auto-refresh-button.component';
import { FiltersToolbarComponent } from '@components/filters-toolbar.component';
import { PageHeaderComponent } from '@components/page-header.component';
import { PageSectionHeaderComponent } from '@components/page-section-header.component';
import { PageSectionComponent } from '@components/page-section.component';
import { RefreshButtonComponent } from '@components/refresh-button.component';
import { SpinnerComponent } from '@components/spinner.component';
import { AutoRefreshService } from '@services/auto-refresh.service';
import { IconsService } from '@services/icons.service';
import { QueryParamsService } from '@services/query-params.service';
import { ShareUrlService } from '@services/share-url.service';
import { StorageService } from '@services/storage.service';
import { TableStorageService } from '@services/table-storage.service';
import { TableURLService } from '@services/table-url.service';
import { TableService } from '@services/table.service';
import { UtilsService } from '@services/utils.service';
import { AddLineDialogComponent } from './components/add-line-dialog.component';
import { LineComponent } from './components/line.component';
import { ManageLinesDialogComponent } from './components/manage-lines-dialog.component';
import { DashboardIndexService } from './services/dashboard-index.service';
import { DashboardStorageService } from './services/dashboard-storage.service';
import { Line, ManageLinesDialogData, ManageLinesDialogResult } from './types';




@Component({
  selector: 'app-dashboard-index',
  template: `
<app-page-header [sharableURL]="sharableURL">
  <mat-icon matListItemIcon aria-hidden="true" [fontIcon]="getPageIcon('dashboard')"></mat-icon>
  <span i18n="Page title"> Dashboard </span>
</app-page-header>

 <div class="fab-container">
    <div class="settings"  *ngIf="lines.length > 0">
        <button  class="settings-lines" mat-fab color="primary" aria-label="Manage lines" aria-hidden="true" matTooltipPosition="left" matTooltip="Manage your lines">
          <mat-icon [fontIcon]="getIcon('settings')"></mat-icon>
        </button>
    </div>
    <ul class="options">
      <li>
        <button *ngIf="lines.length > 1" class="reorder-line" mat-fab color="primary" aria-label="Reorder lines" aria-hidden="true" (click)="onManageLinesDialog()" matTooltipPosition="left" matTooltip="Reorder your lines">
          <mat-icon [fontIcon]="getIcon('filter-list')"></mat-icon>
        </button>
      </li>
      <li>
        <button *ngIf="lines.length > 0" class="add-line" mat-fab color="primary" aria-label="Add a line" aria-hidden="true" (click)="onAddLineDialog()"matTooltipPosition="left" matTooltip="Add a line">
          <mat-icon [fontIcon]="getIcon('add')"></mat-icon>
        </button>
      </li>
    </ul>
</div>
<div *ngIf="lines.length === 0" class="no-line">
    <em i18n>
      Your dashboard is empty, add a line to start monitoring your tasks.
    </em>

    <button mat-raised-button color="primary" (click)="onAddLineDialog()">Add a line</button>
</div>

<div class="lines">
  <app-page-section *ngFor="let line of lines; let index = index trackBy:trackByLine; ">
    <app-page-section-header icon="adjust">
      <span i18n="Section title">{{ line.name }}</span>
    </app-page-section-header>
      <app-dashboard-line [line]="line"  (lineChange)="onSaveChange()" (lineDelete)="onDeleteLine($event)"></app-dashboard-line>
  </app-page-section>
</div>
  `,
  styles: [`


.fab-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem; 
  z-index: 50;
  
}
.options { 
  position: absolute;
  bottom: 3.8rem; 
  list-style-type: none;
  margin: 0; 
  padding: 0;
  opacity: 0; 
  transition: all  0.3s;
  transform-origin: 80% bottom; 
}

.options li {
  padding: .5rem 0;
}

.settings:hover + .options, .options:hover{
   opacity: 1; 
}

.no-line {
  margin-top: 2rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 2rem;
}

.lines {
  display: flex;
  flex-direction: column;

  gap: 4rem;

  /* Allow user to view tasks even with the add button */
  margin-bottom: 2rem
}
  `],
  standalone: true,
  providers: [
    TasksStatusesService,
    ShareUrlService,
    QueryParamsService,
    TasksGrpcService,
    StorageService,
    DashboardStorageService,
    DashboardIndexService,
    AutoRefreshService,
    UtilsService,
    TableService,
    TableURLService,
    TableStorageService,
    IconsService
  ],
  imports: [
    NgFor,
    NgIf,
    JsonPipe,
    PageHeaderComponent,
    PageSectionComponent,
    SpinnerComponent,
    PageSectionHeaderComponent,
    ActionsToolbarComponent,
    ActionsToolbarGroupComponent,
    RefreshButtonComponent,
    AutoRefreshButtonComponent,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FiltersToolbarComponent,
    LineComponent
  ]
})
export class IndexComponent implements OnInit {
  readonly #iconsService = inject(IconsService);
  readonly #dialog = inject(MatDialog);
  readonly #shareURLService = inject(ShareUrlService);
  readonly #dashboardIndexService = inject(DashboardIndexService);

  lines: Line[];

  sharableURL = '';

  ngOnInit(): void {
    this.lines = this.#dashboardIndexService.restoreLines();
    this.sharableURL = this.#shareURLService.generateSharableURL(null, null);
  }

  getIcon(name: string): string {
    return this.#iconsService.getIcon(name);
  }

  getPageIcon(name: Page): string {
    return this.#iconsService.getPageIcon(name);
  }

  onAddLineDialog() {
    const dialogRef = this.#dialog.open<AddLineDialogComponent, AddLineDialogData, AddLineDialogResult>(AddLineDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.name.trim() === '') return;

      if (result) {
        this.lines.push({
          name: result.name,
          interval: 5,
          hideGroupsHeader: false,
          filters: [],
          taskStatusesGroups: [
            {
              name: 'Finished',
              color: '#00ff00',
              statuses: [
                TaskStatus.TASK_STATUS_COMPLETED,
                TaskStatus.TASK_STATUS_CANCELLED,
              ],
            },
            {
              name: 'Running',
              color: '#ffa500',
              statuses: [
                TaskStatus.TASK_STATUS_PROCESSING,
              ]
            },
            {
              name: 'Errors',
              color: '#ff0000',
              statuses: [
                TaskStatus.TASK_STATUS_ERROR,
                TaskStatus.TASK_STATUS_TIMEOUT,
              ]
            },
          ],
        });
        this.onSaveChange();
      }
    });
  }

  onDeleteLine( value: Line) {
    const index = this.lines.indexOf(value);
    if (index > -1) {
      this.lines.splice(index, 1);
    }
    this.onSaveChange();
  }

  onSaveChange() {
    this.#dashboardIndexService.saveLines(this.lines);
  }

  onManageLinesDialog() {
    const dialogRef: MatDialogRef<ManageLinesDialogComponent, ManageLinesDialogResult> = this.#dialog.open<ManageLinesDialogComponent, ManageLinesDialogData, ManageLinesDialogResult>(ManageLinesDialogComponent, {
      data: {
        lines : this.lines,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      this.lines = result.lines;
      this.onSaveChange();
      
    });

  }

  trackByLine(index: number, _: Line) {
    return index;
  }
}
