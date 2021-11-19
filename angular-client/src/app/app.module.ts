import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AlertModule } from 'ngx-bootstrap/alert';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { appRoutingProviders, routing } from './app.routes';

import { AppComponent } from './app.component';
import { LoginCallbackComponent } from './login-callback/login-callback.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SpeciesListViewComponent } from './species/species-list-view/species-list-view.component';
import { TokenAuthInterceptor } from './authentication/token-auth-interceptor';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { GlobalErrorHandler } from './services/global-error-handler';
import { ConfigurationService } from './services/configuration.service';
import { PeopleSearchComponent } from './people/people-search/people-search.component';
import { PeopleViewComponent } from './people/people-view/people-view.component';
import { ModalComponent } from './modal/modal.component';
import { EditPersonComponent } from './people/edit-person/edit-person.component';
import { Data } from './services/data';
import { FooterComponent } from './footer/footer.component';
import { SharedModule } from './common/shared-common-module';
import { ResetPasswordComponent } from './people/reset-password/reset-password.component';
import { ExportModalComponent } from './view-data/export-modal/export-modal.component';
import { ViewDataModule } from './view-data/view-data.module';
import { SightingsNavComponent } from './nav-bar/sightings-nav/sightings-nav.component';
import { ContactUsComponent } from './footer/contact-us/contact-us.component';
import { PersonBadgeComponent } from './nav-bar/person-badge/person-badge.component';
import { BandingNavComponent } from './nav-bar/banding-nav/banding-nav.component';
import { SightingsModule } from './sightings/sightings.module';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ProjectsModule } from './projects/projects.module';
import { PreviousRouteService } from './services/previous-route.service';
import { ManageStockModule } from './manage-stock/manage-stock.module';
import { DataUploadsModule } from './data-uploads/data-uploads.module';
import { LandingComponent } from './landing/landing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ContentEditorComponent } from './content/content-editor/content-editor.component';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { ContentViewComponent } from './content/content-view/content-view.component';
import { ContentCardComponent } from './content/content-card/content-card.component';
import { SubHeadingPanelComponent } from './landing/sub-heading-panel/sub-heading-panel.component';
import { AttachmentUploadComponent } from './content/content-editor/attachment-upload/attachment-upload.component';
import { MessageDialogComponent } from './common/message-dialog/message-dialog.component';
import { FileUploadModule } from 'ng2-file-upload';
import { AttachmentListComponent } from './content/content-editor/attachment-list/attachment-list.component';
import { HelpComponent } from './help/help.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ElementsModule } from './elements/elements.module';

const appInitializerFn = (config: ConfigurationService) => {
  return () => {
    return config.load();
  };
};

@NgModule({
  declarations: [
    AppComponent,
    LoginCallbackComponent,
    PageNotFoundComponent,
    SpeciesListViewComponent,
    NavBarComponent,
    PeopleSearchComponent,
    PeopleViewComponent,
    ModalComponent,
    EditPersonComponent,
    FooterComponent,
    ResetPasswordComponent,
    ContactUsComponent,
    SightingsNavComponent,
    PersonBadgeComponent,
    BandingNavComponent,
    LandingComponent,
    DashboardComponent,
    ContentEditorComponent,
    ContentViewComponent,
    ContentCardComponent,
    SubHeadingPanelComponent,
    AttachmentUploadComponent,
    MessageDialogComponent,
    AttachmentListComponent,
    HelpComponent
  ],
  imports: [
    SharedModule,
    ViewDataModule,
    SightingsModule,
    ProjectsModule,
    ManageStockModule,
    DataUploadsModule,
    ElementsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FileUploadModule,
    FormsModule,
    ReactiveFormsModule,
    EditorModule,
    TypeaheadModule.forRoot(),
    CarouselModule.forRoot(),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AlertModule.forRoot(),
    PopoverModule.forRoot(),
    BsDropdownModule.forRoot(),
    AngularSvgIconModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    TimepickerModule.forRoot(),
    routing
  ],
  providers: [
    ...appRoutingProviders,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [ConfigurationService, PreviousRouteService]
    },
    { provide: HTTP_INTERCEPTORS, useClass: TokenAuthInterceptor, multi: true },
    { provide: ErrorHandler, useClass: GlobalErrorHandler, deps: [ConfigurationService] },
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
    Data
  ],
  entryComponents: [LoginCallbackComponent, ModalComponent, EditPersonComponent, ResetPasswordComponent, ExportModalComponent],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
