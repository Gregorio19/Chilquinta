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

@Injectable()
export class ConsService extends WebsocketService {
    private sCookie: string = "TPsoftV24consWS2";
    private socketSubscription: Subscription;
    public loginModel: LoginModel;
    private _pushNotifications: PushNotificationsService

    private timer = TimerObservable.create(0, 1000);
    private timerSubscription: Subscription;

    private bLlamaSet: Boolean = false;
    private client: any;
    private bEncCurso: boolean = false;
    private iTAte: number = 0;

    private enableUrg: boolean = true;

    private messageTurn: BehaviorSubject<string> = new BehaviorSubject<string>("");

    constructor(
        //private socket: WebsocketService,        
        public settings: SettingsService,
        private cookieService: CookieService,
        private config: AppConfig,
        @Inject(PLATFORM_ID) platformId: string,
        private injector: Injector,
    ) {
        super();
        this.loginModel = new LoginModel();

        this.client = this.config.get('clients')[this.config.get('clients').client];

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
        console.log("start again");
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
                console.log("connection open");
                this.settings.bCnxOK = true;
                let name = this.cookieService.get(this.sCookie);
                if (typeof name != 'undefined' && name) {
                    let tmp = name.split(",");

                    console.log("name", name, tmp[0], tmp[1]);
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
            console.log("rsp = %s", message);
            if (m.CodError != "0") {
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

                } /*else if (m.MsgType == ActionEnum.URGENCIA) {
                    this.messageTurn.next(m.DescError);
                    this.closeModal(this.settings.Modal.self.getValue());
                    this.openModal(ModalEnum.MSGURGTURN);
                }*/

                return;
            }

            //this.clearError();

            switch (m.MsgType) {
                case ActionEnum.LOGIN:
                    console.log("R : LOGIN");
                    this.LOGIN(m);
                    break;
                case ActionEnum.LOGOFF:
                    console.log("R : LOGOFF");
                    this.LOGOFF(m);
                    break;
                case ActionEnum.GETEDOBASE:
                    console.log("R : GETEDOBASE");
                    if (!this.GETEDOBASE(m)) {
                        if (!this.settings.isLogged.getValue()) {
                            this.clearError();
                            this.openModal(ModalEnum.LOGIN);
                        }

                        return false;
                    }
                    break;
                case ActionEnum.GETEDOSESION:
                    console.log("R : GETEDOSESION  acc =", this.settings.accion);
                    this.GETEDOSESION(m);
                    break;
                case ActionEnum.GETPAUSAS:
                    console.log("R : GETPAUSAS");
                    this.GETPAUSAS(m);
                    break;
                case ActionEnum.SETPAUSA:
                    console.log("R : SETPAUSA");
                    this.settings.subacc = AccEnum.UNKNOW;
                    break;
                case ActionEnum.GETSERIES:
                    console.log("R : GETSERIES");
                    this.GETSERIES(m);
                    break;
                case ActionEnum.GETMOTIVOS:
                    console.log("R : GETMOTIVOS");
                    this.GETMOTIVOS(m);
                    break;
                case ActionEnum.PIDOTURNO:
                    console.log("R : PIDOTURNO");
                    return this.PIDOTURNO(m);
                case ActionEnum.RELLAMO:
                    console.log("R : RELLAMO");
                    break;
                case ActionEnum.ANULO:
                    console.log("R : ANULO");
                    break;
                case ActionEnum.PROCESOTURNO:
                    console.log("R : PROCESOTURNO");
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
                    console.log("R : FINTURNO");
                    if (!this.FINTURNO(m)) {
                        return false;
                    }
                    break;
                case ActionEnum.DERIVOTURNO:
                    console.log("R : DERIVOTURNO");
                    if (!this.DERIVOTURNO(m)) {
                        return false;
                    }
                    break;
                case ActionEnum.URGENCIA:
                    console.log("R : URGENCIA");
                    this.URGENCIA(m);
                    break;
                case ActionEnum.SETIDC:
                    console.log("R : SETIDC");
                    this.closeModal(ModalEnum.IDEDIT);
                    break;
            }
            if (!this.settings.Modal.show) {
                let dEdo: AccEnum = <AccEnum>AccEnum[this.settings.dEdo.value.getValue()];
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
        console.log("clearError");
        this.settings.lastError.MsgType = null;
        this.settings.lastError.CodError = null;
        this.settings.lastError.DescError = null;
        this.settings.lastError.isError.next(false);

        //this.settings.lastError = new MsgError();
    }

    public fnAccion(accion: AccEnum, ...args: any[]) {
        console.log("fnAccion", accion);

        this.clearError();

        let name = "0";
        let ch = "";
        this.settings.accion = accion;
        if (this.settings.accion == AccEnum.LOG) {
            if (typeof this.settings.sLogEdo != 'undefined' && this.settings.sLogEdo) {
                this.settings.accion = this.settings.sLogEdo == "Login" ? AccEnum.LGI : AccEnum.LGO;
            } else {
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
                return false;
            } else {

                if (this.config.get('poll').EncOK && (this.settings.oEncQ.length > 0 && !this.settings.bEncFin)) {
                    //fnEnc_Wait();
                    this.settings.sEncAcc = accion;
                    return false;
                } else {
                    if (accion != AccEnum.FIN) {
                        this.settings.subacc = accion;
                        this.settings.accion = AccEnum.FIN;
                    }
                }
            }
        } else {
            if (this.settings.sEscEdo == AccEnum.LLAMANDO && this.settings.accion == AccEnum.PAUGET) {
                this.settings.subacc = accion;
                this.settings.accion = AccEnum.NUL;
            } else if (this.settings.sEscEdo == AccEnum.ATENDIENDO &&
                (this.settings.accion == AccEnum.DRVSET)) {
                this.settings.subacc = accion;
                this.settings.accion = AccEnum.FIN;
            }
        }

        //this.settings.lastError = new MsgError();
        console.log("accion: ", this.settings.accion);
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
                this.AccFIN();
                break;
            case AccEnum.FINTUR:
                this.AccFINTUR();
                break;
            case AccEnum.PAUGET:
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
        console.log("fnView", xhtml, this.settings.sEscEdo);
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
                this.settings.btRLL.disable.next(false);
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
        console.log("re connection");
        this.open = null;
        this.messages = null;
        this.start();
    }

    /**
     * TIMER
     */

    DoTimer(t) {
        //let defaultCenturyStart = moment();
        let now = new Date();

        /*if (!this.open.getValue()) {
            if (this.settings.Modal.self.getValue() != ModalEnum.ERROR) {
                this.restart();
            }
        }*/

        if (this.settings.iTOpido > 0 && !this.client.UseTimeout) {
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
                this.fnAccion(this.settings.subacc);
            }
        } else {
            if (this.settings.sEscEdo == AccEnum.ESPERANDO && (parseInt(this.settings.dQEspE.value.getValue()) > 0 && this.settings.iTOpido == 0)) {
                if (!this.settings.Modal.show) {
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
                        this.fnAccion(AccEnum.NUL);
                    }
                    setTimeout(() => {
                        if (!this.settings.Modal.show) {
                            this.fnAccion(AccEnum.EDS);
                        }
                    }, 3000);
                } else {
                    if (!this.settings.Modal.show) {
                        if (!(this.settings.iDT++ % 10)) {
                            this.fnAccion(AccEnum.EDS);
                        }
                    }
                }
            }
        }
        if (this.settings.Modal.show && this.settings.Modal.self.getValue() != ModalEnum.ERROR) {
            if (this.settings.iTOw-- == 0) {


                if (this.settings.Modal.self.getValue() != ModalEnum.LOGIN) {
                    if (this.client.UseTimeout) {
                        this.closeModal(this.settings.Modal.self.getValue());
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
    }

    /**
     * ACTION AFTER COMMAND
     */


    public AccEDB() {
        console.log("acc = EDB");
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.GETEDOBASE;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.send(proto.toJson(), this.settings.accion);
    }

    public AccLGISET(login: LoginModel) {
        console.log("acc = LOGIN");

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

        console.log("2");
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
        console.log("URGSET", this.settings.rbSer.checked.getValue());
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
        console.log("3");
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

        console.log("drvset ", name, ch);

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
        console.log("fuck urg", urg);
        if(urg !== 'undefined' && urg.length > 1) { // case chilquinta
            this.settings.dEje.value.next(urg[0]);
            if(urg[1].toUpperCase() === 'B') {
                this.enableUrg = false;
            } else if (urg[1].toUpperCase() === 'A') {
                this.enableUrg = true;
            }
        } else {
            this.settings.dEje.value.next(m.Ejecutivo);
        }
        // SAVE SESSION
        // this.setCookie(this.settings.hiEsc + "," + this.settings.hiUsr);

        console.log("fuck enable ", this.enableUrg);

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
        console.log("GETSERIES", this.settings.accion);
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
        this.settings.hiIdSDRV = this.settings.hiIdS;
        if (m.Motivos.length > 0 || this.client.ForceMotUrg) {
            this.settings.Motivos = new BehaviorSubject(m.Motivos);

            this.openModal(ModalEnum.GETMOTIVOS);
        } else if (!this.client.MotivosExt) {
            this.fnAccion(AccEnum.FINTUR);
        }
    }

    private PIDOTURNO(m) {
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
        console.log("4");
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

        this.s_2_hms(this.settings.dTEsp, m.TEsp, this.settings.hiTEspA);


        this.settings.hiIdS = m.IdSerie;
        this.settings.hiTEspC = m.TEspC;
        this.settings.dLet.value.next(m.Letra);
        this.settings.dSer.value.next(m.Serie);
        this.settings.dTur.value.next(m.Turno);
        this.settings.dRut.value.next(m.Rut);
        let fono = m.Fono.split(',');
        let Nombre
        let Mail
        if (fono.length > 0) {
            this.settings.dTer.value.next(fono[1]);
            Mail = fono[2];
            Nombre = fono[1];
            fono = fono[0];

            if (Nombre != 0) {
                this.settings.dCli.value.next(Nombre);
                this.settings.dNom.value.next(Nombre);
            }

            this.settings.dMail.value.next(Mail);
        } else {
            fono = m.Fono;

            this.settings.dCli.value.next(m.Cliente);
        }

        this.settings.dFon.value.next(fono);


        if (m.Estado == "ATENDIENDO") {
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

            if (this.config.get('socket').ConfirmaID.toUpperCase().indexOf("S") != -1) {
                this.openModal(ModalEnum.IDEDIT);
            } else {
                if (this.settings.bOfertaSet) {
                    this.settings.bOfertaSet = false;
                    if (this.settings.sOferta != "") {
                        this.settings.fnPopOferta.next(true);
                    }
                }
            }
        }
    }

    private cleanElement() {
        this.settings.hiIdS = "";
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
        console.log("open modal", modal);
        if (this.settings.Modal.show) {
            console.log("is open");
            return;
        }
        this.settings.Modal.show = true;
        this.settings.Modal.self.next(modal);
        this.settings.iTOw = this.config.get('socket').TOwin;

    }

    public closeModal(modal: ModalEnum) {
        console.log("close modal", modal);

        if (!this.settings.Modal.show) {
            console.log("close modal false");
            return;
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