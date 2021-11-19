import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DataUploadsComponent } from './data-uploads.component';
import { AddEditRecordComponent } from './add-record/add-edit-record.component';
import { UploadSpreadsheetComponent } from './upload-spreadsheet/upload-spreadsheet.component';
import { SpreadsheetDetailComponent } from './spreadsheet-detail/spreadsheet-detail.component';
import { AuthenticationGuard } from '../authentication/authentication.guard';

const viewDataRoutes: Routes = [
  {
    path: 'data-uploads',
    component: DataUploadsComponent,
    children: [
      {
        path: '',
        component: AddEditRecordComponent,
        data: {
          type: 'ADD',
          isAdd: true
        }
      },
      {
        path: 'upload-spreadsheet',
        component: UploadSpreadsheetComponent
      },
      {
        path: 'spreadsheet-detail/:spreadsheetId',
        component: SpreadsheetDetailComponent
      },
      {
        path: 'edit-record/:eventId',
        component: AddEditRecordComponent,
        data: {
          type: 'EDIT',
          isAdd: false
        }
      },
      {
        path: 'duplicate-record/:eventId',
        component: AddEditRecordComponent,
        data: {
          type: 'DUPLICATE',
          isAdd: true
        }
      }
    ],
    canActivate: [AuthenticationGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(viewDataRoutes)],
  exports: [RouterModule]
})
export class DataUploadsRoutingModule {}
