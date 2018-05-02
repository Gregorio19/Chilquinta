import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ConsService } from '../services/Cons.service';
import { ModalEnum } from '../Models/Enums';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  constructor(
    public consService: ConsService,
    public settings: SettingsService,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService
  )
     { }

  ngOnInit() {
    this.modalService.onHidden.subscribe((reason: string) => {
      if(this.settings.Modal.self.getValue() == ModalEnum.ERROR && this.settings.lastError.CodError != "11599") {
        this.consService.closeModal(ModalEnum.ERROR);
      }      
    });
  }


  
}
