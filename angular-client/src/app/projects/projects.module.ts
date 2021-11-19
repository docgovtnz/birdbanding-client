import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsHomeComponent } from './projects-home/projects-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectsComponent } from './projects.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CreateUpdateProjectComponent } from './create-update-project/create-update-project.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AddProjectMemberComponent } from './add-project-member/add-project-member.component';
import { BandingCertificateComponent } from './banding-certificate/banding-certificate.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { SharedModule } from '../common/shared-common-module';

@NgModule({
  declarations: [
    ProjectsHomeComponent,
    ProjectDetailsComponent,
    ProjectsComponent,
    CreateUpdateProjectComponent,
    AddProjectMemberComponent,
    BandingCertificateComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ProjectsRoutingModule,
    TypeaheadModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AlertModule.forRoot(),
    ModalModule.forRoot(),
    PopoverModule.forRoot(),
    SharedModule
  ],
  entryComponents: [AddProjectMemberComponent]
})
export class ProjectsModule {}
