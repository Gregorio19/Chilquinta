import { Injectable } from '@angular/core'
import { SettingsService } from './settings.service';
import { LoginModel } from '../Models/LoginModel';
import { WebsocketService } from './Websocket.service';
import { Subscription } from 'rxjs/Subscription';
import { CookieService } from 'ngx-cookie-service';
import { ActionEnum, ModalEnum, AccEnum, MsgError } from '../Models/Enums';
import { UserModel } from '../Models/UserModel';
//import { Observable } from 'rxjs/Observable';
import { Observable } from 'rxjs';
import { ProtoModel } from '../Models/ProtoModel';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { PushNotificationsService } from 'ng-push';
import { AppConfig } from '../app.config';
import { MotivoModel } from '../Models/MotivoModel';

@Injectable()
export class MotivosService extends WebsocketService {
    private sCookie: string = "TPsoftV24consWS2";
    private socketSubscription: Subscription;
    public isLogged: boolean = false;
    private loginModel: LoginModel;
    private client: any;

    private timer = TimerObservable.create(0, 1000);
    private timerSubscription: Subscription;

    constructor(
        //private socket: WebsocketService,
        public settings: SettingsService,
        private config: AppConfig
    ) {
        super();

        this.client = this.config.get('clients')[this.config.get('clients').client];
        
        this.start();

        // Timer
        this.timerSubscription = this.timer.subscribe(t => this.DoTimer(t));
    }

    private start() {
        if(this.client.MotivosExt){
            this.connect(this.config.get('socket').MotivosUrl);
                        
            this.open.subscribe((open: boolean)   => {
                if (open) {
                    console.log("2 connection open");                
                }

            });

            this.socketSubscription = this.messages.subscribe((message: string) => {
                var m = JSON.parse(message);
                console.log("2 rsp = %s", message);
                if (m.CodError != "0") {
                    // LAUNCH error
                    this.settings.lastErrorMot.MsgType = m.MsgType;
                    this.settings.lastErrorMot.CodError = m.CodError;
                    this.settings.lastErrorMot.DescError = m.DescError;
                    this.settings.lastErrorMot.isError.next(true);

                    this.settings.motivosStorage.next(null);

                    return false;
                }

                this.clearError();

                switch(m.MsgType) {
                    case ActionEnum.LOGIN:
                        console.log("R2 : LOGIN");
                        this.LOGIN(m);
                        break;
                    case ActionEnum.GETUSERNAME:
                        console.log("R2 : USERNAME");
                        this.USERNAME(m);
                        break;
                    case ActionEnum.LOGOFF:
                        console.log("R2 : LOGOFF");
                        this.LOGOFF(m);
                        break;
                    case ActionEnum.GETMOTIVOS:
                        console.log("R2 : GETMOTIVOS s");
                        this.GETMOTIVOS(m);
                        break;                
                }            
            },
        error => {
            this.settings.lastErrorMot.DescError = "Error comunicación con el servidor";        
            this.settings.lastErrorMot.isError.next(true);
            
            
        });
        }
    }

    clearError() {
         // CLEAR error
         this.settings.lastErrorMot.MsgType = null;
         this.settings.lastErrorMot.CodError = null;
         this.settings.lastErrorMot.DescError = null;
         this.settings.lastErrorMot.isError.next(false);
    }

    DoTimer(t) {   
          
        //let defaultCenturyStart = moment();
        let mtime = 0;
        if (!this.open) {
            if(this.settings.Modal.self.getValue() != ModalEnum.ERROR) {
                this.open = null;
                this.messages = null;
                this.start();
            }
        }
    }
   
    
      /**
       * ACTION AFTER COMMAND
       */
   
    public AccLGISET(login: LoginModel) {
        console.log("LOGIN 2"); 
        //this.settings.hiEsc = login.IdEscritorio;
        //this.settings.hiUsr= login.User;
        // BUG si hay un error al refrescar aun asi gracias a esta cookie se logea
        // this.setCookie(login.IdEscritorio + "," + login.User);

        this.send(login.toJson(), "Login");   
        this.loginModel = login;  
        
        return true;
    }

    public AccUSERNAME() {
        console.log("USERNAME 2");
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.GETUSERNAME;

        this.send(proto.toJson(), "GETUSERNAME");
    }

    public AccLGO() {
        console.log("LGO 2"); 
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.LOGOFF;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;
        
        this.send(proto.toJson(), "LGO");    
    }

    public AccMotivos() {
        console.log("MOTIVOS 2"); 
        let proto = new ProtoModel();
        proto.MsgType = ActionEnum.GETMOTIVOS;
        proto.ClienteInterno = this.settings.CliInt;
        proto.Id = "1";
        proto.IdEscritorio = this.settings.hiEsc;

        this.send(proto.toJson(), "Motivos");   
    }

    
    public destroy() {
        console.log("destroy motivos");
        this.socketSubscription.unsubscribe();        
    }

    /**
     * RESPONSE MESSAGES ACTIONS
     */

    private LOGIN(m) {
        /*let userModel = new UserModel(
            m.Oficina,
            m.Escritorio,
            m.Ejecutivo,
            m.Encuestas,
            null,
            null
          );*/ 
        this.isLogged = true;
    }

    private USERNAME(m) {
        this.settings.hiUsr = m.User;
    }

    private LOGOFF(m) {
        // clear cookie
        this.isLogged = false;
        this.clearError();
    }
   
    private GETMOTIVOS(m) {
        this.settings.motivosStorage = new BehaviorSubject<MotivoModel>(m);         
    }   
    
}