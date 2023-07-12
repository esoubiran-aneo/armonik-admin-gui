import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from "@angular/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { Page } from "@app/types/pages";
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { PageHeaderComponent } from "@components/page-header.component";
import { TaskSummaryListOptions, TaskSummaryFieldKey, TaskSummary, TaskSummaryColumnKey, TaskSummaryFilterField, TaskSummaryFilter, TaskOptions,   } from "./types";
import { Observable, Subject, Subscription, catchError, map, merge, of, startWith, switchMap } from "rxjs";
import { Timestamp } from '@ngx-grpc/well-known-types';
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AutoRefreshService } from "@services/auto-refresh.service";
import { IconsService } from "@services/icons.service";
import { NotificationService } from "@services/notification.service";
import { ShareUrlService } from "@services/share-url.service";
import { TaskGrpcService } from "./services/tasks-grpc.service";
import { TasksStatusesService } from "./services/task-status.service";
import { TasksIndexService } from "./services/tasks-index.service";
import { TableActionsToolbarComponent } from "@components/table-actions-toolbar.component";
import { TableContainerComponent } from "../components/table-container.component";
import { QueryParamsService } from "@services/query-params.service";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { StorageService } from "@services/storage.service";
import { TableStorageService } from "@services/table-storage.service";
import { TableURLService } from "@services/table-url.service";
import { TableService } from "@services/table.service";
import { UtilsService } from "@services/utils.service";
import { DatePipe, NgForOf, NgIf } from "@angular/common";
import { TableInspectObjectComponent } from "@components/table/table-inspect-object.component";
import { EmptyCellPipe } from "../pipes/empty-cell.pipe";
import { RouterLink } from "@angular/router";
import {  ClipboardModule } from "@angular/cdk/clipboard";
import { DurationPipe } from "../pipes/duration.pipe";
import { TaskStatus } from "@aneoconsultingfr/armonik.api.angular";
import { FiltersToolbarComponent } from "../components/filters-toolbar.component";
@Component({
    selector: 'app-tasks-index',
    template: `
        <app-page-header [sharableURL]="sharableURL">
            <mat-icon matListItemIcon aria-hidden="true" [fontIcon]="getIcon('tasks')"></mat-icon>
            <span i18n="Page title">Tasks</span>
        </app-page-header>
        
        <mat-toolbar>
            <mat-toolbar-row>
                <app-table-actions-toolbar
                [loading]="isLoading"
                [refreshTooltip]="autoRefreshTooltip()"
                [intervalValue]="intervalValue"
                [columnsLabels]="columnsLabels()"
                [displayedColumns]="displayedColumns"
                [availableColumns]="availableColumns"
                (refresh)="onRefresh()"
                (intervalValueChange)="onIntervalValueChange($event)"
                (displayedColumnsChange)="onColumnsChange($event)"
                (resetColumns)="onColumnsReset()"
                (resetFilters)="onFiltersReset()"
                >
                </app-table-actions-toolbar>
            </mat-toolbar-row>

            <mat-toolbar-row>
                  <app-filters-toolbar [filters]="filters" [filtersFields]="availableFiltersFields" [columnsLabels]="columnsLabels()" (filtersChange)="onFiltersChange($event)"></app-filters-toolbar>
            </mat-toolbar-row>
        </mat-toolbar>

        <app-table-container>
  <table mat-table matSort [matSortActive]="options.sort.active" matSortDisableClear [matSortDirection]="options.sort.direction" [dataSource]="data" cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="onDrop($event)">

    <ng-container *ngFor="let column of displayedColumns" [matColumnDef]="column">
      <!-- Header -->
      <th mat-header-cell mat-sort-header [disabled]="isNotSortableColumn(column)" *matHeaderCellDef cdkDrag appNoWrap>
        {{ columnToLabel(column) }}
      </th>
      <!-- Columns -->
      <ng-container *ngIf="isSimpleColumn(column)">
        <td mat-cell *matCellDef="let element" appNoWrap>
          <span> {{ show(element, column) | emptyCell }} </span>
        </td>
      </ng-container>
      <!-- ID -->
      <ng-container *ngIf="isTaskIdColumn(column)">
        <td mat-cell *matCellDef="let element" appNoWrap>
          <a mat-button
            [routerLink]="['/tasks']"
            [queryParams]="{
              taskId: element[column],
            }"
          >
            {{ element[column] }}
          </a>
        </td>
      </ng-container>
      <!-- Object -->
      <ng-container *ngIf="isObjectColumn(column)">
       <td mat-cell *matCellDef="let element" appNoWrap>
          <app-table-inspect-object [object]="element[column]" [label]="columnToLabel(column)"></app-table-inspect-object>
        </td>
      </ng-container>
      <!-- Date -->
      <ng-container *ngIf="isDateColumn(column)">
        <td mat-cell *matCellDef="let element" appNoWrap>
          <ng-container *ngIf="element[column]; else noDate">
            {{ columnToDate(element[column]) | date: 'yyyy-MM-dd &nbsp;HH:mm:ss.SSS' }}
          </ng-container>
        </td>
      </ng-container>
      <!-- Duration -->
      <ng-container *ngIf="isDurationColumn(column)">
        <td mat-cell *matCellDef="let element" appNoWrap>
          <!-- TODO: move this function to a service in order to reuse extraction logic -->
          {{ extractData(element, column) | duration | emptyCell }}
        </td>
      </ng-container>
      <!-- Status -->
      <ng-container *ngIf="isStatusColumn(column)">
        <td mat-cell *matCellDef="let element" appNoWrap>
          <span> {{ statusToLabel(element[column]) }} </span>
        </td>
      </ng-container>
      <!-- Actions -->
      <ng-container *ngIf="isActionsColumn(column)">
        <!-- TODO: create a directive to add no-wrap -->
        <td mat-cell *matCellDef="let element">
          <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Actions">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item [cdkCopyToClipboard]="element.taskId" (cdkCopyToClipboardCopied)="onCopiedTaskId()">
              <mat-icon aria-hidden="true" fontIcon="content_copy"></mat-icon>
              <span i18n>Copy Task ID</span>
            </button>
            <a mat-menu-item [routerLink]="['/tasks', element.taskId]">
              <mat-icon aria-hidden="true" fontIcon="visibility"></mat-icon>
              <span i18n>See task</span>
            </a>
            <button mat-menu-item (click)="onCancel(element.taskId)">
              <mat-icon aria-hidden="true" fontIcon="cancel"></mat-icon>
              <span i18n>Cancel task</span>
            </button>
          </mat-menu>
        </td>
      </ng-container>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>

  <mat-paginator [length]="total" [pageIndex]="options.pageIndex" [pageSize]="options.pageSize" [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of tasks" i18n-aria-label>
    </mat-paginator>
</app-table-container>


<ng-template #noDate>
  <span> - </span>
</ng-template>


    `,
    styles: [
      `app-table-actions-toolbar {
        flex-grow: 1;
      }`
    ], 
    standalone: true,
    providers: [
        TasksStatusesService,
        IconsService,
        ShareUrlService,
        QueryParamsService,
        StorageService,
        TableURLService,
        TableStorageService,
        TableService,
        UtilsService,
        AutoRefreshService,
        TaskGrpcService,
        NotificationService,
        TasksIndexService,
    ],
    imports: [
        RouterLink,
        MatIconModule,
        PageHeaderComponent,
        DatePipe,
        MatToolbarModule,
        MatTooltipModule,
        MatTableModule,
        TableActionsToolbarComponent,
        TableContainerComponent,
        MatTooltipModule,
        MatTableModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatButtonModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatMenuModule,
        MatDialogModule,
        TableInspectObjectComponent,
        NgIf,
        NgForOf,
        EmptyCellPipe,
        ClipboardModule,
        DurationPipe,
        DragDropModule,
        FiltersToolbarComponent
    ]
})
export class IndexComponent implements OnInit, AfterViewInit, OnDestroy {
  #notificationService = inject(NotificationService);
  displayedColumns: TaskSummaryColumnKey[] = [];
  availableColumns: TaskSummaryColumnKey[] = [];

