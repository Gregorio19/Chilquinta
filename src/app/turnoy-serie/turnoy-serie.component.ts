import { Component, OnInit, TemplateRef, ContentChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConsService } from '../services/Cons.service';
import { SettingsService } from '../services/settings.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AccEnum, ModalEnum } from '../Models/Enums';
import { TurnoySerie } from '../Models/TurnoySerie';
import { AppConfig } from '../app.config';

@Component({
  selector: 'app-turnoy-serie',
  templateUrl: './turnoy-serie.component.html',
  styleUrls: ['./turnoy-serie.component.scss']
})

export class TurnoySerieComponent implements OnInit {
  TurnoySerieForm: FormGroup;
  model = new TurnoySerie();

  client: any;
  /*
  @ContentChild(TemplateRef)
  Question: TemplateRef<any>;
  */
  
  bsModalRefMsgBox: BsModalRef;

  constructor(
    private consService: ConsService,
    public settings: SettingsService,
    public bsModalRef: BsModalRef,
    public fb: FormBuilder,    
    private modalService: BsModalService,
    private config: AppConfig
  ) { }

  ngOnInit() {
    this.TurnoySerieForm = this.fb.group({
      rbSer: ['', Validators.required],
      urgTur: ['', [Validators.required, Validators.min(0)]]
    });

    this.model.urgTur = 0;

    this.client = this.config.get('clients')[this.config.get('clients').client];
  }

  closed(): void {
    //this.bsModalRef.hide();
    this.consService.closeModal(ModalEnum.GETSERIES_URGSER);
  }

  fnAccion(accion: AccEnum) {
    this.settings.rbSer.checked.next(true);
    this.settings.rbSer.value.next(this.model.rbSer);
    this.settings.urgTur.value.next(this.model.urgTur.toString());
    this.consService.fnAccion(accion);
    this.consService.IsError().subscribe(isError => {
      if (!isError) {
        //this.bsModalRef.hide();
        this.closed();
      }
    });

  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    this.consService.clearError();
  }

  get urgTur() {
    return this.TurnoySerieForm.get('urgTur');
  }

  openQuestion(template: TemplateRef<any>) {

    if (this.client.MotivosExt) {
      if (!this.client.ConsUrg) {
        if (this.model.urgTur == 0) {
          this.bsModalRefMsgBox = this.modalService.show(template, { class: 'modal-sm' })
        } else {
          this.confirm();
        }
      } else {
        if (!this.settings.lastError.isError.getValue()) {
          //this.bsModalRef.hide();
          this.confirm();
        }


      }

    } else {
      if (!this.settings.lastError.isError.getValue()) {
        //this.fnAccion(AccEnum.URGSET);
        //this.bsModalRef.hide();
        //this.closed();
        this.confirm();
      }
    }

  }

  confirm() {
    this.fnAccion(AccEnum.URGSET);
    if(this.bsModalRefMsgBox) {
      this.bsModalRefMsgBox.hide();
    }
    
    //this.bsModalRef.hide();
    this.closed();
  }

  decline() {
    this.bsModalRefMsgBox.hide();
  }
}
