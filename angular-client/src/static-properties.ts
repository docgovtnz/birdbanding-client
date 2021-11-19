/**
 * Contains all environment neutral properties. Use environment-xxx.properties to define
 * environment dependent properties. This file gets used by the ConfigurationService to
 * have all properties in one place.
 */
export const Properties = {
  // The name of this application - just in case
  appName: 'Bird Banding',

  // Banding level - mainly for dropdowns
  bandingLevel: ['All', 'L1', 'L2', 'L3'],
};