  isLoading = true;
  data: TaskSummary[] = [];
  total = 0;

  options: TaskSummaryListOptions;

  filters: TaskSummaryFilter[] = [];
  availableFiltersFields: TaskSummaryFilterField[] = [];

  intervalValue = 0;
  sharableURL = '';

  refresh: Subject<void> = new Subject<void>();
  stopInterval: Subject<void> = new Subject<void>();
  interval: Subject<number> = new Subject<number>();
  interval$: Observable<number> = this._autoRefreshService.createInterval(this.interval, this.stopInterval);
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  subscriptions: Subscription = new Subscription();

  constructor(
    private _tasksStatusesService: TasksStatusesService,
    private _iconsService: IconsService,
    private _shareURLService: ShareUrlService,
    private _tasksIndexService: TasksIndexService,
    private _tasksGrpcService: TaskGrpcService,
    private _autoRefreshService: AutoRefreshService
  ) {}

  ngOnInit() {
    this.displayedColumns = this._tasksIndexService.restoreColumns();
    this.availableColumns = this._tasksIndexService.availableColumns;

    this.options = this._tasksIndexService.restoreOptions();

    this.availableFiltersFields = this._tasksIndexService.availableFiltersFields;
    this.filters = this._tasksIndexService.restoreFilters();

    this.intervalValue = this._tasksIndexService.restoreIntervalValue();

    this.sharableURL = this._shareURLService.generateSharableURL(this.options, this.filters);
  }

