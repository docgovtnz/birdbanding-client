import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Form, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-your-details',
  templateUrl: './your-details.component.html',
  styleUrls: ['./your-details.component.scss']
})
export class YourDetailsComponent implements OnInit {
  @Input()
  detailsForm: FormGroup;

  @Input()
  isSubmitting: boolean;

  @Output()
  changePage = new EventEmitter<number>();

  @Output()
  submitForm = new EventEmitter();

  detailContact = false;

  constructor() { }


  get f() {
    return this.detailsForm.controls;
  }

  ngOnInit() {
  }

  previous() {
    this.changePage.emit(3);
  }

  submit() {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
    } else {
      (this.detailsForm.controls['detailContact'] as FormControl).setValue(this.detailContact);
      this.submitForm.emit();
    }
  }
}
