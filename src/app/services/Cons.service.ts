import { Injectable, Inject, PLATFORM_ID, Injector } from '@angular/core'
import { SettingsService } from './settings.service';
import { LoginModel } from '../Models/LoginModel';
import { WebsocketService } from './Websocket.service';
import { Subscription } from 'rxjs/Subscription';
import { CookieService } from 'ngx-cookie-service';
import { ActionEnum, ModalEnum, AccEnum, MsgError } from '../Models/Enums';
import { UserModel } from '../Models/UserModel';
//import { Observable } from 'rxjs/Observable';
import { Observable, Subject } from 'rxjs';
import { ProtoModel } from '../Models/ProtoModel';
import { ValueTransformer } from '@angular/compiler/src/util';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { PushNotificationsService } from 'ng-push';
import { AppConfig } from '../app.config';
import { isPlatformBrowser } from '@angular/common';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { Action } from 'rxjs/scheduler/Action';
import { ChilquintaService } from './chilquinta.service';
import { Turno } from '../Models/chilquintaturno';
import { RespuestaLog } from '../Models/RespuestaLog';
import { TurnoySerie } from '../Models/TurnoySerie';

@Injectable()
export class ConsService extends WebsocketService {
    openIdeditModal: boolean = false;
    private sCookie: string = "TPsoftV24consWS2";
    private socketSubscription: Subscription;
    public loginModel: LoginModel;
    public excepcionModel: TurnoySerie;
    private _pushNotifications: PushNotificationsService

    private timer = TimerObservable.create(0, 1000);
    private timerSubscription: Subscription;

    private timerRellamado: any;
    private timerSubscriptionRellamado: Subscription;
    private firsTickTimer: Boolean = false;
    private contRellamados: number = 0;

    private bLlamaSet: Boolean = false;
    private client: any;
    private bEncCurso: boolean = false;
    private iTAte: number = 0;
    errorMessage: String;
    public datos_message: Array<any>;

    private enableUrg: boolean = true;

    private bActivarRellamado: boolean = true;

    private messageTurn: BehaviorSubject<string> = new BehaviorSubject<string>("");
    private stateUrg: boolean = false;
    private statePausa: boolean = false;

    constructor(
        //private socket: WebsocketService,        
        public settings: SettingsService,
        private cookieService: CookieService,
        private config: AppConfig,
        @Inject(PLATFORM_ID) platformId: string,
        private injector: Injector,
        private ChilquintaService: ChilquintaService,
    ) {
        super();
        this.loginModel = new LoginModel();

        this.client = this.config.get('clients')[this.config.get('clients').client];
        console.log( this.config.get('clients').client + "aqui");
        this.timerRellamado = TimerObservable.create(0, this.client.TbloqueoRellamado);

        try {
            //this._pushNotifications.requestPermission();
            if (isPlatformBrowser(platformId)) {
                //inject service only on browser platform
                this._pushNotifications = this.injector.get(PushNotificationsService);
                this._pushNotifications.requestPermission();
            }
        } catch (Exception) {

        }
        this.start();

    }

