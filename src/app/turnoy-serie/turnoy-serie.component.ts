import { Component, OnInit, TemplateRef, ContentChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConsService } from '../services/Cons.service';
import { SettingsService } from '../services/settings.service';
import { AccEnum, ModalEnum } from '../Models/Enums';
import { TurnoySerie } from '../Models/TurnoySerie';
import { AppConfig } from '../app.config';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-turnoy-serie',
  templateUrl: './turnoy-serie.component.html',
  styleUrls: ['./turnoy-serie.component.scss']
})

export class TurnoySerieComponent implements OnInit, OnDestroy {
  TurnoySerieForm: FormGroup;
  model = new TurnoySerie();

  client: any;

  private dialogRef;

  private isError: ISubscription;

  constructor(
    private consService: ConsService,
    public settings: SettingsService,
    public fb: FormBuilder,
    private config: AppConfig,
    private dialog: MatDialog
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
    if(this.isError) {
      this.isError.unsubscribe();
    }
    
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.consService.closeModal(ModalEnum.GETSERIES_URGSER);
  }

  fnAccion(accion: AccEnum) { //accion: urgset
    this.settings.rbSer.checked.next(true);
    this.settings.rbSer.value.next(this.model.rbSer);
    this.settings.urgTur.value.next(this.model.urgTur.toString());
    this.consService.fnAccion(accion);
    this.isError = this.consService.IsError().subscribe(isError => {
      if (!isError) {
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
          this.dialogRef = this.dialog.open(template, { data: { class: 'modal-sm' } })
        } else {
          this.confirm();
        }
      } else {
        if (!this.settings.lastError.isError.getValue()) {
          this.confirm();
        }


      }

    } else {
      if (!this.settings.lastError.isError.getValue()) {
        this.confirm();
      }
    }

  }

  confirm() {
    this.fnAccion(AccEnum.URGSET);

    //this.closed();
  }

  decline() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if(this.isError) {
      this.isError.unsubscribe();
    }
    
  }
  
}
