import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ManageStockComponent } from './manage-stock.component';
import { BandingStockComponent } from './banding-stock/banding-stock.component';
import { TransfersComponent } from './transfers/transfers.component';
import { BandComponent } from './band/band.component';
import { BanderStockComponent } from './bander-stock/bander-stock.component';
import { AuthenticationGuard } from '../authentication/authentication.guard';

const manageStockRoutes: Routes = [
  {
    path: 'manage-stock',
    component: ManageStockComponent,
    children: [
      {
        path: '',
        component: BandingStockComponent
      },
      {
        path: 'bander',
        component: BanderStockComponent
      },
      {
        path: 'transfers',
        component: TransfersComponent
      },
      {
        path: 'band/:prefixNumber/:shortNumber',
        component: BandComponent
      }
    ],
    canActivate: [AuthenticationGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(manageStockRoutes)],
  exports: [RouterModule]
})
export class ManageStockRoutingModule {}
