import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sightings-nav',
  templateUrl: './sightings-nav.component.html',
  styleUrls: ['./sightings-nav.component.scss']
})
export class SightingsNavComponent implements OnInit {
  constructor() {}

  @Input()
  loginUrl: string;

  ngOnInit() {}
}
