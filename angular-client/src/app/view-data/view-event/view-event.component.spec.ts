import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEventComponent } from './view-event.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EventDataService } from '../services/event-data.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY_EVENT_DETAILS } from '../services/event-types';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AuthenticationService } from '../../authentication/authentication.service';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('ViewEventComponent', () => {
  let component: ViewEventComponent;
  let fixture: ComponentFixture<ViewEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, AngularSvgIconModule.forRoot(), AlertModule.forRoot(), ModalModule.forRoot()],
      declarations: [ViewEventComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => 'testEventId'
            }),
            queryParamMap: of({
              get: () => 'testParam'
            })
          }
        },
        {
          provide: EventDataService,
          useValue: {
            getEventDetails: () => of(EMPTY_EVENT_DETAILS)
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({
              userId: ''
            })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
