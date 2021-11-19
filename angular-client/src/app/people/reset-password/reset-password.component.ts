import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  @Input() public data: any;

  constructor(public modalRef: BsModalRef) {}

  ngOnInit() {}

  /**
   * TODO: On hold at the moment!
   */
  onPasswordReset(): void {
    this.modalRef.hide();
  }
}