    private start() {
        var d = new Date();
        //console.log(d);
        console.log(d, "Inicio de Consultora");
        this.settings.init();

        this.connect(this.config.get('socket').url);
        //environment.params.ConfirmaID = environment.params.ConfirmaID.toUpperCase();
        //environment.params.MotCierre = environment.params.MotCierre.toUpperCase();

        this.settings.barra_superior.class.next("barra_superior_verde");
        if (!this.config.get('poll').EncOK) {
            /*
            m = document.getElementById("btEnc");
            m.style.opacity = 0;
            m.style.filter = "alpha(opacity=0)";
            m.style.pointerEvents = "none";
            */
        } else {
            if (this.settings.sEncFase == "") {
                //fnEnc_Open();
            }
        }

        this.open.subscribe((open: boolean) => {
            if (open) {
                var d = new Date();
                //console.log(d);
                console.log(d, "connection open");
                this.settings.bCnxOK = true;
                let name = this.cookieService.get(this.sCookie);
                if (typeof name != 'undefined' && name) {
                    let tmp = name.split(",");

                    this.settings.hiEsc = tmp[0];
                    this.settings.hiUsr = tmp[1];
                    this.fnAccion(AccEnum.EDB);
                } else {
                    this.fnAccion(AccEnum.LGI);
                }
            } else {
                this.settings.iTOcnx = 2;

                //this.restart();
            }

        });

        this.socketSubscription = this.messages.subscribe((message: string) => {
            var m = JSON.parse(message);
            var d = new Date();
            this.datos_message = m;
            //console.log(d);
            console.log(this.config.get('clients').client);
            console.log(d, "rsp = %s", message);
            if (m.CodError != "0") {
                console.log("entre al codigo error distinto de 0");
                //this.settings.iTOcnx = 2;

                if (m.CodError == 13022 && m.DescError == "Error en Login") {
                    if (this.settings.Modal.self.getValue() != ModalEnum.LOGIN) {
                        this.loginModel = new LoginModel();
                        this.settings.isLogged.next(false);
                        this.cookieService.delete(this.sCookie);
                        this.fnAccion(AccEnum.LGI);
                        return;
                    }
                }

                //error en urgencia
                /* if (m.CodError == "13029" && m.DescError == "Turno previamente atendido") {
                      console.log("entre al codigo de error de urgencias antes del if setting modal");
                      this.settings.lastError.MsgType = m.MsgType;
                      this.settings.lastError.CodError = m.CodError;
                      this.settings.lastError.DescError = m.DescError;
                      this.settings.lastError.isError.next(true);
                      this.openModal(ModalEnum.ERROR);                    
                      console.log("entre al codigo de error de urgencias");
                      this.fnAccion(AccEnum.URGSER);
                      return;                                 
                  }*/

                this.settings.accion = AccEnum.UNKNOW;
                this.settings.subacc = AccEnum.UNKNOW;

                // LAUNCH error
                this.settings.lastError.MsgType = m.MsgType;
                this.settings.lastError.CodError = m.CodError;
                this.settings.lastError.DescError = m.DescError;
                this.settings.lastError.isError.next(true);

                this.settings.iTOw = -1;

                if (!this.settings.Modal.show) {
                    this.openModal(ModalEnum.ERROR);
                } else if (m.MsgType == ActionEnum.LOGIN) {
                    if (m.CodError == "13022" && !this.settings.Modal.show) {
                        this.openModal(ModalEnum.CONFEJE);
                    } else if (this.settings.Modal.self.getValue() != ModalEnum.LOGIN) {
                        this.settings.isLogged.next(false);
                        if (!this.settings.Modal.show) {
                            this.fnAccion(AccEnum.LGI);
                        }

                    }

                }
                /*else if (m.MsgType == ActionEnum.URGENCIA) {
                    this.messageTurn.next(m.DescError);
                    this.closeModal(this.settings.Modal.self.getValue());
                    this.openModal(ModalEnum.MSGURGTURN);
                }*/

                return;
            }

            this.stateUrg = false;
            this.statePausa = false;
            //this.clearError();

            switch (m.MsgType) {
                case ActionEnum.LOGIN:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : LOGIN");
                    this.LOGIN(m);
                    break;
                case ActionEnum.LOGOFF:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : LOGOFF");
                    this.LOGOFF(m);
                    break;
                case ActionEnum.GETEDOBASE:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : GETEDOBASE");
                    if (!this.GETEDOBASE(m)) {
                        if (!this.settings.isLogged.getValue()) {
                            this.clearError();
                            this.openModal(ModalEnum.LOGIN);
                        }

                        return false;
                    }
                    break;
                case ActionEnum.GETEDOSESION:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : GETEDOSESION  acc =", this.settings.accion);
                    this.GETEDOSESION(m);
                    break;
                case ActionEnum.GETPAUSAS:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : GETPAUSAS");
                    this.GETPAUSAS(m);
                    break;
                case ActionEnum.SETPAUSA:
                    this.statePausa = true;
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : SETPAUSA");
                    this.settings.subacc = AccEnum.UNKNOW;
                    break;
                case ActionEnum.GETSERIES:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : GETSERIES");
                    this.GETSERIES(m);
                    break;
                case ActionEnum.GETMOTIVOS:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : GETMOTIVOS");
                    this.GETMOTIVOS(m);
                    break;
                case ActionEnum.PIDOTURNO:

                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : PIDOTURNO");
                    return this.PIDOTURNO(m);
                case ActionEnum.RELLAMO:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : RELLAMO");
                    break;
                case ActionEnum.ANULO:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : ANULO");
                    break;
                case ActionEnum.FINTURNOPAUSA:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : FINTURNOPAUSA");
                    if (!this.FINTURNOPAUSA(m)) {
                        return false;
                    }
                    break;
                case ActionEnum.PROCESOTURNO:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : PROCESOTURNO");
                    this.settings.sEncRpt = "";
                    this.settings.bEncFin = false;
                    this.settings.bTurnoSet = true;
                    /*if (this.settings.OfertaTipo !== "" || this.settings.CliInt == "ABCDIN") {
                        bOfertaSet = true
                    }*/
                    this.settings.imgid.show.next(true);
                    this.settings.imgid.disable.next(false);
                    break;
                case ActionEnum.FINTURNO:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : FINTURNO");
                    if (!this.FINTURNO(m)) {
                        return false;
                    }
                    break;
                case ActionEnum.DERIVOTURNO:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : DERIVOTURNO");
                    if (!this.DERIVOTURNO(m)) {
                        return false;
                    }
                    break;
                case ActionEnum.URGENCIA:
                    var d = new Date();
                    //console.log(d);
                    this.stateUrg = true;
                    console.log(d, "R : URGENCIA");
                    this.URGENCIA(m);
                    break;
                case ActionEnum.SETIDC:
                    var d = new Date();
                    //console.log(d);
                    console.log(d, "R : SETIDC");
                    this.closeModal(ModalEnum.IDEDIT);
                    break;
            }
            if (!this.settings.Modal.show) {
                let dEdo: AccEnum = <AccEnum>AccEnum[this.settings.dEdo.value.getValue()];
                console.log("cuarto modal show, valor de dEdo ", dEdo);
                if (dEdo != AccEnum.LOGOFF &&
                    (this.settings.accion != AccEnum.EDS && this.settings.accion != AccEnum.LGO)) {
                    this.fnAccion(AccEnum.EDS);
                }
                this.fnView(dEdo);
            }

        },
            (error) => {
                // LAUNCH error
                /*this.settings.lastError.MsgType = m.MsgType;
                this.settings.lastError.CodError = m.CodError;
                this.settings.lastError.DescError = m.DescError;*/
                this.settings.lastErrorMot.DescError = "Error comunicación con el servidor";
                this.settings.lastErrorMot.isError.next(true);

                if (!this.open) {
                    this.restart();
                }

            });

        // Timer
        this.timerSubscription = this.timer.subscribe(t => this.DoTimer(t));
    }

    clearError() {
        // CLEAR error
        var d = new Date();
        //console.log(d);
        console.log(d, "clearError");
        this.settings.lastError.MsgType = null;
        this.settings.lastError.CodError = null;
        this.settings.lastError.DescError = null;
        this.settings.lastError.isError.next(false);

        //this.settings.lastError = new MsgError();
    }

