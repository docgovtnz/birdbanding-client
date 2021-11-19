import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BirdService } from './bird.service';
import { ConfigurationService, Config } from '../../services/configuration.service';

describe('BirdService', () => {
  const apiUrl = 'http://api.test.com';

  beforeEach(() => {
    const testConfig = new Config();
    testConfig.apiUrl = apiUrl;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            getConfig: () => testConfig
          }
        }
      ]
    });
  });

  it('should be created', () => {
    const service: BirdService = TestBed.inject(BirdService);
    expect(service).toBeTruthy();
  });
  it('should be configured with the correct uri', () => {
    const service: BirdService = TestBed.inject(BirdService);
    expect(service.baseUri).toEqual(apiUrl);
  });

  it('converts Api Bird response into domain bird entity', () => {
    // const convertedBird = apiBirdToBird(testBird);
  });
});

const testBird = {
  bird: {
    friendly_name: null,
    id: '71e4d90f-1d53-41f4-8c6e-e88462b69aeb',
    row_creation_idx: 72579,
    row_creation_timestamp_: '2020-02-04T04:18:32.000Z',
    row_creation_user_: 'master',
    row_update_timestamp_: '2020-02-14T10:33:04.000Z',
    row_update_user_: 'master',
    species_id: '430'
  },
  species: {
    authors: 'scopoli',
    bio_status: 'indigenous|present|wild|new zealand|political region|',
    class: 'aves',
    comments_nznbbs: null,
    common_name_nznbbs: 'asiatic whimbrel',
    family: 'scolopacidae',
    genus: 'numenius',
    id: 430,
    is_exotic: false,
    is_gamebird: false,
    kingdom: 'animalia',
    nzor_register_id: '4abb6900-88e2-491f-b606-fa7a8c523b27',
    nzor_scientific_name: '722',
    nzor_sequence_id: 722,
    order: 'charadriiformes',
    original_authors: 'scopoli',
    phylum: 'chordata',
    row_creation_timestamp_: '2019-09-17T21:38:51.000Z',
    row_creation_user_: 'master',
    row_update_timestamp_: null,
    row_update_user_: null,
    scientific_name_nznbbs: 'numenius phaeopus variegata',
    species: 'numenius phaeopus',
    species_code_nznbbs: 443,
    species_year: null,
    sub_class: 'neognathae',
    sub_family: 'tringinae',
    sub_genus: null,
    sub_order: null,
    sub_phylum: 'craniata',
    sub_species: 'numenius phaeopus variegatus',
    super_class: 'gnathostomata',
    taxonomic_status: 'CURRENT',
    tribe: null,
    valid_band_prefixes: 'y,e',
    species_group_membership: {
      group_id: 10,
      id: 974,
      row_creation_timestamp_: '2019-09-17T21:39:38.000Z',
      row_creation_user_: 'master',
      row_update_timestamp_: null,
      row_update_user_: null,
      species_id: 430,
      species_group: {
        id: 10,
        name: 'waders',
        row_creation_timestamp_: '2019-09-17T21:37:24.000Z',
        row_creation_user_: 'master',
        row_update_timestamp_: null,
        row_update_user_: null
      }
    }
  },
  earliest_event: {
    bird_id: '71e4d90f-1d53-41f4-8c6e-e88462b69aeb',
    event_banding_scheme: 'NZ_NON_GAMEBIRD',
    event_bird_situation: 'WILD',
    event_capture_type: 'CAUGHT_IN_MIST_NET',
    event_owner_id: '7026cb78-6c77-4082-8d5e-dcb16237dfab',
    event_provider_id: 'b909287f-08f0-4d3f-8f99-a5e1a013d5bf',
    event_reporter_id: 'b909287f-08f0-4d3f-8f99-a5e1a013d5bf',
    event_state: 'VALID',
    event_timestamp: '2017-04-25T00:00:00.000Z',
    event_timestamp_accuracy: 'D',
    event_type: 'FIRST_MARKING_IN_HAND',
    id: 'a0191660-f5c6-42d3-9c2c-deed747847fc',
    latitude: '38.725',
    locality_accuracy: null,
    locality_general: null,
    location: '0101000020E610000079E92631084C5F40CDCCCCCCCC5C4340',
    location_comment: null,
    location_description: 'Zhonhgak-ku, Onchon County, DPRK',
    longitude: '125.188',
    project_id: '00000000-0000-0000-0000-000000000002',
    row_creation_idx: 5047941,
    row_creation_timestamp_: '2020-02-18T09:47:40.000Z',
    row_creation_user_: 'master',
    row_update_timestamp_: '2020-02-18T10:09:12.000Z',
    row_update_user_: 'master',
    user_coordinate_system: 'WGS84',
    user_easting: null,
    user_northing: null,
    mark_configuration: []
  },
  latest_event: {
    bird_id: '71e4d90f-1d53-41f4-8c6e-e88462b69aeb',
    event_banding_scheme: 'NZ_NON_GAMEBIRD',
    event_bird_situation: 'WILD',
    event_capture_type: 'CAUGHT_IN_MIST_NET',
    event_owner_id: '7026cb78-6c77-4082-8d5e-dcb16237dfab',
    event_provider_id: 'b909287f-08f0-4d3f-8f99-a5e1a013d5bf',
    event_reporter_id: 'b909287f-08f0-4d3f-8f99-a5e1a013d5bf',
    event_state: 'VALID',
    event_timestamp: '2017-04-25T00:00:00.000Z',
    event_timestamp_accuracy: 'D',
    event_type: 'FIRST_MARKING_IN_HAND',
    id: 'a0191660-f5c6-42d3-9c2c-deed747847fc',
    latitude: '38.725',
    locality_accuracy: null,
    locality_general: null,
    location: '0101000020E610000079E92631084C5F40CDCCCCCCCC5C4340',
    location_comment: null,
    location_description: 'Zhonhgak-ku, Onchon County, DPRK',
    longitude: '125.188',
    project_id: '00000000-0000-0000-0000-000000000002',
    row_creation_idx: 5047941,
    row_creation_timestamp_: '2020-02-18T09:47:40.000Z',
    row_creation_user_: 'master',
    row_update_timestamp_: '2020-02-18T10:09:12.000Z',
    row_update_user_: 'master',
    user_coordinate_system: 'WGS84',
    user_easting: null,
    user_northing: null,
    mark_configuration: []
  }
};
