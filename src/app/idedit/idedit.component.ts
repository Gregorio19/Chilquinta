import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConsService } from '../services/Cons.service';
import { SettingsService } from '../services/settings.service';
import { BsModalRef } from 'ngx-bootstrap';
import { AccEnum } from '../Models/Enums';
import { RutValidator } from '../validators/rut-validator.directive';
import { AppConfig } from '../app.config';
import { CustomValidators } from 'ng2-validation';


@Component({
  selector: 'app-idedit',
  templateUrl: './idedit.component.html',
  styleUrls: ['./idedit.component.scss']
})
export class IdeditComponent implements OnInit {
  IdEditForm: FormGroup;
  model = new IdEditModel();
  isChange: boolean = false;
  public client: any;
   
  constructor(
    public settings: SettingsService,
    private consService: ConsService,    
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    private config: AppConfig
  ) {    
   }

  ngOnInit() {
    this.client = this.config.get('clients')[this.config.get('clients').client];

    if(this.settings.dRut.value.getValue() && this.settings.dRut.value.getValue() != "") {
      this.model.txRut = this.settings.dRut.value.getValue();
    }
    if(this.settings.dFon.value.getValue() && this.settings.dFon.value.getValue() != ""){
      this.model.txFon = this.settings.dFon.value.getValue();
    }

    if(this.client.IdEditarForzar) {
      if(this.settings.dTer.value.getValue() && this.settings.dTer.value.getValue() != "") {
        this.model.txTer = (this.settings.dTer.value.getValue() == '1' ? true : false);
      }
    }


    if(this.client.IdEditarForzar) {
      this.IdEditForm = this.fb.group({
        txRut: [null, Validators.compose([
          Validators.required,
          RutValidator.check
        ])],
        txFon: [null,Validators.compose([
          Validators.required,
          CustomValidators.number
        ])],
        txTer: [null]
        });

      } else {
        this.IdEditForm = this.fb.group({
          txRut: [null, Validators.compose([
            Validators.required,
            RutValidator.check
          ])],
          txFon: [null,Validators.compose([
            Validators.required,
            CustomValidators.number
          ])]
          });
    
      }
      
    
  }

  closed(): void {
      this.bsModalRef.hide();
    
  }

  getFonMax() {
    return (this.settings.CliInt == 'FALASACBOD' ? 5999999999: 999999999);
  }

  getFonMin() {
    return (this.settings.CliInt == 'FALASACBOD' ? 5000000000: 910000000);
  }



  fnSet_ID() {
    this.settings.Rut = this.model.txRut;
    if(this.client.IdEditarForzar) {
      this.settings.FonoTmp = this.model.txFon + "," + (this.model.txTer ? "1": "0");    
    } else {
      this.settings.FonoTmp = this.model.txFon;
    }
    this.consService.fnAccion(AccEnum.SID);

    this.settings.lastError.isError.subscribe(isError => {
      if(!isError) {
        this.bsModalRef.hide();
      }
    })
  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    if(this.model.txRut !== this.settings.dRut.value.getValue() ||
      this.model.txFon !== this.settings.dFon.value.getValue()) {

        /* || (this.model.txTer ? "1": "0") !== this.settings.dTer.value.getValue()) {*/
        if(this.client.IdEditarForzar) {
          if ((this.model.txTer ? "1": "0") !== this.settings.dTer.value.getValue()) {
            this.isChange = true;
          }
        } else {
          this.isChange = true;
        }         
      }
    
    this.consService.clearError();
  }
 
  get txRut() {
    return this.IdEditForm.get('txRut');
  }

  get txFon() {
    return this.IdEditForm.get('txFon');
  }
}

export class IdEditModel {
  txRut: string;
  txFon: string;
  txTer: boolean;
}