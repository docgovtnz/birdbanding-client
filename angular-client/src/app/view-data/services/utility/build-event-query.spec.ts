import { FilterOptions } from '../event-types';
import { buildEventParameters } from './build-event-query';

import { format } from 'date-fns';

describe('build event query', () => {
  it('should builds the correct url parameters', () => {
    const serachFilter: FilterOptions = {
      bandingSchemes: [
        {
          id: ' testPandingScheeme',
          display: 'display name'
        }
      ],
      bandCodes: [
        {
          id: 'testBbsCode',
          display: 'testName'
        }
      ],
      eventDates: [new Date(), new Date()],
      projects: [
        {
          id: 'testProjectId',
          name: 'testName'
        }
      ],
      locationDescription: 'testRegion',
      showErrors: false,
      showMoratorium: true,
      species: [
        {
          id: 1,
          description: 'testDescription',
          common_name_nznbbs: '',
          is_exotic: false,
          is_gamebird: true,
          scientific_name_nznbbs: 'testName',
          species_code_nznbbs: '',
          valid_band_prefixes: []
        }
      ],
      uploadedBy: [
        {
          display: 'testName',
          id: 'testId',
          banderNumber: '',
          company: '',
          firstName: '',
          hidden: false,
          jointDate: new Date(),
          lastLogin: new Date(),
          lastName: '',
          maxBandingLevel: 'L1',
          personName: '',
          status: 'ALL',
          userName: 'user124'
        }
      ],
      speciesGroups: [
        {
          id: 1,
          name: 'birds'
        }
      ]
    };
    const builtParameters = buildEventParameters(serachFilter);
    expect(builtParameters).toEqual(
      `&projectId=${serachFilter.projects[0].id}&speciesId=${serachFilter.species[0].id}` +
        `&locationDescription=${serachFilter.locationDescription}&bandingScheme=${serachFilter.bandingSchemes[0].id}` +
        `&nznbbsCode=${serachFilter.bandCodes[0].id}` +
        `&eventDateGte=${format(serachFilter.eventDates[0], 'yyyy-MM-dd')}` +
        `&eventDateLte=${format(serachFilter.eventDates[1], 'yyyy-MM-dd')}&userId=${serachFilter.uploadedBy[0].id}` +
        `&speciesGroup=${serachFilter.speciesGroups[0].id}`
    );
  });
});
