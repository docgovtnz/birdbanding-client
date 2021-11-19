import { Component, OnInit } from '@angular/core';

import { ConfigurationService, Config } from '../services/configuration.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  readonly version: string;

  readonly env: string;

  constructor(confgigurationService: ConfigurationService) {
    const config: Config = confgigurationService.getConfig();
    this.version = config.buildVersion;
    this.env = config.buildEnv;
  }

  ngOnInit() {}
}
