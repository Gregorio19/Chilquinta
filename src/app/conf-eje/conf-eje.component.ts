import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { ConsService } from '../services/Cons.service';
import { BsModalRef } from 'ngx-bootstrap';
import { AppConfig } from '../app.config';
import { RutValidator } from '../validators/rut-validator.directive';
import { CustomValidators } from 'ng2-validation';
import { LoginModel } from '../Models/LoginModel';
import { BehaviorSubject } from 'rxjs';
import { ModalEnum } from '../Models/Enums';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-conf-eje',
  templateUrl: './conf-eje.component.html',
  styleUrls: ['./conf-eje.component.scss']
})
export class ConfEjeComponent implements OnInit {
  confEjeForm: FormGroup;
  model = new ConfEjeModel();
  isChange: boolean = false;
  client: any;
  public loginModel: LoginModel;
   
  constructor(
    private consService: ConsService,
    public settings: SettingsService,
    private fb: FormBuilder,
    private config: AppConfig,
    private changeDetection: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) data
  ) {    
    this.loginModel = data.loginModel;
   }

  ngOnInit() {
    this.client = this.config.get('clients')[this.config.get('clients').client];

    this.confEjeForm = this.fb.group({
        txRut: [null, Validators.compose([
          Validators.required,
          RutValidator.check
        ])],
        txNombre: [null,Validators.compose([
          Validators.required,
          Validators.maxLength(50)
        ])]
        });    
   }

  closed(): void {
    this.consService.closeModal(ModalEnum.CONFEJE);
  }
  

  confirmBtn() {
    //this.settings.Rut = this.model.txRut;    
    //this.settings.hiUsr = this.model.txNombre;

    let lId = this.model.txRut.substring(0, this.model.txRut.length - 2);
    this.loginModel.Pass = lId + "-X-" + this.model.txNombre;

    this.settings._data.next(this.loginModel);
    this.changeDetection.markForCheck();

    this.closed();
    
  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;
        
  } 
}

export class ConfEjeModel {
  txRut: string;
  txNombre: string;
  lId: string;
}