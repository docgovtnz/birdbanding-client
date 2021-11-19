import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviousRouteService } from '../../services/previous-route.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { PeopleService } from '../../services/people.service';
import { PeopleData } from '../../people/people-data';
import { ErrorDetail, ErrorType, SubmissionError } from '../../common/errors/error-utilities';
import { isEmpty, isNil, not, path, pathEq } from 'ramda';
import { of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { LoggingService } from '../../services/logging.service';
import { CreateUpdateProject, Project } from '../services/project-types';
import { ReferenceDataService, ViewProjectsEnums } from '../../services/reference-data.service';
import { firstOfAprilNextDate } from '../services/project-transformer';
import { isAfter, isBefore } from 'date-fns';

type SuccessStatus = 'created' | 'updated';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-update-project.component.html',
  styleUrls: ['./create-update-project.component.scss'],
})
export class CreateUpdateProjectComponent implements OnInit, OnDestroy {
  createProjectForm: FormGroup;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private previousRoueService: PreviousRouteService,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private peopleService: PeopleService,
    private loggingService: LoggingService,
    private referenceDataService: ReferenceDataService
  ) {}

  isCreate: boolean;

  submitting = false;

  submissionError: SubmissionError = {
    hasError: false,
    errorType: ErrorType.NONE,
  };

  viewProjectEnums: ViewProjectsEnums;

  // this is the status that will be added as a query param on successful submission
  private successStatus: SuccessStatus;

  people: PeopleData[] = [];

  projects: Project[] = [];

  private currentProjectName: string;

  private projectId: string;

  ngOnInit() {
    this.referenceDataService.viewProjectSubject.pipe(takeUntil(this.destroy$)).subscribe((e) => (this.viewProjectEnums = e));
    this.createProjectForm = this.fb.group(
      {
        name: [
          '',
          Validators.compose([
            Validators.required,
            this.validateDuplicateProject(),
            Validators.pattern('^(?!\\s*$).+'),
          ]),
        ],
        projectManagerName: ['', Validators.compose([this.validateProjectManagerName(), Validators.required])],
        projectManagerId: [null],
        location: [null, Validators.compose([Validators.maxLength(2500), Validators.required])],
        organisation: [null, Validators.maxLength(2500)],
        isDocProject: [false],
        permitNumber: [null, Validators.maxLength(200)],
        permitExpiryDate: [null],
        description: ['', Validators.compose([Validators.maxLength(2500), Validators.required])],
        isMoratorium: [false],
        moratoriumEndDate: [null],
        projectState: ['ACTIVE'],
      },
      {
        validators: moratoriumEndDateRequiredValidator,
      }
    );
    this.projectService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((projects) => (this.projects = projects));
    this.peopleService
      .getPeople()
      .pipe(takeUntil(this.destroy$))
      .subscribe((people) => (this.people = people));
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const projectId = params.get('projectId');
      if (not(isNil(projectId))) {
        this.projectId = projectId;
        this.projectService.getProjectUpdateFormDetails(projectId).subscribe((projectForm) => {
          this.currentProjectName = projectForm.name;
          this.createProjectForm.patchValue(projectForm);
        });
      }
    });
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(({ isCreate }) => {
      this.isCreate = isCreate;
      if (isCreate) {
        this.successStatus = 'created';
      } else {
        this.successStatus = 'updated';
      }
    });
    this.isMoratorium.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((newValue) => {
      if (newValue) {
        this.moratoriumEndDate.setValue(firstOfAprilNextDate());
      } else {
        this.moratoriumEndDate.setValue(null, {
          emitEvent: false,
        });
      }
    });
    this.moratoriumEndDate.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((nextDate) => {
      // if the expiry date is before today, then there is no moratorium
      if (isBefore(nextDate, new Date())) {
        this.isMoratorium.setValue(false, {
          emitEvent: false,
        });
      } else if (isAfter(nextDate, new Date())) {
        this.isMoratorium.setValue(true, {
          emitEvent: false,
        });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get moratoriumEndDate(): FormControl {
    return this.createProjectForm.get('moratoriumEndDate') as FormControl;
  }

  get isMoratorium(): FormControl {
    return this.createProjectForm.get('isMoratorium') as FormControl;
  }

  get f() {
    return this.createProjectForm.controls;
  }

  submitForm() {
    if (this.createProjectForm.invalid) {
      this.createProjectForm.markAllAsTouched();
    } else {
      this.submitting = true;
      this.submissionError = {
        errorType: ErrorType.NONE,
        hasError: false,
      };
      const createUpdateProjectValue: CreateUpdateProject = this.createProjectForm.value as CreateUpdateProject;
      of({})
        .pipe(
          switchMap((_) => {
            if (this.isCreate) {
              return this.projectService.createProject(createUpdateProjectValue);
            } else {
              return this.projectService.updateProject(createUpdateProjectValue, this.projectId);
            }
          })
        )
        .subscribe(
          (project) => {
            this.router
              .navigate(['/projects/details', project.id], {
                queryParams: {
                  status: this.successStatus,
                },
              })
              .then((e) => () => {
                this.submitting = false;
              });
          },
          (error) => {
            this.loggingService.logError(JSON.stringify(error));
            this.submitting = false;
            const errorStatus = error.status;
            if (errorStatus === 400) {
              this.handleBadRequest(error.error.details);
            } else {
              this.submissionError = {
                hasError: true,
                errorType: errorStatus > 500 ? ErrorType.SERVER : ErrorType.CLIENT,
              };
            }
          }
        );
    }
  }

  handleBadRequest(errorDetails: ErrorDetail[]) {
    errorDetails.forEach((errorDetail) => {
      if (pathEq(['details', 'data', 'path'], '[object Object]/name')(errorDetail)) {
        this.createProjectForm.controls.name.setErrors({
          duplicate: true,
        });
      } else {
        this.submissionError = {
          hasError: true,
          errorType: ErrorType.CLIENT,
        };
      }
    });
  }

  goBack() {
    this.router.navigate([this.previousRoueService.getPreviousRoute('/projects')]);
  }

  updateProjectManagerId(projectManager) {
    this.createProjectForm.controls.projectManagerId.setValue(projectManager.id);
  }

  validateProjectManagerName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      // find if the name in control is in the people list, if it isn't add an error

      if (isEmpty(this.people)) {
        return null;
      }
      const person = this.people.find((p) => control.value === p.display);
      if (isNil(person)) {
        return { invalidName: true };
      } else {
        return null;
      }
    };
  }

  validateDuplicateProject(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      // a project should keeps its own name
      if (control.value === this.currentProjectName) {
        return null;
      }
      const project = this.projects.find((p) => control.value === p.name);
      if (not(isNil(project))) {
        return { duplicate: true };
      } else {
        return null;
      }
    };
  }
}

const moratoriumEndDateRequiredValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const moratoriumEndDate = control.get('moratoriumEndDate') as FormControl;
  const isMoratorium = control.get('isMoratorium') as FormControl;

  if (isMoratorium.value && isNil(moratoriumEndDate.value)) {
    return {
      moratoriumEndDateRequired: true,
    };
  } else {
    return null;
  }
};