    public fnAccion(accion: AccEnum, ...args: any[]) {
        var d = new Date();
        //console.log(d);
        console.log(d, "fnAccion", accion);

        this.clearError();

        let name = "0";
        let ch = "";
        this.settings.accion = accion;
        var d = new Date();
        //console.log(d);
        console.log(d, "valor accion settings: ", this.settings.accion);
        if (this.settings.accion == AccEnum.LOG) {
            if (typeof this.settings.sLogEdo != 'undefined' && this.settings.sLogEdo) {
                this.settings.accion = this.settings.sLogEdo == "Login" ? AccEnum.LGI : AccEnum.LGO;
                //console.log("valor accion settings AccEnumLOG: ", this.settings.accion);
            } else {
                //console.log("valor accion settings AccEnumLOG(else): ", this.settings.accion);
                this.settings.accion = AccEnum.LGI;
            }
        }
        if (this.settings.sEscEdo == AccEnum.ATENDIENDO &&
            (this.settings.accion == AccEnum.FIN ||
                this.settings.accion == AccEnum.LGO ||
                this.settings.accion == AccEnum.PAUGET ||
                this.settings.accion == AccEnum.URGSER))/* ||
                this.settings.accion == AccEnum.DRVSER))*/ {

            if (!this.settings.btEnc.disable.getValue()) {
                //fnEnc_Start();
                //fnEnc_Wait();                
                this.settings.sEncAcc = accion;
                //console.log("valor accion sEncACC: ", this.settings.sEncAcc);
                return false;
            } else {

                if (this.config.get('poll').EncOK && (this.settings.oEncQ.length > 0 && !this.settings.bEncFin)) {
                    //fnEnc_Wait();
                    this.settings.sEncAcc = accion;
                    //console.log("valor accion sEncACC en el if poll: ", this.settings.sEncAcc);
                    return false;
                } else {
                    if (accion != AccEnum.FIN) {
                        this.settings.subacc = accion;
                        this.settings.accion = AccEnum.FIN;
                        var d = new Date();
                        /*
                        //console.log(d);
                        //console.log("valor subaccion en else del poll: ", this.settings.subacc);
                        //console.log("valor accion en else del poll: ", this.settings.accion);
                        */
                    }
                }
            }
        } else {
            if (this.settings.sEscEdo == AccEnum.LLAMANDO && this.settings.accion == AccEnum.PAUGET) {
                this.settings.subacc = accion;
                this.settings.accion = AccEnum.NUL;
                // console.log("valor subaccion llamando y pauget: ", this.settings.subacc);
                //console.log("valor accion llamando y pauget: ", this.settings.accion);
            } else if (this.settings.sEscEdo == AccEnum.ATENDIENDO &&
                (this.settings.accion == AccEnum.DRVSET)) {
                this.settings.subacc = accion;
                this.settings.accion = AccEnum.FIN;
                //console.log("valor else subaccion llamando y pauget: ", this.settings.subacc);
                //console.log("valor else accion llamando y pauget: ", this.settings.accion);
            }
        }

        //this.settings.lastError = new MsgError();
        var d = new Date();
        //console.log(d);
        console.log(d, "Accion Case: ", this.settings.accion);
        console.log(d, "Sub-Accion Case: ", this.settings.subacc);
        switch (this.settings.accion) {
            case AccEnum.EDB:
                this.AccEDB();
                break;
            case AccEnum.EDS:
                if (!this.AccEDS()) {
                    return false;
                }
                break;
            case AccEnum.LGI:
                this.clearError();
                this.openModal(ModalEnum.LOGIN);
                /*this.settings.Modal.show.next(true);
                this.settings.Modal.self.next(ModalEnum.LOGIN);                */
                // func component login
                return false;
            case AccEnum.LGISET:
                /*this.settings.Modal.show.next(false);
                this.AccLGISET();*/
                // func component login
                break;
            case AccEnum.LGO:
                this.AccLGO();
                break;
            case AccEnum.INI:
                this.AccINI();
                break;
            case AccEnum.FIN:
                var d = new Date();
                //console.log(d);
                //console.log("accion al entrar a FIN: ", this.settings.accion);
                this.AccFIN();
                break;
            case AccEnum.FINTUR:
                this.AccFINTUR();
                break;
            case AccEnum.FINTURPAUSA:
                if (this.settings.CliInt == "FALASACBOD" && args[1] != undefined) {
                    name = arguments[1];
                }
                this.AccFINTURPAUSA(name);
                break;
            case AccEnum.PAUGET:
                var d = new Date();
                //console.log(d);            
                //console.log("idPausaFin pauget: ", this.settings.IdPausaFin);                                              
                //console.log("accion al entrar a pauget: ", this.settings.accion);
                this.AccPAUGET();
                break;
            case AccEnum.PAUSET:
                if (this.settings.CliInt == "FALASACBOD" && args[1] != undefined) {
                    name = arguments[1];
                }
                this.AccPAUSET(name);
                break;
            case AccEnum.LLE:
                this.AccLLE();
                break;
            case AccEnum.RLL:
                if (this.bActivarRellamado == false) {
                    this.bActivarRellamado = false;
                    this.settings.btRLL.disable.next(true);
                    return;
                }

                this.contRellamados++;
                this.bActivarRellamado = false;
                this.firsTickTimer = false;
                this.settings.btRLL.disable.next(true);
                this.timerSubscriptionRellamado = this.timerRellamado.subscribe(t => this.ActivarRellamado(t));
                this.AccRLL();

                break;
            case AccEnum.NUL:
                this.AccNUL();
                break;
            case AccEnum.URGSER:
                this.AccURGSER();
                break;
            case AccEnum.URGSET:
                this.AccURGSET(name);
                break;
            case AccEnum.DRVSER:
                this.AccDRVSER();
                break;
            case AccEnum.DRVSET:
                this.AccDRVSET(name, ch);
                break;
            case AccEnum.SID:
                this.AccSID();
                break;
        }
    }

    private fnView(xhtml: AccEnum) {
        var d = new Date();
        //console.log(d);
        console.log(d, "Vista: ", xhtml, this.settings.sEscEdo);
        if (this.settings.sEscEdo == xhtml) {
            return false;
        }
        switch (xhtml) {
            case AccEnum.LOGOFF:
                this.loginModel = new LoginModel();
                this.settings.isLogged.next(false);
                this.settings.btINI.disable.next(true);
                this.settings.btFIN.disable.next(true);
                this.settings.btPAU.disable.next(true);
                this.settings.btLLE.disable.next(true);
                this.settings.btRLL.disable.next(true);
                this.settings.btNUL.disable.next(true);
                this.settings.btAGEN.disable.next(true);
                this.settings.btURG.disable.next(!this.enableUrg);
                this.settings.btDRV.disable.next(true);
                this.settings.btEnc.disable.next(true);
                this.settings.dOfi.value.next("");
                this.settings.dEsc.value.next("");
                this.settings.dEje.value.next("");
                this.settings.dSer.value.next("");
                this.settings.dLet.value.next("");
                this.settings.dTur.value.next("");
                this.settings.dCli.value.next("");
                this.settings.dRut.value.next("");
                this.settings.dFon.value.next("");
                this.settings.dQEspO.value.next("");
                this.settings.dQEspE.value.next("");
                this.settings.dTEspO.value.next("");
                this.settings.dTEspE.value.next("");
                this.settings.barra_superior.value.next("barra_superior_gris");
                break;
            case AccEnum.PAUSA:
                this.settings.btINI.disable.next(false);
                this.settings.btFIN.disable.next(true);
                this.settings.btPAU.disable.next(true);
                this.settings.btLLE.disable.next(true);
                this.settings.btRLL.disable.next(true);
                this.settings.btNUL.disable.next(true);
                this.settings.btAGEN.disable.next(true);
                this.settings.btURG.disable.next(!this.enableUrg);
                this.settings.btDRV.disable.next(true);
                this.settings.btEnc.disable.next(true);
                this.settings.dLet.value.next("");
                this.settings.dTur.value.next("");
                this.settings.dCli.value.next("");
                this.settings.dRut.value.next("");
                this.settings.dFon.value.next("");
                this.settings.barra_superior.value.next("barra_superior_gris");
                break;
            case AccEnum.ESPERANDO:
                this.settings.btINI.disable.next(true);
                this.settings.btFIN.disable.next(true);
                this.settings.btPAU.disable.next(false);
                this.settings.btLLE.disable.next(true);
                this.settings.btRLL.disable.next(true);
                this.settings.btNUL.disable.next(true);
                this.settings.btURG.disable.next(!this.enableUrg);
                this.settings.btDRV.disable.next(true);
                this.settings.btEnc.disable.next(true);
                this.settings.dLet.value.next("");
                this.settings.dTur.value.next("");
                this.settings.dCli.value.next("");
                this.settings.dRut.value.next("");
                this.settings.dFon.value.next("");
                this.settings.barra_superior.value.next("barra_superior_verde");
                break;
            case AccEnum.LLAMANDO:
                this.settings.btINI.disable.next(true);
                this.settings.btFIN.disable.next(true);
                this.settings.btPAU.disable.next(false);
                this.settings.btLLE.disable.next(false);
                if (!this.bActivarRellamado) {
                    this.settings.btRLL.disable.next(true);
                } else {
                    this.settings.btRLL.disable.next(false);
                }
                this.settings.btNUL.disable.next(false);

                if (this.client.ForceMotUrg) {
                    this.settings.btURG.disable.next(false);
                } else {
                    this.settings.btURG.disable.next(!this.enableUrg);
                }

                this.settings.btDRV.disable.next(true);
                this.settings.btEnc.disable.next(true);
                this.settings.barra_superior.value.next("barra_superior_verde");
                this.settings.contenedorLle.show.next(true);
                this.settings.contenedorFin.show.next(false);
                break;
            case AccEnum.ATENDIENDO:
                this.settings.btINI.disable.next(true);
                this.settings.btFIN.disable.next(false);
                this.settings.btPAU.disable.next(false);
                this.settings.btLLE.disable.next(true);
                this.settings.btRLL.disable.next(true);
                this.settings.btNUL.disable.next(true);

                this.settings.btAGEN.disable.next(false);

                //if (this.config.get('clients').client == "BcoBCI") { }

                if (this.client.ForceMotUrg) {
                    this.settings.btURG.disable.next(false);
                } else {
                    this.settings.btURG.disable.next(!this.enableUrg);
                }


                this.settings.btDRV.disable.next(parseInt(
                    this.settings.dTur.value.getValue()
                ) < 0);

                this.settings.btEnc.disable.next(!this.config.get('poll').EncOK || (this.settings.oEncQ.length <= 0 || this.settings.sEncRpt != ""));
                this.settings.barra_superior.value.next("barra_superior_verde");
                this.settings.contenedorLle.show.next(false);
                this.settings.contenedorFin.show.next(true);
                let hiFHini: string = this.settings.hiFHini;

                if (hiFHini != '') { // && moment(hiFHini).isValid()) {
                    //this.settings.dAte = moment(hiFHini);
                    this.settings.dAte = new Date(
                        parseInt(hiFHini.substring(0, 4)),
                        parseInt(hiFHini.substring(5, 7)) - 1,
                        parseInt(hiFHini.substring(8, 10)),
                        parseInt(hiFHini.substring(11, 13)),
                        parseInt(hiFHini.substring(14, 16)),
                        parseInt(hiFHini.substring(17, 19)),
                        0);
                } else {
                    this.settings.dAte = "";
                }
                break;
        }
        if (xhtml == AccEnum.PAUSA) {
            this.settings.pausa.show.next(false);
        } else {
            this.settings.pausa.show.next(true);
        }
        if (xhtml != AccEnum.ATENDIENDO) {
            this.settings.dAte = "";
            this.settings.dTAte.value.next("");
        }
        if (xhtml != AccEnum.LLAMANDO) {
            this.settings.dMsgEsp.value.next("");
        }
        this.settings.dEdo.value.next(xhtml);
        this.settings.sEscEdo = xhtml;
        this.settings.sLogEdo = (xhtml == AccEnum.LOGOFF ? "Login" : "Logoff");
        this.settings.btLOG.value.next(this.settings.sLogEdo + ' <i class="fa fa-sign-in" aria-hidden="true"></i>');
        this.settings.btLOG.class.next(xhtml == AccEnum.LOGOFF ? "login-boton" : "logoff-boton");
    }

