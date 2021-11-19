import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventProjectModalComponent } from './event-project-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjectService } from '../../projects/services/project.service';
import { of } from 'rxjs';

describe('EventProjectModalComponent', () => {
  let component: EventProjectModalComponent;
  let fixture: ComponentFixture<EventProjectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EventProjectModalComponent],
      providers: [
        {
          provide: BsModalRef,
          useValue: {}
        },
        {
          provide: ProjectService,
          useValue: {
            getProjects: () => of([])
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
