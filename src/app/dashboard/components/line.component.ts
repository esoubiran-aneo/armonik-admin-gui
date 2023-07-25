import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from "@angular/core";
import { PageSectionComponent } from "../../components/page-section.component";
import { PageSectionHeaderComponent } from "../../components/page-section-header.component";
import { ActionsToolbarComponent } from "../../components/actions-toolbar.component";
import { RefreshButtonComponent } from "../../components/refresh-button.component";
import { SpinnerComponent } from "../../components/spinner.component";
import { ActionsToolbarGroupComponent } from "../../components/actions-toolbar-group.component";
import { AutoRefreshButtonComponent } from "../../components/auto-refresh-button.component";
import { FiltersToolbarComponent } from "../../components/filters-toolbar.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { StatusesGroupCardComponent } from "./statuses-group-card.component";
import { TasksGrpcService } from "@app/tasks/services/tasks-grpc.service";
import { TasksIndexService } from "@app/tasks/services/tasks-index.service";
import { TasksStatusesService } from "@app/tasks/services/tasks-status.service";
import { AutoRefreshService } from "@services/auto-refresh.service";
import { QueryParamsService } from "@services/query-params.service";
import { ShareUrlService } from "@services/share-url.service";
import { StorageService } from "@services/storage.service";
import { UtilsService } from "@services/utils.service";
import { DashboardIndexService } from "../services/dashboard-index.service";
import { DashboardStorageService } from "../services/dashboard-storage.service";
import { Line } from "../types";
import { Observable, Subject, Subscription, merge, startWith, switchMap, tap } from "rxjs";
import { Page } from "@app/types/pages";
import { StatusCount, TaskSummaryColumnKey } from "@app/tasks/types";
import { ManageGroupsDialogComponent } from "./manage-groups-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Filter } from "@app/types/filters";
import { NgForOf, NgIf } from "@angular/common";
import { IconsService } from "@services/icons.service";