    restart() {
        //var d = new Date();
        //console.log(d);
        //console.log("re connection");
        this.open = null;
        this.messages = null;
        this.start();
    }

    /**
     * TIMER
     */

    ActivarRellamado(t) {
        if (!this.firsTickTimer) {
            this.firsTickTimer = true;
            return;
        } else { //al segunto tick se desbloquea el boton
            if (this.contRellamados >= this.client.MaxRellamados) {
                this.bActivarRellamado = false;
                this.settings.btRLL.disable.next(true);
                this.timerSubscriptionRellamado.unsubscribe();
                return;
            }
            this.bActivarRellamado = true;
            this.settings.btRLL.disable.next(false);
            this.timerSubscriptionRellamado.unsubscribe();
        }
    }

    DoTimer(t) {
        //let defaultCenturyStart = moment();
        let now = new Date();

        /*if (!this.open.getValue()) {
            if (this.settings.Modal.self.getValue() != ModalEnum.ERROR) {
                this.restart();
            }
        }*/
        //!this.client.usetimout
        if (this.settings.iTOpido > 0) {
            this.settings.iTOpido--;
        }
        if (!this.settings.bCnxOK || this.settings.sEscEdo == AccEnum.LOGOFF) {
            return;
        }
        if (typeof this.settings.dEspO !== "undefined" && this.settings.dEspO != "") {
            //let diff = moment().diff(this.settings.dEspO);

            //mtime = (defaultCenturyStart.getTime() - this.settings.dEspO.getTime()) / 1E3;

            let diff: number = (now.getTime() - this.settings.dEspO.getTime()) / 1000;
            this.s_2_hms(this.settings.dTEspO, diff, parseInt(this.settings.hiTEspAO));
        }
        if (typeof this.settings.dEspE !== "undefined" && this.settings.dEspE != "") {
            //mtime = (defaultCenturyStart.getTime() - this.settings.dEspE.getTime()) / 1E3;
            ///let diff = moment().diff(this.settings.dEspE);
            let diff: number = (now.getTime() - this.settings.dEspE.getTime()) / 1000;
            this.s_2_hms(this.settings.dTEspE, diff, parseInt(this.settings.hiTEspAE));
        }
        if (typeof this.settings.dAte !== "undefined" && this.settings.dAte != "") {
            //let diff = moment().diff(this.settings.dAte);
            //mtime = (defaultCenturyStart.getTime() - this.settings.dAte.getTime() / 1E3) - this.settings.hiTDelta;
            let diff: number = ((now.getTime() - this.settings.dAte.getTime()) / 1000) - this.settings.hiTDelta;
            this.s_2_hms(this.settings.dTAte, diff, parseInt(this.settings.hiTAteA));
        }
        if (this.settings.sEscEdo == AccEnum.ESPERANDO && this.settings.subacc != AccEnum.UNKNOW) {
            if (this.settings.subacc != AccEnum.X && !this.settings.Modal.show) {
                console.log("septimo modal show, valor de subacc ", this.settings.subacc);
                this.fnAccion(this.settings.subacc);
            }
        } else {
            var d = new Date();
            //console.log(d);
            if (this.settings.sEscEdo == AccEnum.ESPERANDO && (parseInt(this.settings.dQEspE.value.getValue()) > 0 && this.settings.iTOpido == 0) && this.settings.accion != AccEnum.PAUSET && !this.stateUrg && !this.statePausa) {
                var d = new Date();
                //console.log(d);
                //console.log('Pedir turno: en doTimer');

                if (!this.settings.Modal.show) {
                    var d = new Date();
                    //console.log(d);
                    console.log(d, 'accion INI por timer para pedir turno');

                    this.fnAccion(AccEnum.INI);
                }

            } else {
                if (this.settings.sEscEdo == AccEnum.LLAMANDO) {
                    //this.settings.dMsgEsp.style.color = "red";
                    this.settings.dMsgEsp.class.next('text-danger');
                    if (this.settings.iTOw < 0) {
                        this.settings.iTOw = parseInt(this.settings.hiTEspC);
                    }
                    this.settings.dMsgEsp.value.next("Anulación en " + this.settings.iTOw + " [seg]");
                    if (this.settings.iTOw-- == 0) {
                        if (this.client.ConsTimeOut == false) {
                            this.settings.iTOw = parseInt(this.settings.hiTEspC);
                        } else {
                            this.fnAccion(AccEnum.NUL);
                        }
                    }
                    setTimeout(() => {
                        if (!this.settings.Modal.show) {
                            console.log("noveno modal show, se llama a eds ");
                            this.fnAccion(AccEnum.EDS);
                        }
                    }, 3000);
                } else {
                    if (!this.settings.Modal.show) {
                        console.log("decimo modal show, se llama a eds");
                        if (!(this.settings.iDT++ % 10)) {
                            this.fnAccion(AccEnum.EDS);
                        }
                    }
                }
            }
        }
        if (this.settings.Modal.show && this.settings.Modal.self.getValue() != ModalEnum.ERROR) {
            console.log("11 modal show, ");
            if (this.settings.iTOw-- == 0) {
                console.log("11 modal show, valor de itow ", this.settings.iTOw);
                if (this.settings.Modal.self.getValue() != ModalEnum.LOGIN) {
                    console.log("11 modal show, pasamos condicion de login");
                    if (this.client.UseTimeout) {
                        this.closeModal(this.settings.Modal.self.getValue());
                        this.settings.iTOw = -1;//de aqui editado
                        this.settings.bIdCliSet = false;

                        if (this.settings.subacc == AccEnum.X) {
                            this.settings.subacc = AccEnum.UNKNOW;
                        }//aqui editado
                    } else {
                        this.settings.iTOw = -1;
                        this.settings.bIdCliSet = false;

                        if (this.settings.subacc == AccEnum.X) {
                            this.settings.subacc = AccEnum.UNKNOW;
                        }
                    }
                }
                this.settings.iTOw = this.config.get('socket').TOwin;
            }
        }

        if (this.openIdeditModal) {
            if ((this.config.get('socket').ConfirmaID.toUpperCase().indexOf("S") != -1) && (!this.config.get('socket').IdSerieNoConfirmaDatos.includes(this.settings.hiIdS.toString()))) {
                this.openIdeditModal = false;
                this.openModal(ModalEnum.IDEDIT);
            }
        }

    }

