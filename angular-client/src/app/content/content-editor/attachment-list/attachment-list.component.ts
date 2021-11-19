import { Component, Input, OnInit } from '@angular/core';
import { AttachmentEntity, AttachmentService } from '../attachment-upload/attachment.service';
import { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.scss']
})
export class AttachmentListComponent implements OnInit {

  attachmentList: AttachmentEntity[];

  @Input()
  editorComponent: EditorComponent;

  constructor(private attachmentService: AttachmentService) {}

  ngOnInit(): void {
    this.loadAttachments();
  }

  loadAttachments() {
    this.attachmentService.findAll().subscribe(attachmentList => {
      this.attachmentList = attachmentList;
      this.attachmentList.sort((a: AttachmentEntity, b: AttachmentEntity) =>  a.fileName.localeCompare(b.fileName) );
    });
  }

  stripPath(objectPath: string) {
    const lastSlash = objectPath.lastIndexOf('/');
    return lastSlash ? objectPath.substring(lastSlash + 1) : objectPath;
  }

  onInsertLinkAction(attachment: AttachmentEntity) {
    this.editorComponent.editor.execCommand('mceInsertLink', false, attachment.attachment_permalink);
  }

  onDeleteAttachment(attachment: AttachmentEntity) {
    this.attachmentService.deleteAttachment(attachment.id).subscribe( () => {
      console.log('Attachment deleted: ' + attachment.id);
      this.loadAttachments();
    });
  }

  onInsertImageAction(attachment: AttachmentEntity) {
    this.editorComponent.editor.execCommand('mceInsertContent', false, '<img src="' + attachment.attachment_permalink + '">');
  }
}
