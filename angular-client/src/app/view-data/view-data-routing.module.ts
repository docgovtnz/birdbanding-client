import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ViewDataComponent } from './view-data.component';
import { ViewHomeComponent } from './view-home/view-home.component';
import { BirdComponent } from './bird/bird.component';
import { ViewExportsComponent } from './view-exports/view-exports.component';
import { ViewEventComponent } from './view-event/view-event.component';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { EventDataMapComponent } from './view-home/event-data-map/event-data-map.component';

const viewDataRoutes: Routes = [
  {
    path: 'view-data',
    component: ViewDataComponent,
    children: [
      {
        path: '',
        component: ViewHomeComponent
      },
      {
        path: 'bird/:birdId',
        component: BirdComponent
      },
      {
        path: 'view-exports',
        component: ViewExportsComponent
      },
      {
        path: 'event/:eventId',
        component: ViewEventComponent
      },
      {
        path: 'map',
        component: EventDataMapComponent
      }
    ],
    canActivate: [AuthenticationGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(viewDataRoutes)],
  exports: [RouterModule]
})
export class ViewDataRoutingModule {}
