import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FileItem, FileUploader, ParsedResponseHeaders} from 'ng2-file-upload';
import {AttachmentEntity, AttachmentService} from './attachment.service';
import {MessageDialogComponent} from '../../../common/message-dialog/message-dialog.component';

@Component({
  selector: 'app-attachment-upload',
  templateUrl: './attachment-upload.component.html',
  styleUrls: ['attachment-upload.component.scss']
})
export class AttachmentUploadComponent implements OnInit {
  @Output()
  fileUploadEvent = new EventEmitter();

  @Input()
  context: string;

  uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  hasAnotherDropZoneOver: boolean;
  response: string;

  @ViewChild('messageDialogComponent')
  messageDialogComponent: MessageDialogComponent;

/*  confirmUploadActionMessage: ActionMessage = {
    title: 'Confirm Upload',
    messageText: 'To be replaced by a detailed message below',
    actionButtons: [
      { label: 'Yes', styleClasses: ['btn-warning'] },
      { label: 'No', styleClasses: ['btn-secondary'] }
    ]
  };

  confirmDeleteActionMessage: ActionMessage = {
    title: 'Delete Attachment',
    messageText: 'Are you sure you want to delete this attachment?',
    actionButtons: [
      { label: 'Yes', styleClasses: ['btn-danger'] },
      { label: 'No', styleClasses: ['btn-secondary'] }
    ]
  };*/

  constructor(private attachmentService: AttachmentService) {}

  ngOnInit(): void {
    this.uploader = new FileUploader({ disableMultipart: true });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

    this.response = '';

    this.uploader.response.subscribe(res => (this.response = res));

    this.uploader.onSuccessItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      console.log('Got success item: ' + status);
      this.attachmentService.postFileUploaded(item.file.name).subscribe((r2: any) => {
        console.log('Posted file uploaded to database: ' + JSON.stringify(r2));
        this.fileUploadEvent.next('FileUploaded');
      });
    };
  }


  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  uploadAction(item: FileItem) {
    this.attachmentService.requestPresignedURL(item.file.name).subscribe((response: any) => {
      item.method = 'PUT';
      item.url = response.presignedUrl;
      item.upload();
    });
  }


/*  uploadActionConfirmed(actionResult: ActionResult) {
    if (actionResult.actionLabel === 'Yes') {
      const item: FileItem = actionResult.payload;
      item.upload();
    }
  }*/
}