    /**
     * ACTION AFTER COMMAND
     */


    public AccEDB() {
        //var d = new Date();
        //console.log(d);
        //console.log("acc = EDB");
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.GETEDOBASE;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.send(proto.toJson(), this.settings.accion);
    }

    public AccLGISET(login: LoginModel) {
        //var d = new Date();
        //console.log(d);
        //console.log("acc = LOGIN");

        if (typeof login.IdEscritorio === 'undefined') {
            return;
        }

        this.settings.hiEsc = login.IdEscritorio;
        this.settings.hiUsr = login.User;
        // BUG si hay un error al refrescar aun asi gracias a esta cookie se logea
        // this.setCookie(login.IdEscritorio + "," + login.User);

        this.send(login.toJson(), this.settings.accion);
        this.loginModel = login;
        //this.settings.Modal.show.next(false);
        //this.settings.Modal.self.next(null);  
    }

    public AccLGO() {
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.LOGOFF;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.settings.subacc = AccEnum.X;

        this.closeModal(ModalEnum.LOGIN);

        this.send(proto.toJson(), this.settings.accion);
    }

    public AccINI() {
        this.settings.IdPausaFin = 0;
        //var d = new Date();
        //console.log(d);
        //console.log("valor idpausafin accInicioAtencion:", this.settings.IdPausaFin);
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.PIDOTURNO;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.settings.iTOpido = 30;
        this.send(proto.toJson(), this.settings.accion);
    }

    public AccFIN() {
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.GETMOTIVOS;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.send(JSON.stringify(proto), this.settings.accion);
    }

    public AccEDS() {
        if (this.settings.iTOpido > 0 ||
            typeof this.settings.hiEsc == 'undefined' ||
            this.settings.hiEsc == ""
        ) {
            return false;
        }
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.GETEDOSESION;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.send(JSON.stringify(proto), this.settings.accion);
        return true;
    }

    public AccPAUSET(name: string) {
        if (this.settings.CliInt != "FALASACBOD") {
            let bMotEx = false;
            let i = 0;
            if (this.settings.rbPau.checked.getValue()) {
                bMotEx = true;
                name = this.settings.rbPau.value.getValue();
            }

            if (bMotEx && name == "0") {
                //swapDiv("1", 0);
                return false;
            }
            //this.settings.Modal.show = true;
        }
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.SETPAUSA;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;
        proto.IdPausa = name;
        this.send(proto.PAUSETtoJson(), this.settings.accion);
    }

    private AccFINTUR() {
        //this.settings.Modal.show.next(false);
        //this.closeModal(ModalEnum.GETMOTIVOS);
        //var d = new Date();
        //console.log(d);
        //console.log("2");
        this.closeModal(this.settings.Modal.self.getValue());

        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.FINTURNO;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;
        proto.Motivos = this.settings.cbMot;
        proto.Encuesta = [];

        let bMotEx = false;
        let bMotOK = false;
        let i = 0;

        if (this.settings.sEncRpt != "") {
            let oQR = this.settings.sEncRpt.split(";");
            oQR.forEach(o => {
                let oQRD = o.split(",");
                proto.Encuesta.push({
                    IdReq: oQRD[0],
                    Rsp: oQRD[1]
                });
            });
        }
        this.send(JSON.stringify(proto), this.settings.accion);
    }

    private AccFINTURPAUSA(name: string) {
        if (this.settings.CliInt != "FALASACBOD") {
            let bMotEx = false;
            let i = 0;
            if (this.settings.rbPau.checked.getValue()) {
                bMotEx = true;
                name = this.settings.rbPau.value.getValue();
            }

            if (bMotEx && name == "0") {
                //swapDiv("1", 0);
                return false;
            }
            //this.settings.Modal.show = true;
        }
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.SETPAUSA;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;
        proto.IdPausa = name;

        this.send(proto.PAUSETtoJson(), this.settings.accion);
    }


    public AccURGSER() {
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.GETSERIES;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.settings.subacc = AccEnum.X;
        this.send(proto.toJson(), this.settings.accion);
    }

    public AccPAUGET() {
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.GETPAUSAS;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.settings.subacc = AccEnum.X;
        this.send(proto.toJson(), this.settings.accion);
    }

