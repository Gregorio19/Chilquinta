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

  enableClosed: boolean;

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
    if (this.ConfirmaNom) {
      valida["txNom"] = [null, Validators.compose([
        Validators.required
      ])];
    } else {
      valida["txNom"] = [null];
    }

    if (this.ConfirmaMail) {
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
    this.bsModalRef.hide();

  }

  getFonMax() {
    return (this.settings.CliInt == 'FALASACBOD' ? 5999999999 : 999999999);
  }

  getFonMin() {
    return (this.settings.CliInt == 'FALASACBOD' ? 5000000000 : 910000000);
  }

  fnSet_ID() {
    this.settings.Rut = this.model.txRut;
    if (this.client.IdEditarForzar) {
      this.settings.FonoTmp = this.model.txFon + "," + (this.model.txTer ? "1" : "0");
    } else {
      this.settings.FonoTmp = this.model.txFon + "," + this.model.txNom + "," + this.model.txMail;
    }
    this.consService.fnAccion(AccEnum.SID);

    this.consService.IsError().subscribe(isError => {
      if (!isError) {
        this.bsModalRef.hide();
      }
    })
  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    this.isChange = true;

    this.consService.clearError();
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