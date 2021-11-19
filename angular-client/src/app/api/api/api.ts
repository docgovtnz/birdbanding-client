export * from './banders.service';
import { BandersService } from './banders.service';
export * from './birds.service';
import { BirdsService } from './birds.service';
export * from './characteristics.service';
import { CharacteristicsService } from './characteristics.service';
export * from './events.service';
import { EventsService } from './events.service';
export * from './marks.service';
import { MarksService } from './marks.service';
export * from './projects.service';
import { ProjectsService } from './projects.service';
export * from './species.service';
import { SpeciesService } from './species.service';
export * from './speciesGroups.service';
import { SpeciesGroupsService } from './speciesGroups.service';
export const APIS = [
  BandersService,
  BirdsService,
  CharacteristicsService,
  EventsService,
  MarksService,
  ProjectsService,
  SpeciesService,
  SpeciesGroupsService
];
