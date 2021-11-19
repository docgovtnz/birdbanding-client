import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SightingsNavComponent } from './sightings-nav.component';
import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-person-badge',
  template: '<div></div>'
})
class TestPersonBadgeComponent {
  @Input()
  buttonTemplate: TemplateRef<any>;
}

describe('SightingsNavComponent', () => {
  let component: SightingsNavComponent;
  let fixture: ComponentFixture<SightingsNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SightingsNavComponent, TestPersonBadgeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SightingsNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
