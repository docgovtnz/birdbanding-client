import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentData, ContentService } from './content.service';
import { FormGroup } from '@angular/forms';
import { AttachmentListComponent } from './attachment-list/attachment-list.component';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss']
})
export class ContentEditorComponent implements OnInit {
  tinyMceSettings = {
    height: 500,
    menubar: false,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar:
      'undo redo | formatselect | bold italic backcolor | ' +
      'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link | removeformat | help'
  };

  content: ContentData;

  editForm: FormGroup;
  submitted = false;
  submitting = false;

  @ViewChild('attachmentListComponent')
  attachmentListComponent: AttachmentListComponent;

  constructor(private route: ActivatedRoute, private router: Router, private contentService: ContentService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const name = params.name;
      if (name) {
        this.contentService.get(name).subscribe(content => (this.content = content));
      }
    });
  }

  onUpdate() {
    this.contentService.update(this.content).subscribe(() => {
      this.onCancel();
    });
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  onFileUploaded() {
    this.attachmentListComponent.loadAttachments();
  }
}
