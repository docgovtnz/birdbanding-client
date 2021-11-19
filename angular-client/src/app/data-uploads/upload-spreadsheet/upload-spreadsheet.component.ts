import { Component, OnInit } from '@angular/core';
import { SpreadsheetListComponent } from '../spreadsheet-list/spreadsheet-list.component';
import { SpreadsheetUploadService } from '../services/spreadsheet-upload.service';
import { Message } from '../services/data-upload-types';
import { ProjectService } from '../../projects/services/project.service';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';

@Component({
  selector: 'app-upload-spreadsheet',
  templateUrl: './upload-spreadsheet.component.html',
  styleUrls: ['./upload-spreadsheet.component.scss']
})
export class UploadSpreadsheetComponent implements OnInit {

  dismissible: true;

  hasProjects = true;
  isAdmin = true;
  isLoading = true;

  onClosed(e) {}

  constructor(
    private spreadsheetUploadService: SpreadsheetUploadService,
    private projectService: ProjectService,
    private authService: AuthenticationService

  ) { }

  ngOnInit() {
    this.projectService.getProjectsForLoggedInIdentity().subscribe(s => {
      this.hasProjects = !!s.length;
    });

    this.authService.identitySubject.subscribe(ident => {
      this.isAdmin = ident.role === 'admin';
    });

    this.isLoading = false;

  }
}
