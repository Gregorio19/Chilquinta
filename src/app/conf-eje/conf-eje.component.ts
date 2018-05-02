import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { ConsService } from '../services/Cons.service';
import { BsModalRef } from 'ngx-bootstrap';
import { AppConfig } from '../app.config';
import { RutValidator } from '../validators/rut-validator.directive';
import { CustomValidators } from 'ng2-validation';
import { LoginModel } from '../Models/LoginModel';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-conf-eje',
  templateUrl: './conf-eje.component.html',
  styleUrls: ['./conf-eje.component.scss']
})
export class ConfEjeComponent implements OnInit {

  confEjeForm: FormGroup;
  model = new ConfEjeModel();
  isChange: boolean = false;
  private client: any;
  public loginModel: LoginModel;
   
  constructor(
    public settings: SettingsService,
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    private config: AppConfig,
    private changeDetection: ChangeDetectorRef
  ) {    
   }

  ngOnInit() {

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
    this.bsModalRef.hide();
  }
  

  confirmBtn() {
    //this.settings.Rut = this.model.txRut;    
    //this.settings.hiUsr = this.model.txNombre;

    let lId = this.model.txRut.substring(0, this.model.txRut.length - 2);
    this.loginModel.Pass = lId + "-X-" + this.model.txNombre;

    this.settings._data.next(this.loginModel);
    this.changeDetection.markForCheck();

    this.bsModalRef.hide();
    
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