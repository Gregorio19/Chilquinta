import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { ConsService } from '../services/Cons.service';
import { SettingsService } from '../services/settings.service';
import { AccEnum, tElement, ModalEnum } from '../Models/Enums';
import { environment } from '../../environments/environment';
import { AppConfig } from '../app.config';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { MatDialog } from '@angular/material';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-motivos',
  templateUrl: './motivos.component.html',
  styleUrls: ['./motivos.component.scss']
})
export class MotivosComponent implements OnInit, OnDestroy {

  MotivosForm: FormGroup;
  rows: any[] = [];
  selected = [];
  loadingIndicator: boolean = true;
  messages = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: 'No hay motivos',

    // Footer total message
    totalMessage: 'total',
    selectedMessage: 'seleccionado'
  };

  MotCierre: string = this.config.get('socket')['MotCierre'];
  isError: boolean = false;

  client: any;

  private dialogRef;

  data: ISubscription;
  private isErrorSub: ISubscription;

  constructor(
    private consService: ConsService,
    public settings: SettingsService,
    private config: AppConfig,
    public fb: FormBuilder,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.client = this.config.get('clients')[this.config.get('clients').client];

    this.MotivosForm = this.fb.group({
      txMot: [null, Validators.compose([
        CustomValidators.number
      ])
      ]
    });

    this.data = this.settings.Motivos.subscribe(motivos => {
      motivos.map(m => {
        this.rows.push({
          "IDMot": m.IdMot,
          "cbMot": 1,
          "Motivo": m.Motivo
        })
      })
      //this.rows = motivos; 
      this.loadingIndicator = false;
    });

  }

  closed(): void {
    if (this.data) {
      this.data.unsubscribe();
    }
    if(this.isErrorSub) {
      this.isErrorSub.unsubscribe();
    }

    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.consService.closeModal(ModalEnum.GETMOTIVOS);
  }

  fnAccion() {

    this.settings.cbMot = [];
    this.selected.forEach(s => {
      let elem = {
        "IdMot": s.IDMot,
        "Cantidad": s.cbMot
      };
      this.settings.cbMot.push(elem);
    });

    this.consService.fnAccion(AccEnum.FINTUR);

    this.isErrorSub = this.consService.IsError().subscribe(isError => {
      if (!isError) {
        this.closed();
      }
    });
  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    this.consService.clearError();
  }

  /*get urgTur() {
    return this.TurnoySerieForm.get('urgTur');
  }*/

  onSelect({ selected }) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    if (typeof selected === 'undefined') {
      return;
    }
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  updateValue(event, cell, rowIndex) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  onActivate(event) {

  }

  Clear() {
    this.isError = false;
  }

  openModal(template: TemplateRef<any>, templateForceMot: TemplateRef<any>) {
    if (this.MotCierre == 'S') {
      if (this.rows.length == 0) {
        this.dialogRef = this.dialog.open(templateForceMot, { data: { class: 'modal-sm' } });
      } else {
        this.fnAccion();
      }

    } else {
      this.dialogRef = this.dialog.open(template, { data: { class: 'modal-sm' } });
    }
  }

  confirm() {
    this.dialogRef.close();
    this.fnAccion();
  }

  decline() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.dialogRef.close();
  }

  confirmMotForce() {

    this.dialogRef.close();
  }

}
