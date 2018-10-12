import { Component, OnInit, Inject } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ConsService } from '../services/Cons.service';
import { ModalEnum } from '../Models/Enums';
import { AppConfig } from '../app.config';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material';

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
    private config: AppConfig,
    @Inject(MAT_DIALOG_DATA) data
  ) { 
    this.title = data.title;
    this.titleClass = data.titleClass;
    this.message = data.message;
    this.Dgltype = data.Dgltype;
    this.isClose = (data.isClose ? data.isClose : true);
  }

  ngOnInit() {
    this.client = this.config.get('clients')[this.config.get('clients').client];
  }

  closed() {
    if (this.Dgltype) {
      //modificado
      console.log("entre al close del modal de mensages")
      this.consService.closeModal(this.Dgltype);
    }
  }
}
