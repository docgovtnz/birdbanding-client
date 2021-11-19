import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  constructor() {}

  @Output()
  resetForm = new EventEmitter();

  ngOnInit() {}

  reset() {
    this.resetForm.emit();
  }
}
