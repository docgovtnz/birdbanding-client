import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModule } from 'ngx-bootstrap/alert';
import { DataUploadsComponent } from './data-uploads.component';
import { DataUploadsRoutingModule } from './data-uploads-routing.module';
import { AddEditRecordComponent } from './add-record/add-edit-record.component';
import { UploadSpreadsheetComponent } from './upload-spreadsheet/upload-spreadsheet.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BandingEventComponent } from './banding-event/banding-event.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { MarkingConfigurationsComponent } from './marking-configurations/marking-configurations.component';
import { SharedModule } from '../common/shared-common-module';
import { BirdDetailsComponent } from './bird-details/bird-details.component';
import { AdditionalFieldsComponent } from './additional-fields/additional-fields.component';
import { PeopleComponent } from './people/people.component';
import { LocationComponent } from './location/location.component';
import { SpreadsheetValidatorComponent } from './spreadsheet-validator/spreadsheet-validator.component';
import { FileUploadModule } from 'ng2-file-upload';
import { SpreadsheetListComponent } from './spreadsheet-list/spreadsheet-list.component';
import { SpreadsheetDetailComponent } from './spreadsheet-detail/spreadsheet-detail.component';
import { StatusDetailsComponent } from './status-details/status-details.component';

@NgModule({
  declarations: [
    DataUploadsComponent,
    AddEditRecordComponent,
    UploadSpreadsheetComponent,
    BandingEventComponent,
    MarkingConfigurationsComponent,
    BirdDetailsComponent,
    AdditionalFieldsComponent,
    PeopleComponent,
    LocationComponent,
    SpreadsheetValidatorComponent,
    SpreadsheetListComponent,
    SpreadsheetDetailComponent,
    StatusDetailsComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataUploadsRoutingModule,
    BsDatepickerModule,
    TypeaheadModule,
    TooltipModule,
    FileUploadModule,
    AlertModule.forRoot()
  ],
  bootstrap: []
})
export class DataUploadsModule {}
