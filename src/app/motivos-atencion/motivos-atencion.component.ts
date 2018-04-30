import { Component, OnInit, ElementRef, ViewChild, SimpleChanges, OnChanges, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { ConsService } from '../services/Cons.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AccEnum, ModalEnum } from '../Models/Enums';
import { MotivosAtencionBusquedaComponent } from '../motivos-atencion-busqueda/motivos-atencion-busqueda.component';
import { MotivosService } from '../services/motivos.service';
import { AppConfig } from '../app.config';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { __MotivoModel, MotivoModel, _MotivoModel, MotivosAtencion, PreMotivo, SMotivosAtencion, SSMotivosAtencion, SSSMotivosAtencion } from '../Models/MotivoModel';
import { ISubscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { resolve } from 'url';
import { reject } from 'q';

@Component({
  selector: 'app-motivos-atencion',
  templateUrl: './motivos-atencion.component.html',
  styleUrls: ['./motivos-atencion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class MotivosAtencionComponent implements OnInit, OnChanges, OnDestroy {

  motivoForm: FormGroup;
  public motivos: __MotivoModel = new __MotivoModel();        // motivos cargados con selected
  public _motivos: MotivoModel = new MotivoModel(); // motivos desde gateway
  public motivoModel: _MotivoModel = new _MotivoModel(); // motivos del form
  public nuevoMotivo: boolean = false;
  public cierreAtencion: boolean = false;
  public busqueda: boolean = false;

  client: any;

  private listMotivos: any[] = [];
  private _listsMotivos: any[] = [];

  public lloading = true;
  public loadingSelect = true;
  public isError: boolean = false;
  public isInternalError: boolean = false;
  public DescError: string = "";

  data: ISubscription;

  constructor(
    public settings: SettingsService,
    private consService: ConsService,
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    public MotivosService: MotivosService,
    private config: AppConfig
  ) {
    this.client = this.config.get('clients')[this.config.get('clients').client];
    //this.motivos.Mot = new BehaviorSubject<Array<MotivosAtencion>>(null);
    //this.motivos.Traf = new Array<PreMotivo>();

    this._motivos.Mot = [];

    this.motivoModel.Mot = new MotivosAtencion();
    this.motivoModel.SMot = new SMotivosAtencion();
    this.motivoModel.SSMot = new SSMotivosAtencion();
    this.motivoModel.SSSMot = new SSSMotivosAtencion();
  }

  ngOnInit() {
    this.motivoForm = this.fb.group({
      cmbTraf: [null, Validators.required],
      Mot: [null],
      SMot: [null],
      SSMot: [null],
      SSSMot: [null]
    });

    this.MotivosService.processMotivos()
    this.motivos = this.MotivosService.GetMotivos();
    if (this.motivos.Traf.length > 0) {
      this.loadingSelect = false;
    }

    this._motivos.Mot = this.motivos.Mot.getValue();
    this._motivos.Traf = this.motivos.Traf;

    this.settings.lastErrorMot.isError.subscribe(value => {
      this.isError = value;
    });

    this.data = this.settings.data.subscribe(value => {
      if (value) {
        this.selectItem(value);
      }
    });
  }

  closed(): void {
    this.bsModalRef.hide();
    this.bsModalRef = null;
  }

  selectItem(value) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    if (typeof this._motivos == 'undefined' || this._motivos.Mot.length == 0) { //bug select
      return;
    }

    this._motivos.Mot.forEach(mot => {
      if (mot.IdMotivo == value.IdMotivo) {
        this.motivoModel.Mot = mot;
        this.motivoModel.Mot.SMot.forEach((t: SMotivosAtencion) => {
          t.SSMot.forEach((m: SSMotivosAtencion) => {
            m.SSSMot.forEach((s: SSSMotivosAtencion) => {
              if (t.IdSMot == value.IdSMot) {
                this.motivoModel.SMot = t;
                this.motivos.SMot = this.motivoModel.Mot.SMot;
              }

              if (m.IdSSMot == value.IdSSMot) {
                this.motivoModel.SSMot = m;
                this.motivos.SSMot = this.motivoModel.SMot.SSMot;
              }

              if (s.IdSSSMot == value.IdSSSMot) {
                this.motivoModel.SSSMot = s
                this.motivos.SSSMot = this.motivoModel.SSMot.SSSMot;
              }

              //this.EnableButtons();
              this.busqueda = false;
              this.nuevoMotivo = true;
              this.cierreAtencion = true;
              return;
            });
          });
        });
      }
    });

  }

  fnAccion(accion: AccEnum) {
    /*this.settings.rbPau.checked.next(true); 
    this.settings.rbPau.value.next(this.rbPau);    
    this.consService.fnAccion(accion);
    this.bsModalRef.hide();*/
  }

  ngOnChanges(changes: SimpleChanges) {
    this.settings.iTOw = this.config.get('socket').TOwin;
  }

  onChange($event) {
    this.settings.iTOw = this.config.get('socket').TOwin;


    if (this.motivoModel.Traf) {
      this.selectItem($event.SSSMot);
    }
    //this.consService.clearError();
  }

  motivoChange(value: MotivosAtencion) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    this.motivos.SMot = [];
    this.motivos.SSMot = [];
    this.motivos.SSSMot = [];

    this.motivoModel.SMot = null;
    this.motivoModel.SSMot = null;
    this.motivoModel.SSSMot = null;

    if (value) {
      this.motivos.SMot = this.motivoModel.Mot.SMot;
    }

    this.EnableButtons();

  }

  SmotivoChange(value: SMotivosAtencion) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    this.motivos.SSMot = [];
    this.motivos.SSSMot = [];

    this.motivoModel.SSMot = null;
    this.motivoModel.SSSMot = null;

    if (value) {
      this.motivos.SSMot = this.motivoModel.SMot.SSMot;
    }
    this.EnableButtons();
  }

  SSmotivoChange(value: SSMotivosAtencion) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    this.motivoModel.SSSMot = null;
    if (value) {
      this.motivos.SSSMot = this.motivoModel.SSMot.SSSMot;
    }

    this.EnableButtons();

  }
  SSSmotivoChange(value) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    this.EnableButtons();
    this.busqueda = false;
  }

  EnableButtons() {
    if (this.motivoModel.Mot) {
      this.busqueda = true;
    }

    if (this.motivoModel.Mot && this.motivoModel.SMot
      && this.motivoModel.SSMot && this.motivoModel.SSSMot) {
      this.nuevoMotivo = true;
      this.cierreAtencion = true;
    }

    let Motivos_QMax = this.client.Motivos_QMax;
    if (this.listMotivos.length >= (Motivos_QMax * 2) - 1) {
      this.nuevoMotivo = false;
      this.busqueda = false;
      this.cierreAtencion = true;
    }

    this.isInternalError = false;
    this.DescError = "";

    //this.settings.lastErrorMot.DescError = "";
    //this.settings.lastErrorMot.isError.next(false);

  }

  /**
   * MOTIVOS DE ATENCION BUSQUEDA
   */
  BusquedaDialog() {
    const initialState = {
      motivoModel: this.motivoModel,
      motivos: this.motivos
    }
    this.bsModalRef = this.modalService.show(MotivosAtencionBusquedaComponent, { initialState });


  }

  NuevoMotivo() {
    this.client = this.config.get('clients')[this.config.get('clients').client];

    let Motivos_QMax = this.client.Motivos_QMax;
    if (this.listMotivos.length < (Motivos_QMax * 2)) {
      let IdMot = this.motivoModel.Mot.IdMotivo;
      let IdSMot = this.motivoModel.SMot.IdSMot;
      let IdSSMot = this.motivoModel.SSMot.IdSSMot;
      let IdSSSMot = this.motivoModel.SSSMot.IdSSSMot;

      let str: any = IdMot + "," + IdSMot + ";" + IdSSMot + "," + IdSSSMot;
      for (let i = 0; i < this._listsMotivos.length; i++) {
        let value = this._listsMotivos[i];
        if (value == str) { // cannot exists
          this.DescError = "Ya se agrego el motivo";
          this.isInternalError = true;

          return;
        }
      }

      this._listsMotivos.push(str);
      str =
        {
          "IdMot": IdMot,
          "Cantidad": IdSMot
        };
      this.listMotivos.push(str);
      str = {
        "IdMot": IdSSMot,
        "Cantidad": IdSSSMot
      };
      this.listMotivos.push(str);

      this.motivos.SMot = [];
      this.motivos.SSMot = [];
      this.motivos.SSSMot = [];

      this.motivoModel.Mot = null;
      this.motivoModel.SMot = null;
      this.motivoModel.SSMot = null;
      this.motivoModel.SSSMot = null;

      this.busqueda = false;
      this.nuevoMotivo = false;
    } else {
      this.nuevoMotivo = false;
    }
  }

  CierreAtencion() {
    this.settings.cbMot = [];
    if (this.listMotivos.length > 0) {
      this.listMotivos.forEach(s => {
        this.settings.cbMot.push(s);
      });
    } else {
      let IdMot = this.motivoModel.Mot.IdMotivo;
      let IdSMot = this.motivoModel.SMot.IdSMot;
      let IdSSMot = this.motivoModel.SSMot.IdSSMot;
      let IdSSSMot = this.motivoModel.SSSMot.IdSSSMot;
      let str =
        {
          "IdMot": IdMot,
          "Cantidad": IdSMot
        };
      this.settings.cbMot.push(str);
      str = {
        "IdMot": IdSSMot,
        "Cantidad": IdSSSMot
      };
      this.settings.cbMot.push(str);
    }

    if (this.settings.cbMot.length > 0) {
      this.consService.fnAccion(AccEnum.FINTUR);
    }

    this.consService.IsError().subscribe(isError => {
      if (!isError) {
        this.bsModalRef.hide();
      } else {
        this.isError = isError;
        this.DescError = this.settings.lastError.DescError;
      }
    });
  }

  ngOnDestroy(): void {
    console.log("motivos ondestroy");
    this.data.unsubscribe();

  }

}
