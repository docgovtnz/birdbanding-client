import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../projects/services/project.service';
import { SpreadsheetUploadService } from '../services/spreadsheet-upload.service';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { format } from 'date-fns';
import { Project } from '../../projects/services/project-types';
import { ApiSpreadsheetRecord as SpreadsheetRecord, ApiSpreadsheetDetail as SpreadsheetDetail } from '../services/data-upload-types';

interface PresignedUrlResponse {
  presignedUrl: string;
}

enum ValidationStage {
  BEGIN,
  UPLOAD,
  UPLOAD_ERROR,
  LOADING,
  INCORRECT_FORMAT,
  SUCCESS
}

@Component({
  selector: 'app-spreadsheet-validator',
  templateUrl: './spreadsheet-validator.component.html',
  styleUrls: ['./spreadsheet-validator.component.scss']
})
export class SpreadsheetValidatorComponent implements OnInit {
  projects: Project[] = [];

  sheetValidatorState: ValidationStage = ValidationStage.BEGIN;

  err = null;

  uploadForm: FormGroup;

  uploader: FileUploader;

  fileOver = false;

  isNowValidFormat = true;
  submittedWithoutFile = false;
  submittedWrongFormat = false;

  stagedSheetDetail: SpreadsheetDetail;

  loggedInUser: PersonIdentity;
  loadedAuth = false;

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder,
    private uploadService: SpreadsheetUploadService,
    private auth: AuthenticationService
  ) {}

  ngOnInit() {
    this.projectService.getProjectsForLoggedInIdentity().subscribe(projects => (this.projects = projects));
    this.uploadForm = this.fb.group({
      project: [null, Validators.required]
    });

    this.auth.identitySubject.subscribe(ident => {
      this.loggedInUser = ident;
      this.loadedAuth = true;
    });

    this.uploader = new FileUploader({
      url: '',
      allowedFileType: ['xlsx', 'xls'],
      allowedMimeType: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      disableMultipart: true // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
    });

    this.uploader.onWhenAddingFileFailed = (item) => {
      this.isNowValidFormat = false;
      this.submittedWrongFormat = true;
    };
  }

  get projectControl() {
    return this.uploadForm.get('project');
  }

  get showLink(){
    console.log('state: ' + !this.uploadService.isTransitoryState(this.stagedSheetDetail) + '--' + this.stagedSheetDetail.upload_status);
    return this.stagedSheetDetail?.id && !this.uploadService.isTransitoryState(this.stagedSheetDetail);
  }

  fileIsOver(isOver: boolean) {
    this.fileOver = isOver;
  }

  async fileInTheHole() {
    this.sheetValidatorState = ValidationStage.LOADING;
    const ssRecord: SpreadsheetRecord = {
      project_id: this.projectControl.value.id,
      bander_id: this.loggedInUser.userId,
      file_size_in_bytes: this.uploader.queue[0].file.size,
      object_path: this.generateFileName(),
      upload_status: 'PENDING_RESULT'
    };

    const resp: PresignedUrlResponse = await this.uploadService.getPresignedUrl(ssRecord);
    console.log('resp');
    console.dir(resp);
    const item = this.uploader.queue[0];
    item.url = resp.presignedUrl;
    item.method = 'PUT';
    item.upload();

    item.onError = e => {
      this.sheetValidatorState = ValidationStage.UPLOAD_ERROR;
      this.err = e;
    };

    item.onSuccess = async () => {
      try {
        const ssDetail: SpreadsheetDetail = await this.uploadService.postSSData(ssRecord);
        let sheetAdded = false;
        const subscr = this.uploadService.spreadsheetStatusChange.subscribe((result: [SpreadsheetDetail, SpreadsheetDetail]) => {
          this.stagedSheetDetail = result[1];
          const newStatus = result[1].upload_status;
          if (newStatus === 'PASS_FILE_FORMAT') {
            sheetAdded = true;
            this.uploadService.addNewSpreadsheet(ssDetail);
            // listen for validation pass/warnings/critical
            this.uploadService.pollForStatusChange(result[1], 20_000, 500);
          }
          else if (newStatus === 'CRITICAL_FILE_FORMAT') {
            subscr.unsubscribe();
            this.sheetValidatorState = ValidationStage.INCORRECT_FORMAT;
          }
          else if (newStatus === 'PROCESS_ERROR') {
            subscr.unsubscribe();
            this.sheetValidatorState = ValidationStage.UPLOAD_ERROR;
            if (!sheetAdded){
              this.uploadService.addNewSpreadsheet(ssDetail);
            }
          // in case validation occurs before the polling has a chance to observe PASS_FILE_FORMAT
          }
          else if (['PASS', 'WARNINGS', 'WARNINGS_AND_CRITICALS', 'CRITICALS'].includes(newStatus)){
            subscr.unsubscribe();
            if (!sheetAdded){
              this.uploadService.addNewSpreadsheet(ssDetail);
            }
            this.uploadService.spreadsheetStatusChange.emit(result);
            this.sheetValidatorState = ValidationStage.SUCCESS;
          }
        });

        this.uploadService.pollForStatusChange(ssDetail, 300000, 4000);

      } catch (e) {
        this.sheetValidatorState = ValidationStage.UPLOAD_ERROR;
        this.err = e;
      }
    };
  }

  uploadFile() {
    this.submittedWithoutFile = !this.uploader.queue.length;
    if (this.uploadForm.invalid || this.submittedWithoutFile) {
      this.uploadForm.markAllAsTouched();
    } else {
      this.fileInTheHole();
    }
  }

  private generateFileName(): string {
    const formattedDate = format(new Date(), 'yyyy-MM-dd:hh:mm:ss');
    const userName = this.loggedInUser.name;
    const projectName = this.projectControl.value.name.replace(/\s/g, '');
    return `${projectName}-${userName}@${formattedDate}.xlsx`;
  }

  cancelUpload() {
    this.sheetValidatorState = ValidationStage.BEGIN;
  }

  tryAgain() {
    this.uploader.clearQueue();
    this.sheetValidatorState = ValidationStage.UPLOAD;
  }

  get isFileFormatError(){
    return this.stagedSheetDetail?.errors?.[0].code === 6005;
  }

  getErrorMessage(): string {
    if (this.stagedSheetDetail) {
      return this.stagedSheetDetail.errors.map(s => s.message).join('. ');
    }
    else {
      return '';
    }
  }

  onSelected(e) {
    if (this.isNowValidFormat) {
      this.submittedWrongFormat = false;
    }
    this.isNowValidFormat = true;
    this.submittedWithoutFile = false;
  }

}
