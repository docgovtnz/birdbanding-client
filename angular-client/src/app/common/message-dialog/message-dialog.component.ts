import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html'
})
export class MessageDialogComponent implements OnInit {
  actionMessage: ActionMessage;

  @Output()
  actionSelected = new EventEmitter<ActionResult>();

  @ViewChild('template')
  template: TemplateRef<any>;
  modalRef: BsModalRef;

  constructor(private modalService: BsModalService) {}

  ngOnInit(): void {}

  show(actionMessage: ActionMessage) {
    this.actionMessage = actionMessage;
    this.modalRef = this.modalService.show(this.template);
  }

  onAction(actionLbl: string) {
    this.modalRef.hide();
    this.actionSelected.next({
      title: this.actionMessage.title,
      actionLabel: actionLbl,
      payload: this.actionMessage.payload
    });
  }
}

export class ActionMessage {
  title: string;
  messageText: string;
  actionButtons: ActionButtonDefinition[];
  payload?: any;
}

export class ActionButtonDefinition {
  label: string;
  styleClasses: string[];
}

export class ActionResult {
  title: string;
  actionLabel: string;
  payload?: any;
}
