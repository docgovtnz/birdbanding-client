# doc-birdbanding-client 

Background: https://docgovtnz.github.io/docs/projects/falcon

This project includes the Angular client for the bird banding project and other assets that are helpful in building, deploying and testing this client.

## angular-client
 [The client source code and build artifacts](angular-client/README.md)

## postman

This has a postman collection for calling the API endpoint called by the client. For this to work it will need the  following postman varibles:
*  `base-url` which is the URL of the API gateway that is being called and 
* `token` which is a valid token for the API gateway referenced in base-url

## Licence

FALCON (New Zealand Bird Banding Database)  
Copyright (C) 2021 Department of Conservation | Te Papa Atawhai, Pikselin Limited, Fronde Systems Group Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
