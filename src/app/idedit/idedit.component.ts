import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConsService } from '../services/Cons.service';
import { SettingsService } from '../services/settings.service';
import { AccEnum, ModalEnum } from '../Models/Enums';
import { RutValidator } from '../validators/rut-validator.directive';
import { AppConfig } from '../app.config';
import { CustomValidators } from 'ng2-validation';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Subject, BehaviorSubject } from 'rxjs';


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
  enableClosed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  chil: boolean = false;
  constructor(
    public settings: SettingsService,
    private consService: ConsService,
    private fb: FormBuilder,
    private config: AppConfig,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.enableClosed.next(data.enableClosed);
  }

  ngOnInit() {
    if (this.config.get('clients').client == "Chilquinta") {
      this.chil = true;
    }
    this.client = this.config.get('clients')[this.config.get('clients').client];

    if (this.settings.dRut.value.getValue() && this.settings.dRut.value.getValue() != "") {
      this.model.txRut = this.settings.dRut.value.getValue();
    }
    if (this.settings.dFon.value.getValue() && this.settings.dFon.value.getValue() != "") {
      this.model.txFon = this.settings.dFon.value.getValue();
    }

    if (this.settings.dNom.value.getValue() && this.settings.dNom.value.getValue() != "") {
      this.model.txNom = this.settings.dNom.value.getValue();
    }

    if (this.settings.dMail.value.getValue() && this.settings.dMail.value.getValue() != "") {
      this.model.txMail = this.settings.dMail.value.getValue();
    }

    if (this.client.IdEditarForzar) {
      if (this.settings.dTer.value.getValue() && this.settings.dTer.value.getValue() != "") {
        this.model.txTer = (this.settings.dTer.value.getValue() == '1' ? true : false);
      }
    }

    this.createEditForm();

  }

  createEditForm() {
    let valida = {};

    if (this.ConfirmaRut) {
      valida["txRut"] = [null, Validators.compose([
        Validators.required,
        RutValidator.check
      ])];
    } else {
      valida["txRut"] = [null];
    }

    if (this.ConfirmaFono) {
      valida["txFon"] = [null, Validators.compose([
        Validators.required,
        CustomValidators.number
      ])];
    } else {
      valida["txFon"] = [null];
    }
    if (this.EnableNom && this.ConfirmaNom) {
      valida["txNom"] = [null, Validators.compose([
        Validators.required
      ])];
    } else {
      valida["txNom"] = [null];
    }

    if (this.EnableMail && this.ConfirmaMail) {
      valida["txMail"] = [null, Validators.compose([
        Validators.required,
        CustomValidators.email
      ])];
    } else {
      valida["txMail"] = [null];
    }

    if (this.client.IdEditarForzar) {
      valida["txTer"] = [null];
    }

    this.IdEditForm = this.fb.group(valida);

  }

  closed(): void {
    this.consService.closeModal(ModalEnum.IDEDIT);
  }

  getFonMax() {
    return (this.settings.CliInt == 'FALASACBOD' ? 5999999999 : 999999999);
  }

  getFonMin() {
    return (this.settings.CliInt == 'FALASACBOD' ? 5000000000 : 910000000);
  }

  fnSet_ID() {
    this.settings.Rut = this.model.txRut;
    /*var d = new Date();
        //console.log(d);
    //console.log(this.settings.Rut);*/
    if (this.client.IdEditarForzar) {
      this.settings.FonoTmp = this.model.txFon + "," + (this.model.txTer ? "1" : "0");
    } else {
      this.settings.FonoTmp = this.model.txFon;
      if (this.EnableNom) {
        this.settings.FonoTmp += "," + this.model.txNom;
      }
      if (this.EnableMail) {
        this.settings.FonoTmp += "," + this.model.txMail;
      }
    }
    this.consService.fnAccion(AccEnum.SID);

  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    this.isChange = true;

    this.consService.clearError();
  }

  rutFormat(key){
    let rut;
    let dv;
    let mantisa;

    if((this.model.txRut.substr(this.model.txRut.length - 1) == "-" )){
      //console.log("entro aca");
      rut = this.model.txRut.replace(/-/g,"");
      dv = rut.substr(rut.length - 1);
      mantisa = rut.substring(0,rut.length - 1);
     this.model.txRut = mantisa + "-" + dv;
    }else
    if(this.model.txRut.length > 1){
       rut = this.model.txRut.replace("-","");
       dv = rut.substr(rut.length - 1);
       mantisa = rut.substring(0,rut.length - 1);
      this.model.txRut = mantisa + "-" + dv;
    }else{
      this.model.txRut = this.model.txRut.replace("-","");
    }
  }

  get txRut() {
    return this.IdEditForm.get('txRut');
  }

  get txFon() {
    return this.IdEditForm.get('txFon');
  }

  get txNom() {
    return this.IdEditForm.get('txNom');
  }

  get txMail() {
    return this.IdEditForm.get('txMail');
  }

  get ConfirmaRut(): boolean {
    return (this.config.get('socket').ConfirmaTipo.toUpperCase().indexOf("R") != -1);
  }

  get ConfirmaFono(): boolean {
    return (this.config.get('socket').ConfirmaTipo.toUpperCase().indexOf("F") != -1);
  }

  get ConfirmaNom(): boolean {
    return (this.config.get('socket').ConfirmaTipo.toUpperCase().indexOf("N") != -1);
  }

  get ConfirmaMail(): boolean {
    return (this.config.get('socket').ConfirmaTipo.toUpperCase().indexOf("M") != -1);
  }

  get IsValidRut(): boolean {
    if (this.ConfirmaRut) {
      return this.IdEditForm.controls['txRut'].valid;
    }
    return false;
  }

  get EnableNom(): boolean {
    return this.client["IdEdit"].some(x => x == 'txNom');
  }

  get EnableMail(): boolean {
    return this.client["IdEdit"].some(x => x == 'txMail');
  }

  get IsValidFono(): boolean {
    if (this.ConfirmaFono) {
      return this.IdEditForm.controls['txFon'].valid;
    }
    return false;
  }
}

export class IdEditModel {
  txRut: string = "";
  txFon: string = "";
  txTer: boolean;
  txNom: string;
  txMail: string;
}