  ngAfterViewInit(): void {
    // If the user change the sort order, reset back to the first page.
    const sortSubscription = this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    const mergeSubscription = merge(this.sort.sortChange, this.paginator.page, this.refresh, this.interval$)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;

          const options: TaskSummaryListOptions = {
            pageIndex: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
            sort: {
              active: this.sort.active as TaskSummaryFieldKey,
              direction: this.sort.direction,
            },
          };
          const filters = this.filters;

          this.sharableURL = this._shareURLService.generateSharableURL(options, filters);
          this._tasksIndexService.saveOptions(options);

          return this._tasksGrpcService.list$(options, filters ).pipe(catchError((error) => {
            console.error(error);
            this.#notificationService.error('Unable to fetch Tasks');
            return of(null);
          }));
        }),
        map(data => {
          this.isLoading = false;
          this.total = data?.total ?? 0;

          const tasks = data?.tasks ?? [];
          return tasks;
        })
      )
      .subscribe(data => {
        this.data = data;
      });

    this.handleAutoRefreshStart();

    this.subscriptions.add(sortSubscription);
    this.subscriptions.add(mergeSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  show(task: TaskSummary, column: TaskSummaryColumnKey) {
    if (column.startsWith('options.')) {
      const optionColumn = column.replace('options.', '') as keyof TaskOptions;
      const options = task['options'] as TaskOptions | undefined;

      if (!options) {
        return null;
      }

      return options[optionColumn];
    }

    return task[column as keyof TaskSummary];
  }

  columnsLabels(): Record<TaskSummaryColumnKey, string> {
    return this._tasksIndexService.columnsLabels;
  }

  columnToLabel(column: TaskSummaryColumnKey): string {
    return this._tasksIndexService.columnToLabel(column);
  }

  isNotSortableColumn(column: TaskSummaryColumnKey): boolean {
    return this._tasksIndexService.isNotSortableColumn(column);
  }

  isSimpleColumn(column: TaskSummaryColumnKey): boolean {
    return this._tasksIndexService.isSimpleColumn(column);
  }

  isTaskIdColumn(column: TaskSummaryColumnKey): boolean {
    return this._tasksIndexService.isTaskIdColumn(column);
  }

  isObjectColumn(column: TaskSummaryColumnKey): boolean {
    return this._tasksIndexService.isObjectColumn(column);
  }

  isDateColumn(column: TaskSummaryColumnKey): boolean {
    return this._tasksIndexService.isDateColumn(column);
  }

  isDurationColumn(column: TaskSummaryColumnKey): boolean {
    return this._tasksIndexService.isDurationColumn(column);
  }

  isStatusColumn(column: TaskSummaryColumnKey): boolean {
    return this._tasksIndexService.isStatusColumn(column);
  }

  isCountColumn(column: TaskSummaryColumnKey): boolean {
    return this._tasksIndexService.isCountColumn(column);
  }

  isActionsColumn(column: TaskSummaryColumnKey): boolean {
    return this._tasksIndexService.isActionsColumn(column);
  }

  extractData(element: TaskSummary, column: TaskSummaryColumnKey): any {
    if (column.startsWith('options.')) {
      const optionColumn = column.replace('options.', '') as keyof TaskOptions;
      const options = element['options'] as TaskOptions | undefined;

      if (!options) {
        return null;
      }

      return options[optionColumn];
    }

    return element[column as keyof TaskSummary];
  }

  // TODO: move to a service for date and time
  columnToDate(element: Timestamp | undefined): Date | null {
    if (!element) {
      return null;
    }

    return element.toDate();
  }

  statusToLabel(status: TaskStatus ): string {
    return this._tasksStatusesService.statusToLabel(status);
  }

  getIcon(name: Page): string {
    return this._iconsService.getPageIcon(name);
  }

  onRefresh() {
    this.refresh.next();
  }

  onIntervalValueChange(value: number) {
    this.intervalValue = value;

    if (value === 0) {
      this.stopInterval.next();
    } else {
      this.interval.next(value);
      this.refresh.next();
    }

    this._tasksIndexService.saveIntervalValue(value);
  }

  onColumnsChange(data: TaskSummaryColumnKey[]) {
    this.displayedColumns = [...data];

    this._tasksIndexService.saveColumns(data);
  }

  onColumnsReset() {
    this.displayedColumns = this._tasksIndexService.resetColumns();
  }

  onFiltersChange(filters: unknown[]) {
    this.filters = filters as TaskSummaryFilter[];

    this._tasksIndexService.saveFilters(filters as TaskSummaryFilter[]);
    this.refresh.next();
  }

  onFiltersReset() {
    this.filters = this._tasksIndexService.resetFilters();
    this.refresh.next();
  }

  autoRefreshTooltip() {
    return this._autoRefreshService.autoRefreshTooltip(this.intervalValue);
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);

    this._tasksIndexService.saveColumns(this.displayedColumns);
  }

  onCopiedTaskId() {
    this.#notificationService.success('Task ID copied to clipboard');
  }

  onCancel(taskIds: string[]) {
    this._tasksGrpcService.cancel$(taskIds).subscribe(
      () => this.refresh.next(),
    );
  }

  handleAutoRefreshStart() {
    if (this.intervalValue === 0) {
      this.stopInterval.next();
    } else {
      this.interval.next(this.intervalValue);
    }
  }
}
