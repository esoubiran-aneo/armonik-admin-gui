import { NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, Input, OnDestroy, inject } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { TasksStatusesService } from '@app/tasks/services/task-status.service';
import { SpinnerComponent } from '@components/spinner.component';
import { SessionsGrpcService } from '../services/sessions-grpc.service';
import { StatusCount } from '../types';

// TODO:Create a generic component for this (with applications-count-tasks-by-status.component.ts) (and remowork in order to have links, colors and value for empty response)
@Component({
  selector: 'app-sessions-count-by-status',
  template: `
<ng-container *ngIf="statusCount; else noStatus">
  <ng-container *ngFor="let status of statusCount; let index = index">
    <span [matTooltip]="countTooltip(status)">
      <span>
        {{ status.count }}
      </span>
      <span *ngIf="index < statusCount.length - 1">/ </span>
    </span>
  </ng-container>
</ng-container>

<ng-container *ngIf="loading">
  <app-spinner></app-spinner>
</ng-container>

<ng-template #noStatus>
  <em *ngIf="!loading" i18n>No tasks</em>
</ng-template>
  `,
  styles: [`
  `],
  standalone: true,
  providers: [
    TasksStatusesService,
  ],
  imports: [
    NgIf,
    NgFor,
    SpinnerComponent,
    MatTooltipModule,
  ]
})
export class CountByStatusComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) sessionId: string;

  statusCount: StatusCount[] | null = null;
  loading = true;

  #sessionGrpcService = inject(SessionsGrpcService);
  #tasksStatusesService = inject(TasksStatusesService);

  subscriptions = new Subscription();

  ngAfterViewInit(): void {
    const subscription = this.#sessionGrpcService.countTasksByStatus$(this.sessionId)
      .subscribe((response) => {
        this.loading = false;
        this.statusCount = response.status ?? null;
      });

    this.subscriptions.add(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  countTooltip(status: StatusCount): string {
    const statusLabel = this.#tasksStatusesService.statusToLabel(status.status);

    if (status.count === 1) {
      return $localize`Task with status '${statusLabel}'`;
    }

    return $localize`Tasks with status '${statusLabel}'`;
  }
}