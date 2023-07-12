
import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { AppShowComponent } from '@app/types/components';
import { ShowPageComponent } from '@components/show-page.component';
import { QueryParamsService } from '@services/query-params.service';
import { ShareUrlService } from '@services/share-url.service';
import { UtilsService } from '@services/utils.service';
import { TaskGrpcService } from './services/tasks-grpc.service';
import { TaskRaw } from '@aneoconsultingfr/armonik.api.angular';


@Component({
  selector: 'app-tasks-show',
  template: `
<app-show-page [id]="data?.sessionId ?? null" [data]="data" [sharableURL]="sharableURL">
  <mat-icon matListItemIcon aria-hidden="true" fontIcon="workspaces"></mat-icon>
  <span i18n="Page title"> Tasks </span>
</app-show-page>
  `,
  styles: [`
  `],
  standalone: true,
  providers: [
    UtilsService,
    ShareUrlService,
    QueryParamsService,
    TaskGrpcService,
  ],
  imports: [
    ShowPageComponent,
    MatIconModule,
  ]
})
export class ShowComponent implements AppShowComponent<TaskRaw>, OnInit, AfterViewInit {
  sharableURL = '';
  data: TaskRaw | null = null;

  #shareURLService = inject(ShareUrlService);


  constructor(
    private _route: ActivatedRoute,
    private _tasksGrpcService: TaskGrpcService,
  ) {}

  ngOnInit(): void {
    this.sharableURL = this.#shareURLService.generateSharableURL(null, null);
  }

  ngAfterViewInit(): void {
    this._route.params.pipe(
      map(params => params['id']),
      switchMap((id) => {
        return this._tasksGrpcService.get$(id);
      }),
      map((data) => {
        return data.task ?? null;
      })
    )
      .subscribe((data) => this.data = data);
  }
}