@Component({
    selector: 'app-line',
    template: `      
        <app-page-section>
        <app-page-section-header icon="adjust">
            <span i18n="Section title">{{ line.name }}</span>
        </app-page-section-header>

        <mat-toolbar>
            <mat-toolbar-row>
                <app-actions-toolbar>
                    <app-actions-toolbar-group>
                    <app-refresh-button [tooltip]="autoRefreshTooltip()" (refreshChange)="onRefresh()"></app-refresh-button>
                    <app-spinner *ngIf="loadTasksStatus"></app-spinner>
                    </app-actions-toolbar-group>

                    <app-actions-toolbar-group>
                    <app-auto-refresh-button [intervalValue]="line.interval" (intervalValueChange)="onIntervalValueChange($event)"></app-auto-refresh-button>
                    <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Show more options">
                        <mat-icon aria-hidden="true" [fontIcon]="getIcon('more')"></mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                        <button mat-menu-item (click)="onToggleGroupsHeader()">
                        <mat-icon aria-hidden="true" [fontIcon]="line.hideGroupsHeader ? getIcon('view') : getIcon('view-off')"></mat-icon>
                        <span i18n>
                            Toggle Groups Header
                        </span>
                        </button>
                        <button mat-menu-item (click)="onManageGroupsDialog()">
                        <mat-icon aria-hidden="true" [fontIcon]="getIcon('tune')"></mat-icon>
                        <span i18n>
                            Manage Groups
                        </span>
                        </button>
                    </mat-menu>
                    </app-actions-toolbar-group>
                </app-actions-toolbar>
            </mat-toolbar-row>
            
            <mat-toolbar-row>
                <app-filters-toolbar [filters]="line.filters" [filtersFields]="availableFiltersFields" [columnsLabels]="columnsLabels()" (filtersChange)="onFiltersChange($event)"></app-filters-toolbar>
            </mat-toolbar-row>
        </mat-toolbar>

        <div class="groups">
            <app-statuses-group-card
            *ngFor="let group of line.taskStatusesGroups"
            [group]="group"
            [data]="data"
            [hideGroupHeaders]="line.hideGroupsHeader"
            ></app-statuses-group-card>
        </div>
        </app-page-section>
  `,
    styles: [`
       .groups {
          margin-top: 1rem;

          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: 1rem;
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
        TasksIndexService,
        TasksGrpcService, 
        ],
    imports: [
        PageSectionComponent,
        PageSectionHeaderComponent,
        ActionsToolbarComponent,
        RefreshButtonComponent,
        SpinnerComponent,
        ActionsToolbarGroupComponent,
        AutoRefreshButtonComponent,
        FiltersToolbarComponent,
        MatToolbarModule,
        MatIconModule,
        MatMenuModule,
        StatusesGroupCardComponent,
        NgIf,
        NgForOf
    ]
})
export class LineComponent implements OnInit, AfterViewInit,OnDestroy {
 
 @Input({ required: true }) line: Line;
 @Output() saveChange: EventEmitter<void> = new EventEmitter<void>();
 @Output() filtersChange: EventEmitter<Filter<any>[]> = new EventEmitter<Filter<any>[]>();
 @Output() toggleGroupsHeaderChange: EventEmitter<void> = new EventEmitter<void>();
 @Output() manageGroupsDialogChange: EventEmitter<void> = new EventEmitter<void>()


  _dialog = inject(MatDialog);
  #autoRefreshService = inject(AutoRefreshService);
  #iconsService = inject(IconsService)
  #taskGrpcService = inject(TasksGrpcService);
  #tasksIndexService = inject(TasksIndexService); 
  #dashboardIndexService = inject(DashboardIndexService); 
    
  loadTasksStatus: boolean; 
  total: number;
  data: StatusCount[] = [];
  availableFiltersFields: any[] = [];
  
  
  refresh: Subject<void> = new Subject<void>();
  stopInterval: Subject<void> = new Subject<void>();
  interval: Subject<number> = new Subject<number>();
  subscriptions: Subscription = new Subscription();
  interval$: Observable<number> = this.#autoRefreshService.createInterval(this.interval, this.stopInterval);

  ngOnInit(): void {
    this.loadTasksStatus = false; 
    this.availableFiltersFields = this.#dashboardIndexService.availableFiltersFields;                              
  }


  ngAfterViewInit() {
    const mergeSubscription = merge(this.refresh, this.interval$).pipe(
      startWith(0),
      tap(() => (this.loadTasksStatus = true)),
      switchMap(() => this.#taskGrpcService.countByStatu$()),
    ).subscribe((data) => {
      if (!data.status) {
        return;
      }

      this.data = data.status;
      this.total = data.status.reduce((acc, curr) => acc + curr.count, 0);

      this.loadTasksStatus = false;
    });

    this.subscriptions.add(mergeSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getIcon(name: string): string {
    return this.#iconsService.getIcon(name);
  }

  getPageIcon(name: Page): string {
    return this.#iconsService.getPageIcon(name);
  }

  autoRefreshTooltip(): string {
    return this.#autoRefreshService.autoRefreshTooltip(this.line.interval);
  }

  columnsLabels(): Record<TaskSummaryColumnKey, string> {
    return this.#tasksIndexService.columnsLabels;
  }
  onRefresh() {
    this.refresh.next();
  }

  onIntervalValueChange( value: number) {
    this.line.interval = value;

    if(value === 0) {
        this.stopInterval.next();
      } else {
        this.interval.next(value);
        this.refresh.next();
      }

      this.saveChange.emit()

  }

  onToggleGroupsHeader() {
      this.line.hideGroupsHeader = !this.line.hideGroupsHeader; 
      this.toggleGroupsHeaderChange.emit(); 
      
  }

  onManageGroupsDialog() {
    const dialogRef = this._dialog.open(ManageGroupsDialogComponent, {
      data: {
        groups: this.line.taskStatusesGroups,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.line.taskStatusesGroups = result;
      this.manageGroupsDialogChange.emit(); 
    });
  }

  onFiltersChange(value: unknown[]) {

    this.line.filters = value as [];
    this.filtersChange.emit()
    //this.paginator.pageIndex = 0;
    this.refresh.next();
  }
}