    public AccLLE() {
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.PROCESOTURNO;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;
        if (this.config.get('clients').client == "Chilquinta") {

            console.log("LLAMADA DE SERVICIO");
            // console.log(proto);
            // console.log(this.settings);
            // console.log(this.settings.user);
            // console.log(this.settings.dOfi.value.getValue());
            // console.log(this.settings.hiUsr);
            // console.log(this.client);
            // console.log(this.datos_message);
            var turno: Turno = { login: this.settings.hiUsr, num_atencion: parseInt(this.datos_message['Turno']) };
            var Resplog: RespuestaLog;
            Resplog = // Creacion de Objeto de respuesta en Log 
                {
                    NombreOficina: this.settings.dOfi.value.getValue(),
                    IdSerie: this.datos_message['IdSerie'],
                    IdEscritorio: parseInt(proto.IdEscritorio),
                    UserEjecutivo: this.settings.hiUsr,
                    RutCliente: this.datos_message['Rut'],
                    NumeroTurnoCliente: turno.num_atencion,
                    FechadeAgregado: this.datos_message['HNow'],
                    Respuesta: "nope"
                };


            this.ChilquintaService.addchilquintaServ(turno, this.datos_message['Rut']).subscribe(response => {
                console.log("Respuesta Positiva Chilquinta");
                console.log(response);
            },
                error => {
                    this.errorMessage = <any>error;
                    console.log("aqui hace algo error");
                    Resplog.Respuesta = this.errorMessage["message"];
                    //-------------------------Agregar Datos al Localstorage-----------------------------------
                    if (this.config.get('clients')["Chilquinta"].Addlocal) {
                        this.ChilquintaService.addLocalResp(Resplog);
                    }
                    //-------------------------Agregar Datos al Localstorage-----------------------------------
                    //--------------------------Crear Archivo en descargas------------------------------
                    if (this.config.get('clients')["Chilquinta"].PrintLog) {
                        this.ChilquintaService.getLocalResp();
                    }
                    //-------------------------Crear Archivo en descargas-----------------------------------
                    console.log(this.errorMessage["message"]);
                });
        }

        this.send(JSON.stringify(proto), this.settings.accion);
    }

    public AccRLL() {
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.RELLAMO;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.settings.iTOw = parseInt(this.settings.hiTEspC);
        this.send(proto.toJson(), this.settings.accion);
    }

    public AccNUL() {
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.ANULO;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.send(proto.toJson(), this.settings.accion);
    }

    public AccURGSET(name: string) {
        //var d = new Date();
        //console.log(d);
        //console.log("URGSET", this.settings.rbSer.checked.getValue());
        if (!this.settings.rbSer.checked.getValue()) {
            return;
        }

        this.settings.subacc = AccEnum.UNKNOW;
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.URGENCIA;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;
        proto.IdSerie = parseInt(this.settings.rbSer.value.getValue());
        proto.Turno = this.settings.urgTur.value.getValue();

        this.send(JSON.stringify(proto), this.settings.accion);
    }

    public AccDRVSER() {
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.GETSERIES;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.settings.subacc = AccEnum.X;
        this.send(JSON.stringify(proto), this.settings.accion);
    }

    public AccDRVSET(name: string, ch: string) {
        //this.settings.Modal.show = false;
        //var d = new Date();
        //console.log(d);
        //console.log("3");
        this.closeModal(this.settings.Modal.self.getValue());

        if (this.settings.rbSer.checked.getValue()) {
            name = this.settings.rbSer.value.getValue();
        }
        if (this.settings.rbDrv.checked.getValue()) {
            ch = this.settings.rbDrv.value.getValue();
        }
        if (name == "0") {
            this.settings.subacc = AccEnum.UNKNOW;
            return false;
        }

        var d = new Date();
        //console.log(d);
        //console.log("drvset ", name, ch);

        this.settings.sDrvAcc = ch;

        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.DERIVOTURNO;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;
        proto.IdSerie = parseInt(name);

        this.send(JSON.stringify(proto), this.settings.accion);
    }

    public AccSID() {
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.SETIDC;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;
        proto.Rut = this.settings.Rut;
        proto.Fono = this.settings.FonoTmp;

        this.send(proto.SIDtoJson(), this.settings.accion);
    }

    public disconnect() {
        //this.socketSubscription.unsubscribe();
    }

    public destroy() {
        this.timerSubscription.unsubscribe();
        this.socketSubscription.unsubscribe();
    }

    public setCookie(ctor: string) {
        let defaultCenturyStart = new Date;
        let expires = new Date;
        expires.setTime(defaultCenturyStart.getTime() + 1E3 * 60 * 60 * 24 * 365);

        this.cookieService.set(this.sCookie, ctor, expires);
    }

    /**
     * RESPONSE MESSAGES ACTIONS
     */

    private LOGIN(m) {
        this.settings.subacc = AccEnum.UNKNOW;
        let userModel = new UserModel(
            m.Oficina,
            m.Escritorio,
            m.Ejecutivo,
            m.Encuestas,
            null,
            this.loginModel
        );
        this.settings.oEncQ = m.Encuestas;
        this.settings.user = new BehaviorSubject<UserModel>(userModel);
        this.settings.dOfi.value.next(m.Oficina);
        this.settings.dEsc.value.next(m.Escritorio);

        this.enableUrg = true; // by default
        const urg = m.Ejecutivo.split(';');
        if (urg.length > 1) { // case chilquinta
            this.settings.dEje.value.next(urg[0]);
            if (urg[1].toUpperCase() === 'B') {
                this.enableUrg = false;
            } else if (urg[1].toUpperCase() === 'A') {
                this.enableUrg = true;
            }
        } else {
            this.settings.dEje.value.next(m.Ejecutivo);
        }
        // SAVE SESSION
        // this.setCookie(this.settings.hiEsc + "," + this.settings.hiUsr);

        if (this.enableUrg) { // first moment
            this.settings.btURG.disable.next(true);
        } else {
            this.settings.btURG.disable.next(false);
        }

        this.fnView(AccEnum.PAUSA);
        this.fnAccion(AccEnum.EDB);
        this.closeModal(ModalEnum.LOGIN);
        this.settings.isLogged.next(true);
    }

    private LOGOFF(m) {
        // clear cookie
        this.cookieService.delete(this.sCookie);
        this.settings.subacc = AccEnum.UNKNOW;
        this.settings.dEdo.value.next(AccEnum.LOGOFF);
    }

    private GETEDOBASE(m) {
        //if(!this.loginModel) {
        this.loginModel = new LoginModel();
        this.loginModel.IdEscritorio = this.settings.hiEsc;
        this.loginModel.User = this.settings.hiUsr;
        this.loginModel.Id = "1";
        this.loginModel.ClienteInterno = this.settings.CliInt;
        //}

        let userModel = new UserModel(
            m.Oficina,
            m.Escritorio,
            m.Ejecutivo,
            null,
            m.Estado,
            this.loginModel
        );

        this.settings.dOfi.value.next(m.Oficina);
        this.settings.dEsc.value.next(m.Escritorio);
        this.settings.dEje.value.next(m.Ejecutivo);
        this.settings.dEdo.value.next(m.Estado);

        this.settings.IdEje.next(m.IdEje);
        this.settings.CliInt = m.ClienteInterno;
        this.settings.oEncQ = m.Encuestas;
        this.settings.sEncRpt = "";
        this.settings.bEncFin = false;
        if (m.Estado != AccEnum.LOGOFF.toString()) {
            //this.settings.isLogged.next(true);
            this.fnAccion(AccEnum.EDS);

            return false;
        }

        return true;
    }

