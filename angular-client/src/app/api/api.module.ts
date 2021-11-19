import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';

import { BandersService } from './api/banders.service';
import { BirdsService } from './api/birds.service';
import { CharacteristicsService } from './api/characteristics.service';
import { EventsService } from './api/events.service';
import { MarksService } from './api/marks.service';
import { ProjectsService } from './api/projects.service';
import { SpeciesService } from './api/species.service';
import { SpeciesGroupsService } from './api/speciesGroups.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class ApiModule {
  public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders {
    return {
      ngModule: ApiModule,
      providers: [{ provide: Configuration, useFactory: configurationFactory }]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: ApiModule, @Optional() http: HttpClient) {
    if (parentModule) {
      throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error(
        'You need to import the HttpClientModule in your AppModule! \n' + 'See also https://github.com/angular/angular/issues/20575'
      );
    }
  }
}
