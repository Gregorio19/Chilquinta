import { Injectable, EventEmitter } from '@angular/core';
import { UserModel } from '../Models/UserModel';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { tElement, tModalElement, MsgError, AccEnum } from '../Models/Enums';
import { MotivoModel } from '../Models/MotivoModel';

@Injectable()
export class SettingsService {
  public sidebarImageIndex = 0;
  public sidebarImageIndexUpdate: EventEmitter<number> = new EventEmitter();
  public sidebarFilter = '#fff';
  public sidebarFilterUpdate: EventEmitter<string> = new EventEmitter();
  public sidebarColor = '#D80B0B';
  public sidebarColorUpdate: EventEmitter<string> = new EventEmitter();

  public lastError: MsgError = new MsgError();
  public lastErrorMot: MsgError = new MsgError();

  public bCnxOK: boolean = false;
  //public bPopup: boolean = false;
  public bTurnoSet: boolean = false;
  public bOfertaSet: boolean = false;
  public bIdCliSet: boolean = false;
  public iTOcnx: number = 0;
  public iTOw: number = -1;
  public iTOpido: number = 0;
  public iDT: number = 0;
  public subacc: AccEnum = AccEnum.UNKNOW;
  public CliInt: string = "";
  public dEspE: any = "";
  public dAte: any = "";
  public sEscEdo: AccEnum = AccEnum.UNKNOW;
  //var mytimer = setInterval("DoTimer()", 1E3);
  public accion: AccEnum;
  public dEspO: any;
  public IdEje: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public sOferta: string;
  public sLogEdo: string = "";
  public sDrvAcc: string;

  /** ENC.js */
  /** @type {number} */
  //var mytimer_e = setInterval("fnEnc_Timer()", 1E3);
  /** @type {number} */
  public iTOe: number = -1;
  public winEnc: string;
  public iEncIdx: string;
  public oEncQ: string;
  public sEncRpt: string;
  public bEncFin: boolean;
  public bEncWait: boolean = false;
  public sEncFase: string = "";
  public sEncAcc: string = "";


  public IdPausaFin: number = 0;

  /** user online */
  public user: BehaviorSubject<UserModel> = new BehaviorSubject<UserModel>(null);
  public isLogged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public hiEsc: string = "";
  public hiUsr: string = "";
  public hiIdS: string = "";
  public hiIdSDRV: string = "";
  public hiTEspAO: string = "";
  public hiTEspAE: string = "";
  public hiTEspC: string = "";
  public hiTEspA: string = "";
  public hiTAteA: string = "";
  public hiFHini: string = "";
  public hiTDelta: number = 0;

  public dEdo: tElement = new tElement();
  public dTEsp: tElement = new tElement();
  
  public btINI: tElement = new tElement();
  public btFIN: tElement = new tElement(); 
  public btPAU: tElement = new tElement(); 
  public btLLE: tElement = new tElement(); 
  public btRLL: tElement = new tElement(); 
  public btNUL: tElement = new tElement(); 
  public btURG: tElement = new tElement(); 
  public btDRV: tElement = new tElement(); 
  public btEnc: tElement = new tElement(); 

  public dOfi: tElement = new tElement();
  public dEsc: tElement = new tElement();
  public dEje: tElement = new tElement();
  public dSer: tElement = new tElement();
  public dLet: tElement = new tElement();
  public dTur: tElement = new tElement();
  public dCli: tElement = new tElement();
  public dRut: tElement = new tElement();  
  public dFon: tElement = new tElement();
  public dNom: tElement = new tElement();
  public dMail: tElement = new tElement();  
  public dTer: tElement = new tElement();
  public dQEspO: tElement = new tElement();
  public dQEspE: tElement = new tElement();
  public dTEspO: tElement = new tElement();
  public dTEspE: tElement = new tElement();
  public dTAte: tElement = new tElement();
  public dMsgEsp: tElement = new tElement();
  public btLOG: tElement = new tElement();
  
  public barra_superior: tElement = new tElement();
  public contenedorLle: tElement = new tElement();
  public contenedorFin: tElement = new tElement();

  public pausa: tElement = new tElement();

  public imgid: tElement = new tElement();

  public rbPau: tElement = new tElement();
  public cbMot: any[] = [];
  public txMot: string[] = [];
  public rbSer: tElement = new tElement();
  public urgTur: tElement = new tElement();
  public rbDrv: tElement = new tElement();

  public fnPopOferta: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public Pausas: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);
  
  public Modal: tModalElement = new tModalElement();

  public Series: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);
  public Motivos: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);

  public Rut: string;
  public Fono: string;
  public FonoTmp: string;

  public motivosStorage: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public _data: BehaviorSubject<any> = new BehaviorSubject<any>(null); //data user in components
  public data = this._data.asObservable();

  public counterDownTimer: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public windowOpen: boolean = false;

  public init() {
    this.btLOG.value.next("Login<i class='fa fa-sign-in' aria-hidden='true'></i>");
    this.btLOG.class.next("btn btn-grey logoff-boton");
    this.pausa.show.next(false);
    //this.lastError.isError.next(false);
    //this.lastErrorMot.isError.next(false);
    this.hiFHini = "";
    this.imgid.class.next("");
    this.contenedorFin.show.next(false);
    this.contenedorLle.show.next(true);
    this.btPAU.disable.next(true);
    this.btINI.disable.next(true);
    this.btLLE.disable.next(true);
    this.btRLL.disable.next(true);
    this.btNUL.disable.next(true);
    this.btDRV.disable.next(true);
    this.btURG.disable.next(true);
    this.imgid.show.next(false);
    this.dTEsp.value.next("");
    this.btEnc.disable.next(true);

    this.dTer.value.next("0");

    this.iTOcnx = 0;
    this.iTOpido = 0;

    this.Modal.show = false;
   }

}
