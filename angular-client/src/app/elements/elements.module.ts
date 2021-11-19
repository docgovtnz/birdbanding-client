import { Injector, NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MapPopupComponent } from '../elements/map-popup/map-popup.component';
import { createCustomElement } from '@angular/elements';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, AngularSvgIconModule, RouterModule],
  declarations: [MapPopupComponent],
  entryComponents: [MapPopupComponent]
})
export class ElementsModule {
  constructor(private injector: Injector) {
    const mapPopUp = createCustomElement(MapPopupComponent, { injector });
    customElements.define('popup-element', mapPopUp);
  }
}
