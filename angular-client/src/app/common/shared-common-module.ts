import { NgModule } from '@angular/core';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { TypeaheadMultiSelectComponent } from './typeahead-multi-select/typeahead-multi-select.component';
import { FreeTextMultiSelectComponent } from './free-text-multi-select/free-text-multi-select.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BandingDescriptionComponent } from './banding-description/banding-description.component';
import { WrappedTypeaheadComponent } from './wrapped-typeahead/wrapped-typeahead.component';
import { WrappedTypeaheadNgModelComponent } from './wrapped-typeahead/wrapped-typeahead-ngmodel.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { TruncatePipe } from './truncate-pipe/truncate-pipe';
import { LoadingButtonComponent } from './loading-button/loading-button.component';
import { MapPickerComponent } from './map-picker/map-picker.component';
import { MapComponent } from './map/map.component';
import { MapModalComponent } from './map-modal/map-modal.component';

import { RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
  imports: [
    CommonModule,
    TypeaheadModule.forRoot(),
    FormsModule,
    TooltipModule.forRoot(),
    ReactiveFormsModule,
    RouterModule,
    AngularSvgIconModule
  ],
  declarations: [
    MultiSelectComponent,
    TypeaheadMultiSelectComponent,
    FreeTextMultiSelectComponent,
    BandingDescriptionComponent,
    WrappedTypeaheadComponent,
    WrappedTypeaheadNgModelComponent,
    LoadingSpinnerComponent,
    TruncatePipe,
    LoadingButtonComponent,
    MapComponent,
    LoadingButtonComponent,
    MapPickerComponent,
    MapModalComponent
  ],
  exports: [
    MultiSelectComponent,
    TypeaheadMultiSelectComponent,
    FreeTextMultiSelectComponent,
    BandingDescriptionComponent,
    WrappedTypeaheadComponent,
    WrappedTypeaheadNgModelComponent,
    LoadingSpinnerComponent,
    TruncatePipe,
    LoadingButtonComponent,
    MapComponent,
    MapPickerComponent
  ],
  bootstrap: [MapModalComponent]
})
export class SharedModule {}
