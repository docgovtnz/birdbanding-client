import { Component, OnInit } from '@angular/core';
import { AuthenticationService, PersonIdentity } from '../authentication/authentication.service';

@Component({
  selector: 'app-manage-stock',
  templateUrl: './manage-stock.component.html',
  styleUrls: ['./manage-stock.component.scss']
})
export class ManageStockComponent implements OnInit {
  person: PersonIdentity;

  constructor(private auth: AuthenticationService) {}

  ngOnInit() {
    this.auth.identitySubject.subscribe(pi => {
      this.person = pi;
    });
  }
}
