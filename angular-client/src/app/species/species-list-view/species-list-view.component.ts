import { Component, OnInit } from '@angular/core';
import { SpeciesService } from '../species.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-species-list-view',
  templateUrl: './species-list-view.component.html'
})
export class SpeciesListViewComponent implements OnInit {
  speciesList: any;

  constructor(private speciesService: SpeciesService, private router: Router) {}

  ngOnInit() {
    this.speciesService.getSpeciesList().subscribe(
      response => {
        this.speciesList = response;
      },
      _ => {
        this.router.navigate(['/']);
      }
    );
  }
}
