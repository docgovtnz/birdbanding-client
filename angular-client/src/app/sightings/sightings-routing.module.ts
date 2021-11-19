import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { SightingsComponent } from './sightings.component';

const sightingsRoutes: Routes = [
  {
    path: 'sightings',
    component: SightingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(sightingsRoutes)],
  exports: [RouterModule]
})
export class SightingsRoutingModule {}
