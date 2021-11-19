import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProjectsHomeComponent } from './projects-home/projects-home.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectsComponent } from './projects.component';
import { CreateUpdateProjectComponent } from './create-update-project/create-update-project.component';
import { AuthenticationGuard } from '../authentication/authentication.guard';

const projectsRoutes: Routes = [
  {
    path: 'projects',
    component: ProjectsComponent,
    children: [
      {
        path: '',
        component: ProjectsHomeComponent
      },
      {
        path: 'details/:projectId',
        component: ProjectDetailsComponent
      },
      {
        path: 'create',
        component: CreateUpdateProjectComponent,
        data: {
          isCreate: true
        }
      },
      {
        path: 'edit/:projectId',
        component: CreateUpdateProjectComponent,
        data: {
          isCreate: false
        }
      }
    ],
    canActivate: [AuthenticationGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(projectsRoutes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule {}
