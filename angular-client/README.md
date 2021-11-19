# AngularClient

Project Falcon development instructions for the Angular client. At this stage it's just a vanilla Angular 
application so the following is all true.

NOTE: For Code Pipeline builds using the following command...

> npm run build-prod
 

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.23.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build API

Install OPenAPI-codegen via `npm install @openapitools/openapi-generator-cli -g`. Then run `npm run api` to build the api ts-files from the json file.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Versioning
To release a new version of the client run `npm version patch|minor|major`. This will run `etc/update.js` to update properties and version files based on the 
version in package.json. If you are on a UNIX like system `tagAndPush.sh`  will commit these changes and tag them with the new version number for you. If now you will have to
do this yourself.