    private GETEDOSESION(m) {
        this.settings.hiTDelta = this.GetTDelta(m.HNow);
        this.settings.dQEspO.value.next(m.QEspO);
        this.settings.dQEspE.value.next(m.QEspE);
        this.settings.dEdo.value.next(m.Estado);
        this.settings.hiTEspAO = m.TEspAO;
        this.settings.hiTEspAE = m.TEspAE;
        this.settings.hiTEspA = m.TEspA;
        this.settings.hiTAteA = m.TAteA;
        this.settings.hiFHini = m.Fhini;

        if (this.settings.dQEspO.value.getValue() != "0") {
            this.settings.dEspO = this.s_2_date(m.TEspO);
        } else {
            this.settings.dEspO = "";
            this.settings.dTEspO.value.next("");
        }

        if (this.settings.dQEspE.value.getValue() != "0") {
            this.settings.dEspE = this.s_2_date(m.TEspE);
        } else {
            this.settings.dEspE = "";

            this.settings.dTEspE.value.next("");
        }

        if (m.Estado == AccEnum.LLAMANDO || m.Estado == AccEnum.ATENDIENDO) {
            /* if(this.settings.subacc == AccEnum.PAUGET){ //modificado
                 this.cleanElement();
             }*/
            this.setLlamandoAtendiendo(m);
        } else {
            this.cleanElement();
        }
    }

    private GETPAUSAS(m) {
        if (m.Pausas.length > 0) {
            this.settings.Pausas = new BehaviorSubject(m.Pausas);
            this.openModal(ModalEnum.GETPAUSAS);
        } else {
            this.fnAccion(AccEnum.PAUSET);
        }
    }


    private GETSERIES(m) {
        this.settings.Series = new BehaviorSubject(m.Series);
        //this.settings.Modal.show.next(true);
        var d = new Date();
        //console.log(d); 
        //console.log("GETSERIES", this.settings.accion);
        if (this.settings.accion == AccEnum.URGSER) {
            this.openModal(ModalEnum.GETSERIES_URGSER);
            //this.settings.Modal.self.next(ModalEnum.GETSERIES_URGSER);
        } else if (this.settings.accion == AccEnum.DRVSER) {
            this.settings.sDrvAcc = "";
            //this.settings.Modal.self.next(ModalEnum.GETSERIES_DRVSER);
            this.openModal(ModalEnum.GETSERIES_DRVSER);
        }
    }

    private GETMOTIVOS(m) {
        console.log(m);
        this.settings.hiIdSDRV = this.settings.hiIdS;
        if (m.Motivos.length > 0 || this.client.ForceMotUrg) {
            this.settings.Motivos = new BehaviorSubject(m.Motivos);
            console.log("entre al if de que abre modal motivos");
            this.openModal(ModalEnum.GETMOTIVOS);
        } else if (!this.client.MotivosExt) {
            console.log("cerre turno directamente");
            this.fnAccion(AccEnum.FINTUR);
        }
    }

    private PIDOTURNO(m) {
        this.contRellamados = 0;
        this.bActivarRellamado = true;
        this.settings.btRLL.disable.next(false);
        this.firsTickTimer = false;

        this.settings.subacc = AccEnum.UNKNOW;
        this.settings.sEscEdo = AccEnum.UNKNOW;
        this.settings.iTOw = -1;
        this.settings.iTOpido = 0;
        this.bLlamaSet = true;
        this.fnAccion(AccEnum.EDS);

        return false;
    }

    private FINTURNO(m) {
        //this.fnIDimd("N");
        //this.settings.subacc = AccEnum.UNKNOW;
        //var d = new Date();
        //console.log(d);
        //console.log("4");
        //console.log("idPausaFin finturno: ", this.settings.IdPausaFin);
        this.closeModal(this.settings.Modal.self.getValue());
        this.settings.data = new EmptyObservable();
        this.settings.imgid.show.next(true);
        this.settings.imgid.disable.next(true);
        if (this.settings.IdPausaFin > 0 && this.settings.subacc == AccEnum.UNKNOW) {
            this.fnAccion(AccEnum.PAUSET, this.settings.IdPausaFin.toString());
            return false;
        }

        return true;
    }

    private FINTURNOPAUSA(m) {
        //this.fnIDimd("N");
        //this.settings.subacc = AccEnum.UNKNOW;
        //var d = new Date();
        //console.log(d);
        //console.log("4 FINTURNOPAUSA");
        this.closeModal(this.settings.Modal.self.getValue());
        this.settings.data = new EmptyObservable();
        this.settings.imgid.show.next(true);
        this.settings.imgid.disable.next(true);
        if (this.settings.CliInt == "FALASACBOD" &&
            (this.settings.IdPausaFin > 0 && this.settings.subacc == AccEnum.UNKNOW)) {
            this.fnAccion(AccEnum.PAUSET, this.settings.IdPausaFin.toString());
            return false;
        }
        return true;
    }

    private DERIVOTURNO(m) {
        this.settings.subacc = AccEnum.UNKNOW;
        if (this.settings.sDrvAcc == "U") {
            this.fnAccion(AccEnum.URGSER);
            return false;
        } else if (this.settings.sDrvAcc == "P") {
            this.fnAccion(AccEnum.PAUGET);
            return false;
        }
        return true;
    }

    private URGENCIA(m) {
        this.settings.subacc = AccEnum.UNKNOW;
        this.settings.sEncRpt = "";
        this.settings.bEncFin = false;
        this.settings.bTurnoSet = true;
        if (this.settings.CliInt == "ABCDIN") {
            this.settings.bOfertaSet = true;
        }
        //this.fnIDimd("S");
        this.settings.imgid.show.next(true);
    }

    private s_2_hms(oSpan, mtime, lastModified) {
        /*let date = moment(new Date(mtime)).toISOString().substr(11, 8); // .format('HH:mm:ss');
        oSpan.value.next(date);*/

        var d = new Date(1000 * mtime)
        oSpan.value.next(d.toISOString().substr(11, 8));

        if (mtime > lastModified) {
            oSpan.class.next('font-weight-bold text-danger');
        } else {
            oSpan.class.next('font-weight-bold text-dark');
        }
    }

    private s_2_date(a) {
        /*let expiresDate = moment();
        expiresDate.seconds(expiresDate.second() -dataAndEvents );
        return expiresDate;*/
        var b = new Date();
        b.setSeconds(b.getSeconds() - a);
        return b
    }

