$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$versionType = $args[0]
npm version $versionType --ignore-scripts
$PKG_VERSION=$(node -p "require('./package.json').version")
$newVersionProperty = "build.version=${PKG_Version}"
$newVersionProperty | Out-File -encoding utf8 etc/version -NoNewline
cp etc/env/environment.local.properties src/environment.properties
$newVersionProperty | Out-File -encoding utf8 src/environment.properties -Append -NoNewline
git add "src/environment.properties" "package.json" "package-lock.json" "etc/version"
git commit -m "Updated verion to $PKG_VERSION"
git tag "$PKG_VERSION"
git push
git push --tags
 
