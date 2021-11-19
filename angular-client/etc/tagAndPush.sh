PKG_VERSION=$(node -p "require('./package.json').version")
git add "src/environment.properties" "package.json" "package-lock.json" "etc/version"
git commit -m "Updated verion to $PKG_VERSION"
git tag "$PKG_VERSION"
git push
git push --tags
