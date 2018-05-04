import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ConsService } from '../services/Cons.service';
import { ModalEnum } from '../Models/Enums';
import { AppConfig } from '../app.config';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-modal-message',
  templateUrl: './modal-message.component.html',
  styleUrls: ['./modal-message.component.scss']
})
export class ModalMessageComponent implements OnInit {

  client: any;
  title: string = "";
  titleClass: string = "";
  isClose: boolean = true;
  message: Observable<string> = new Observable<string>();
  Dgltype: ModalEnum = null;

  constructor(
    public consService: ConsService,
    public settings: SettingsService,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private config: AppConfig,
  ) { }

  ngOnInit() {
    this.client = this.config.get('clients')[this.config.get('clients').client];

    /*
    this.modalService.onHidden.subscribe((reason: string) => {
      if(this.settings.Modal.self.getValue() == ModalEnum.ERROR && this.settings.lastError.CodError != "11599") {
        console.log("close eror");
        this.consService.closeModal(ModalEnum.ERROR);
      }      
    });*/
  }

  closed() {
    if (this.Dgltype) {
      this.consService.closeModal(this.Dgltype);
    }

  }


}
