import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BandingNavComponent } from './banding-nav.component';
import { Component, Input, TemplateRef } from '@angular/core';
import { AuthenticationService } from '../../authentication/authentication.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-person-badge',
  template: '<div></div>'
})
class TestPersonBadgeComponent {
  @Input()
  buttonTemplate: TemplateRef<any>;
}

describe('BandingNavComponent', () => {
  let component: BandingNavComponent;
  let fixture: ComponentFixture<BandingNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BandingNavComponent, TestPersonBadgeComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({}),
            timeoutSubject: of({})
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BandingNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
