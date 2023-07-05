import { Route } from '@angular/router';
import { IndexComponent } from './index.component';
import { ShowComponent } from './show.component';

export const TASKS_ROUTES: Route[] = [
  { path: '', component: IndexComponent },
  { path: ':id', component: ShowComponent },
];
