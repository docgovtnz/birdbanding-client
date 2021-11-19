import { Component, Input, OnInit } from '@angular/core';
import { ContentData, ContentService } from '../../content/content-editor/content.service';
import { Router } from '@angular/router';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';

@Component({
  selector: 'app-sub-heading-panel',
  templateUrl: './sub-heading-panel.component.html',
  styleUrls: ['./sub-heading-panel.component.scss']
})
export class SubHeadingPanelComponent implements OnInit {
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

  isAdmin() {
    return this.person && this.person.isAdmin;
  }

  onEdit() {
    this.router.navigate([`/content/${this.content.name}`]);
  }
}
