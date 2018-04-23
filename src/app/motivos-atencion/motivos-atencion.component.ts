import { Component, OnInit, ElementRef, ViewChild, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { ConsService } from '../services/Cons.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AccEnum } from '../Models/Enums';
import { MotivosAtencionBusquedaComponent } from '../motivos-atencion-busqueda/motivos-atencion-busqueda.component';
import { MotivosService } from '../services/motivos.service';
import { AppConfig } from '../app.config';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { __MotivoModel, MotivoModel, _MotivoModel, MotivosAtencion, PreMotivo, SMotivosAtencion, SSMotivosAtencion, SSSMotivosAtencion } from '../Models/MotivoModel';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-motivos-atencion',
  templateUrl: './motivos-atencion.component.html',
  styleUrls: ['./motivos-atencion.component.scss']
})
export class MotivosAtencionComponent implements OnInit, OnChanges, OnDestroy {
  
  motivoForm: FormGroup;
  public motivos: __MotivoModel = new __MotivoModel();        // motivos cargados con selected
  public _motivos: MotivoModel = new MotivoModel(); // motivos desde gateway
  public motivoModel: _MotivoModel = new _MotivoModel(); // motivos del form
  public nuevoMotivo: boolean = false;
  public cierreAtencion: boolean = false;
  public busqueda: boolean = false;
  
  private client: any;

  private listMotivos: any[] = [];
  private _listsMotivos: any[] = [];

  public lloading = true;
  public loadingSelect = true;
  public isError: boolean  = false;
  public isInternalError: boolean  = false;
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
    this.motivos.Traf = new Array<PreMotivo>();
   
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

      if(!this.MotivosService.isLogged && !this.settings.motivosStorage.getValue()) {
        if(this.client.MotivosExt) {
          this.MotivosService.AccLGO(); //bugs websocketd doesn't disconnect
          this.MotivosService.AccLGISET(this.consService.loginModel);
          this.MotivosService.AccMotivos();
        } 
      }

      this.settings.motivosStorage.subscribe((value: MotivoModel) => {
        if(value) {
           
          this._motivos = value;       
          try {
            let Mot: Array<MotivosAtencion> = [];
            
            for(let i =0 ; i < value.Mot.length; i ++) {
              let mot = value.Mot[i];
              //value.Mot.forEach(mot => {
              let serieId = parseInt(this.settings.hiIdS);
              let exists: boolean = mot.Series.some(x => x==serieId);
              if(exists) {
                //this.motivos.Mot.push(mot);
                Mot.push(mot);
                mot.SMot.forEach(sm => {
                  sm.SSMot.forEach(ssm => {
                    ssm.SSSMot.forEach(sssm => {                    
                      if(sssm.fPreMot && sssm.PreMotAlias != "")  {
                        let Traf = new PreMotivo();
                        Traf.fPreMot = sssm.fPreMot;
                        Traf.PreMotAlias = sssm.PreMotAlias;
                        Traf.Mot = mot;
  
                        Traf.SMot = sm;
                        Traf.SSMot = ssm;
                        Traf.SSSMot = sssm;
                        this.motivos.Traf.push(Traf);
                      }
                    })
                  })
                })
              }
            //});  
            }
            this.loadingSelect = false;
            this.motivos.Mot = new BehaviorSubject<Array<MotivosAtencion>>(Mot);
            
          } catch(e) {
            console.log("", e);
          }   
          
        } else {
          this.settings.lastErrorMot.DescError = "Error comunicación con el servidor";
          this.settings.lastErrorMot.isError.next(true);
          this.isError = true;
          this.loadingSelect = false;
          
          this.nuevoMotivo = false;
          this.cierreAtencion = false;
          this.busqueda = false;  
          
        }
      }, err => {
        console.log("", err);
      });

      this.settings.lastErrorMot.isError.subscribe(value => {
          this.isError = value;
      });
      
      this.data = this.settings.data.subscribe(value  => {
        if(value) {         
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
    if(typeof this._motivos == 'undefined' || this._motivos.Mot.length == 0) { //bug select
      return;
    }
    
      this._motivos.Mot.forEach(mot => {
        if(mot.IdMotivo == value.IdMotivo) {
          this.motivoModel.Mot = mot;
        
          this.motivoModel.Mot.SMot.forEach((t: SMotivosAtencion) => {
            t.SSMot.forEach((m: SSMotivosAtencion) => {
              m.SSSMot.forEach((s: SSSMotivosAtencion) => {
                  if(t.IdSMot == value.IdSMot) {
                    this.motivoModel.SMot = t;
                    this.motivos.SMot = this.motivoModel.Mot.SMot;                    
                  }
                  
                  if(m.IdSSMot == value.IdSSMot) {
                    this.motivoModel.SSMot = m;
                    this.motivos.SSMot = this.motivoModel.SMot.SSMot;
                  }
                  
                  if(s.IdSSSMot == value.IdSSSMot) {
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

    if(this.motivoModel.Traf) {
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
    
      if(value) {
        this.motivos.SMot = this.motivoModel.Mot.SMot;
      }

      this.EnableButtons();
    
  }

  SmotivoChange(value:SMotivosAtencion) {
    this.settings.iTOw = this.config.get('socket').TOwin;

      this.motivos.SSMot = [];  
      this.motivos.SSSMot = [];  

      this.motivoModel.SSMot = null;
      this.motivoModel.SSSMot = null;
    
      if(value) {        
        this.motivos.SSMot = this.motivoModel.SMot.SSMot;
      }
      this.EnableButtons();
  }

  SSmotivoChange(value:SSMotivosAtencion) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    this.motivoModel.SSSMot = null;
      if(value) {
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
    if(this.motivoModel.Mot) {
      this.busqueda = true;
    }

    if (this.motivoModel.Mot && this.motivoModel.SMot 
    && this.motivoModel.SSMot && this.motivoModel.SSSMot) {
      this.nuevoMotivo = true;
      this.cierreAtencion = true;
    }

    let Motivos_QMax = this.client.Motivos_QMax;
    if(this.listMotivos.length >= (Motivos_QMax * 2) - 1 ) {
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
    if(this.listMotivos.length < (Motivos_QMax * 2) ) {
      let IdMot = this.motivoModel.Mot.IdMotivo;
      let IdSMot = this.motivoModel.SMot.IdSMot;
      let IdSSMot = this.motivoModel.SSMot.IdSSMot;
      let IdSSSMot = this.motivoModel.SSSMot.IdSSSMot;

      let str: any = IdMot + "," + IdSMot + ";" + IdSSMot + "," + IdSSSMot;
      for(let i=0; i < this._listsMotivos.length; i++) {
        let value = this._listsMotivos[i];
        if(value==str) { // cannot exists
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
    if(this.listMotivos.length > 0) {
      this.settings.cbMot = [];
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

    if(this.settings.cbMot.length > 0) {
      this.consService.fnAccion(AccEnum.FINTUR);
    }
    
    this.settings.lastError.isError.subscribe(isError => {
      if(!isError) {
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
