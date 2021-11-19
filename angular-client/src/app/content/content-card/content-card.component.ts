import { Component, Input, OnInit } from '@angular/core';
import { ContentData, ContentService } from '../content-editor/content.service';
import { Router } from '@angular/router';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';

@Component({
  selector: 'app-content-card',
  templateUrl: './content-card.component.html',
  styleUrls: ['./content-card.component.scss']
})
export class ContentCardComponent implements OnInit {
  @Input()
  name: string;

  content: ContentData;

  person: PersonIdentity;

  constructor(private contentService: ContentService, private authenticationService: AuthenticationService, private router: Router) {}

  ngOnInit(): void {
    if (this.name) {
      this.contentService.get(this.name).subscribe(content => (this.content = content));
    }

    this.authenticationService.identitySubject.subscribe(identity => {
      this.person = identity;
    });
  }

  showContent() {
    let showContent = false;
    if (this.content) {
      if (!this.content.link_label || this.content.link_label.length === 0 || this.content.link_label === 'Label') {
        showContent = this.isAdmin();
      } else {
        showContent = true;
      }
    }
    return showContent;
  }

  isAdmin() {
    return this.person && this.person.isAdmin;
  }

  onEdit() {
    this.router.navigate([`/content/${this.content.name}`]);
  }
}
