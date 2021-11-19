import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BirdComponent } from './bird/bird.component';
import { ViewDataComponent } from './view-data.component';
import { ExportModalComponent } from './export-modal/export-modal.component';
import { ViewExportsComponent } from './view-exports/view-exports.component';
import { ViewHomeComponent } from './view-home/view-home.component';
import { ViewDataRoutingModule } from './view-data-routing.module';
import { SearchDataComponent } from './search-data/search-data.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { SharedModule } from '../common/shared-common-module';
import { ViewEventComponent } from './view-event/view-event.component';
import { AlertModule } from 'ngx-bootstrap/alert';
import { DuplicateModalComponent } from './duplicate-modal/duplicate-modal.component';
import { EventDataTableComponent } from './view-home/event-data-table/event-data-table.component';
import { EventDataMapComponent } from './view-home/event-data-map/event-data-map.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SearchLandingComponent } from './search-landing/search-landing.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { AdvancedSearchComponent } from './advanced-search/advanced-search.component';
import { MarkSearchComponent } from './mark-search/mark-search.component';
import { ConfirmDeleteComponent } from './confirm-delete/confirm-delete.component';
import { CoordinateSearchComponent } from './coordinate-search/coordinate-search.component';
import { EventProjectModalComponent } from './event-project-modal/event-project-modal.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ViewDataRoutingModule,
    AngularSvgIconModule,
    ButtonsModule.forRoot(),
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TypeaheadModule.forRoot(),
    AlertModule,
    ReactiveFormsModule,
    TabsModule
  ],
  declarations: [
    BirdComponent,
    ViewDataComponent,
    ExportModalComponent,
    ViewExportsComponent,
    ViewHomeComponent,
    SearchDataComponent,
    ViewEventComponent,
    DuplicateModalComponent,
    EventDataTableComponent,
    EventDataMapComponent,
    SearchLandingComponent,
    AdvancedSearchComponent,
    MarkSearchComponent,
    ConfirmDeleteComponent,
    CoordinateSearchComponent,
    EventProjectModalComponent
  ],
  entryComponents: [ExportModalComponent, DuplicateModalComponent]
})
export class ViewDataModule {}
