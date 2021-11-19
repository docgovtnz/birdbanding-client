import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from '../../../services/configuration.service';
import { Observable } from 'rxjs';
import {FileItem} from 'ng2-file-upload';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private baseUrl: string;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient, config: ConfigurationService) {
    this.baseUrl = config.getConfig().apiUrl;
  }

  findAll(): Observable<AttachmentEntity[]> {
    return this.http.get<AttachmentEntity[]>(`${this.baseUrl}/cms-attachments`, this.httpOptions);
  }

  requestPresignedURL(file: string) {
    const request = {
      fileName: file,
      context: 'test'
    };

    return this.http.post(`${this.baseUrl}/cms-attachments?presignedUrl=true`, request, this.httpOptions);
  }

  postFileUploaded(file: string) {
    const request = {
      fileName: file,
      context: 'test'
    };

    return this.http.post(`${this.baseUrl}/cms-attachments?presignedUrl=false`, request, this.httpOptions);
  }

  deleteAttachment(attachmentId: number) {
    return this.http.delete(`${this.baseUrl}/cms-attachments/${attachmentId}`, this.httpOptions);
  }

}

/* tslint:disable */
export class AttachmentEntity {
  id: number;
  storage_host: string;
  object_path: string;
  fileName: string;
  context: string;
  attachment_permalink: string;

  row_creation_timestamp_: string;
  row_creation_user_: string;
  row_update_timestamp_: string;
  row_update_user_: string;
}
/* tslint:enable */
