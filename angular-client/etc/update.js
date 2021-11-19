const fs = require('fs');

const VERSION = process.env.npm_package_version;
const newVersionProperty = `build.version = ${VERSION}`;
// write a new version file
fs.writeFile('etc/version', newVersionProperty, err => {
  // throws an error, you could also catch it here
  if (err) throw err;
  // success case, the file was saved
  console.log(`Updated version to ${VERSION}`);
});

fs.copyFileSync('etc/env/environment.local.properties', 'src/environment.properties');

const versionBuffer = new Uint8Array(Buffer.from(newVersionProperty));
fs.writeFileSync('src/environment.properties', versionBuffer, { flag: 'a' });
