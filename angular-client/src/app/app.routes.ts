import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { LoginCallbackComponent } from './login-callback/login-callback.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PeopleSearchComponent } from './people/people-search/people-search.component';
import { PeopleViewComponent } from './people/people-view/people-view.component';
import { ContactUsComponent } from './footer/contact-us/contact-us.component';
import { LandingComponent } from './landing/landing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ContentEditorComponent } from './content/content-editor/content-editor.component';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { AdminGuard } from './authentication/admin.guard';
import { HelpComponent } from './help/help.component';
import { MapComponent } from './common/map/map.component';
import { AppModule } from './app.module';

const appRoutes: Routes = [
  { path: 'login', component: LoginCallbackComponent },
  { path: 'contact', component: ContactUsComponent, canActivate: [AuthenticationGuard] },
  { path: 'content/:name', component: ContentEditorComponent, canActivate: [AuthenticationGuard, AdminGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthenticationGuard] },
  { path: 'map', component: MapComponent },
  { path: 'help', component: HelpComponent, canActivate: [AuthenticationGuard] },
  { path: 'people', component: PeopleSearchComponent, canActivate: [AuthenticationGuard, AdminGuard] },
  { path: 'people-view/:id', component: PeopleViewComponent, canActivate: [AuthenticationGuard] },
  { path: 'not-found', component: PageNotFoundComponent },

  { path: '', component: LandingComponent },
  { path: '**', component: PageNotFoundComponent },
];

export const appRoutingProviders = [];
export const routing: ModuleWithProviders<AppModule> = RouterModule.forRoot(appRoutes, { scrollPositionRestoration: 'enabled' });
