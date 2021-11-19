import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  constructor(private router: Router, private authenticationService: AuthenticationService) {}

  ngOnInit(): void {}

  logIn() {
    this.authenticationService.navigateToLogin();
  }
}