    private GetTDelta(b) {
        /*let tempDate = new Date;
        let defaultCenturyStart = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), charsetPart.substring(0, 2), charsetPart.substring(3, 5), charsetPart.substring(6, 8), 0);
        return parseInt(((tempDate.getTime() - defaultCenturyStart.getTime()) / 1000).toString());*/
        var a = new Date(),
            c = new Date(a.getFullYear(), a.getMonth(), a.getDate(), b.substring(0, 2), b.substring(3, 5), b.substring(6, 8), 0);
        return ((a.getTime() - c.getTime()) / 1000)
    }

    private setLlamandoAtendiendo(m) {
        //let mtime = moment(new Date(m.TEsp));
        /*let date = new Date(1E3 * m.TEsp);
        this.settings.dTEsp.value.next(date.toISOString().substr(11, 8));
        this.settings.dTEsp.data.next(m.TEsp);*/
        //var d = new Date();
        //console.log(d);

        console.log('se ejecuta el metodo llamandoAtendiendo');
        this.s_2_hms(this.settings.dTEsp, m.TEsp, this.settings.hiTEspA);

        var cleintesplit = m.Cliente.split(";");
        this.settings.hiIdS = m.IdSerie;
        //modificado
        this.settings.hiIdSD = m.IdSerieD;
        this.settings.hiTEspC = m.TEspC;
        this.settings.dLet.value.next(m.Letra);
        this.settings.dSer.value.next(m.Serie);
        this.settings.dTur.value.next(m.Turno);
        this.settings.dRut.value.next(m.Rut);

        let fono = m.Fono.split(',');
        if (fono.length > 1) {
            this.settings.dTer.value.next(fono[1]);
            const Mail = fono[2];
            const Nombre = fono[1];
            fono = fono[0];

            if (Nombre != 0) {
                this.settings.dCli.value.next(Nombre);
                this.settings.dNom.value.next(Nombre);
            }

            this.settings.dMail.value.next(Mail);
        } else {
            fono = m.Fono;
            if (cleintesplit.length > 1) {
                this.settings.dCli.value.next(cleintesplit[0]);
                this.settings.dNom.value.next(cleintesplit[0]);
                if (cleintesplit[1] == "undefined" || cleintesplit[1] == undefined || !cleintesplit[1]) {
                    this.settings.dMail.value.next(" ");
                }
                else {
                    this.settings.dMail.value.next(cleintesplit[1]);
                }

            }
            else {

                if (cleintesplit[0] == "undefined" || cleintesplit[0] == undefined || !cleintesplit[0]) {
                    this.settings.dNom.value.next(" ");
                    this.settings.dCli.value.next(" ");
                }
                else {
                    this.settings.dNom.value.next(m.Cliente);
                    this.settings.dCli.value.next(cleintesplit[0]);
                }
            }

            //this.settings.dCli.value.next(cleintesplit[0]);
            //this.settings.dCli.value.next(m.Cliente);
        }

        this.settings.dFon.value.next(fono);

        if (m.Estado == "ATENDIENDO") {
            console.log("entre al mEstado=atendiendo");
            this.settings.imgid.show.next(true);
            this.settings.imgid.disable.next(false);
        }
        if (this.settings.bOfertaSet) {
            this.settings.sOferta = m.Oferta;
        }

        if (m.Estado == "LLAMANDO" && m.Turno > 0 && this.bLlamaSet) {
            this.bLlamaSet = false;
            //spawnNotification("Turno : " + m.Letra + " " + m.Turno, "./img/llamando.png", "LLAMADO DE TURNO")
            try { //bug chrome
                this._pushNotifications.create(
                    "LLAMADO DE TURNO",
                    {
                        body: "Turno : " + m.Letra + " " + m.Turno,
                        icon: "/assets/img/llamando.png"
                    }
                ).subscribe(res => {
                    if (res.event.type === 'click') {
                        // You can do anything else here
                        res.notification.close();
                    }
                });
            } catch (Exception) {

            }

        }
        if (this.settings.bTurnoSet) {
            this.settings.bTurnoSet = false;

            console.log("condicion open modal");
            if (this.settings.bOfertaSet) {
                this.settings.bOfertaSet = false;
                if (this.settings.sOferta != "") {
                    this.settings.fnPopOferta.next(true);
                }
            }
            this.openIdeditModal = true;
        }
    }

    private cleanElement() {
        //var d = new Date();
        //console.log(d);
        //console.log('se ejecuta el metodo cleanElement');

        this.settings.hiIdS = "";
        this.settings.hiIdSD = "";
        this.settings.dTEsp.value.next("");
        this.settings.dLet.value.next("");
        this.settings.dSer.value.next("");
        this.settings.dTur.value.next("");
        this.settings.dRut.value.next("");
        this.settings.dFon.value.next("");
        this.settings.dCli.value.next("");
        //this.settings.dOfe.value.next("");

        this.settings.imgid.show.next(false);
        this.settings.imgid.disable.next(false);
    }


    public openModal(modal: ModalEnum) {
        //var d = new Date();
        //console.log(d);
        //console.log(d, "Modal Abierto: ", modal);
        console.log("modal en openModal ", modal);
        if (this.settings.Modal.show) {
            var d = new Date();
            //console.log(d);
            console.log(d, "Modal Abierto: ", modal);
            return;
        }
        this.settings.Modal.show = true;
        this.settings.Modal.self.next(modal);
        this.settings.iTOw = this.config.get('socket').TOwin;

    }

    public closeModal(modal: ModalEnum) {
        //var d = new Date();
        //console.log(d);
        //console.log("close modal", modal);

        if (!this.settings.Modal.show) {
            //var d = new Date();
            //console.log(d);
            //console.log("close modal false");
            return;
        }

        if (this.settings.lastError.CodError == "13029" && this.settings.lastError.DescError == "Turno previamente atendido") {
            this.settings.Modal.show = false;
            this.settings.bIdCliSet = false;
            this.settings.Modal.self.next(modal);
            this.fnAccion(AccEnum.URGSER);
        }

        if (this.settings.lastError.CodError == "13028" && this.settings.lastError.DescError == "Turno no ha sido emitido") {
            this.settings.Modal.show = false;
            this.settings.bIdCliSet = false;
            this.settings.Modal.self.next(modal);
            this.fnAccion(AccEnum.URGSER);
        }

        this.settings.Modal.show = false;

        this.settings.iTOw = -1;
        this.settings.bIdCliSet = false;

        if (this.settings.subacc == AccEnum.X) {
            this.settings.subacc = AccEnum.UNKNOW;
        }

        this.settings.Modal.self.next(modal);
    }

    public getIsLogged(): Observable<boolean> {
        return this.settings.isLogged.asObservable();
    }

    public get IsLogged(): boolean {
        return this.settings.isLogged.getValue();
    }

    public IsError(): Observable<boolean> {
        return this.settings.lastError.isError.asObservable();
    }

    public GetMessage(): Observable<any> {
        return this.messageTurn.asObservable();
    }
}