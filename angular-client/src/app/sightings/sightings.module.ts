import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../common/shared-common-module';
import { SightingsComponent } from './sightings.component';
import { SightingsRoutingModule } from './sightings-routing.module';
import { BirdDetailsComponent } from './bird-details/bird-details.component';
import { BirdLocationComponent } from './bird-location/bird-location.component';
import { MarkingDetailsComponent } from './marking-details/marking-details.component';
import { YourDetailsComponent } from './your-details/your-details.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { SuccessComponent } from './success/success.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    SightingsRoutingModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    TypeaheadModule.forRoot()
  ],
  declarations: [
    SightingsComponent,
    BirdDetailsComponent,
    BirdLocationComponent,
    MarkingDetailsComponent,
    YourDetailsComponent,
    SuccessComponent
  ]
})
export class SightingsModule {}
