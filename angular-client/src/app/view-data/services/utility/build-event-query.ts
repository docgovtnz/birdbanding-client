// build the query string for an event search assumes that this will be appended to a string that starts /events??limit=${limit}
import { FilterOptions } from '../event-types';
import { isEmpty, isNil, not } from 'ramda';
import { format } from 'date-fns';

export const buildEventParameters = (filterOptions: FilterOptions): string => {
  let queryString = '';
  queryString =
    queryString + filterOptions.projects.map(project => `&projectId=${project.id}`).reduce((query, nextQuery) => query + nextQuery, '');

  queryString =
    queryString + filterOptions.species.map(species => `&speciesId=${species.id}`).reduce((query, nextQuery) => query + nextQuery, '');

  if (not(isEmpty(filterOptions.locationDescription))) {
    queryString = queryString + `&locationDescription=${filterOptions.locationDescription}`;
  }
  queryString =
    queryString +
    filterOptions.bandingSchemes.map(scheme => `&bandingScheme=${scheme.id}`).reduce((query, nextQuery) => query + nextQuery, '');

  queryString =
    queryString + filterOptions.bandCodes.map(code => `&nznbbsCode=${code.id}`).reduce((query, nextQuery) => query + nextQuery, '');

  if (not(isNil(filterOptions.eventDates)) && not(isEmpty(filterOptions.eventDates))) {
    queryString =
      queryString +
      `&eventDateGte=${format(filterOptions.eventDates[0], 'yyyy-MM-dd')}` +
      `&eventDateLte=${format(filterOptions.eventDates[1], 'yyyy-MM-dd')}`;
  }
  queryString =
    queryString + filterOptions.uploadedBy.map(person => `&userId=${person.id}`).reduce((query, nextQuery) => query + nextQuery, '');

  queryString =
    queryString +
    filterOptions.speciesGroups.map(speciesGroup => `&speciesGroup=${speciesGroup.id}`).reduce((query, nextQuery) => query + nextQuery, '');

  return queryString;
};
