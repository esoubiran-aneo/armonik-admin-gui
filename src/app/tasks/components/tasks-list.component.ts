import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TaskGrpcService } from '../services/tasks-grpc.service';
import { UtilsService } from '@services/utils.service';
import { TaskSummary } from '@aneoconsultingfr/armonik.api.angular';

@Component({
  selector: 'app-tasks-list',
  template: `
   <h2> Essai Tasks List component </h2>
  `,
  styles: [`
  `],
  standalone: true,
  providers: [
    TaskGrpcService,
    UtilsService
  ],
})
export class TasksListComponent implements AfterViewInit, OnDestroy {

  taskList: TaskSummary[] | null = null;

  loading = true;

  #taskGrpcService = inject(TaskGrpcService);

  subscriptions = new Subscription();

  ngAfterViewInit(): void {
    const subscription = this.#taskGrpcService.list$( options, filters)
      .subscribe((response) => {
        this.loading = false;
        this.taskList = response.tasks ?? null;
      });

    this.subscriptions.add(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
