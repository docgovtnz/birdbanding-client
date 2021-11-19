import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { ConfigurationService } from '../services/configuration.service';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  const testBuildVersion = 'testBuildVersion';
  const testBuildEnv = 'testBuildEnv';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            getConfig: () => {
              return {
                buildVersion: testBuildVersion,
                buildEnv: testBuildEnv
              };
            }
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the version and build set correctly', () => {
    expect(component.env).toEqual(testBuildEnv);
    expect(component.version).toEqual(testBuildVersion);
  });
});
