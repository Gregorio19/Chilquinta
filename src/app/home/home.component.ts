import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { ConsService } from '../services/Cons.service';
import { AccEnum, ModalEnum } from '../Models/Enums';
import { Router } from '@angular/router';
import { PausaComponent } from '../pausa/pausa.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { LoginComponent } from '../login/login.component';
import { TurnoySerieComponent } from '../turnoy-serie/turnoy-serie.component';
import { IdeditComponent, IdEditModel } from '../idedit/idedit.component';
import { MotivosComponent } from '../motivos/motivos.component';
import { DerivarSerieComponent } from '../derivar-serie/derivar-serie.component';
import { Observable } from 'rxjs/Observable';
import { Observer, Subject, BehaviorSubject } from 'rxjs';
import { MotivosService } from '../services/motivos.service';
import { MotivosAtencionComponent } from '../motivos-atencion/motivos-atencion.component';
import { AppConfig } from '../app.config';
import { ModalMessageComponent } from '../modal-message/modal-message.component';
import { ConfEjeComponent } from '../conf-eje/conf-eje.component';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  //public dialog: BsModalRef = null;
  public dialogRef: MatDialogRef<any>;
  public letter: boolean = false;

  public number: number = 0;
  public observable: Observable<boolean>;
  private observer: Observer<boolean>;
  public configOdo = {
    format: 'd',
    theme: 'train-station',
    auto: true
  }

  private client: any;
  private lastModal: any;

  constructor(
    private consService: ConsService,
    public MotivosService: MotivosService,
    public settings: SettingsService,
    private router: Router,
    //private modalService: BsModalService,
    private config: AppConfig,
    public dialog: MatDialog
  ) {

    this.observable = new Observable<boolean>((observer: any) => this.observer = observer).share();

    this.settings.dTur.value.subscribe(value => {
      this.number = parseInt(value);
      if (this.number > 0) {
        this.letter = true;
        //this.observer.next(true);
      } else {
        this.letter = false;
      }

    });

    this.client = this.config.get('clients')[this.config.get('clients').client];
    this.consService.getIsLogged().subscribe((value: boolean) => {
      if (this.client.MotivosExt) {
        if (this.consService.loginModel.IdEscritorio) {
          if (value) {
            this.MotivosService.AccLGISET(this.consService.loginModel);
            this.MotivosService.AccMotivos();
          } else {
            //this.MotivosService.AccLGO(); //bugs cannot closed session   
          }
        }

      }

    });

  }


  ngOnInit() {

    this.consService.IsError().subscribe(value => {
      if (value) {

        if (!this.dialog) {
          //this.dialog = this.modalService.show(ModalErrorComponent);
        }
      }
    },
      err => {
        console.log(err);
      });

    this.settings.Modal.self.subscribe((modalEnum: ModalEnum) => {
      console.log("home modal", modalEnum);
      if (modalEnum == null) {
        return;
      }

      let initialState = {};

      if (this.settings.Modal.show) {
        
        switch (modalEnum) {
          case ModalEnum.GETPAUSAS:

            this.dialogRef = this.dialog.open(PausaComponent, { width: '480px' })

            break;
          case ModalEnum.LOGIN:
            //
            this.dialogRef = this.dialog.open(LoginComponent, {
              width: '480px'
            })
            //
            break;
          case ModalEnum.CONFEJE:
            if (!this.client.LoginWithUserPass) {
              const initialState = {
                loginModel: this.consService.loginModel
              }

              this.dialogRef = this.dialog.open(ConfEjeComponent, { data: initialState })

            }
            break;
          case ModalEnum.GETSERIES_URGSER:
            //
            this.dialogRef = this.dialog.open(TurnoySerieComponent, { width: '480px' })
            //
            break;
          case ModalEnum.GETSERIES_DRVSER:

            this.dialogRef = this.dialog.open(DerivarSerieComponent, { width: '480px' })

            break;
          case ModalEnum.IDEDIT:
            initialState = {
              enableClosed: (this.lastModal == ModalEnum.GETSERIES_URGSER ? false : true)
            };

            this.dialogRef = this.dialog.open(IdeditComponent, {
              width: '480px',
              data: initialState
            })
            //
            break;
          case ModalEnum.GETMOTIVOS:
            if (this.client.MotivosExt) {
              this.MotivosService.processMotivos();
              if (this.MotivosService.GetMotivos().Mot.getValue() && this.MotivosService.GetMotivos().Mot.getValue().length > 0) {

                this.dialogRef = this.dialog.open(MotivosAtencionComponent, { width: '1400px' });

              } else {
                this.consService.fnAccion(AccEnum.FINTUR);
              }

            } else {

              this.dialogRef = this.dialog.open(MotivosComponent, { width: '480px' });

            }
            break;
          case ModalEnum.ERROR:
            initialState = {
              title: "Error",
              titleClass: "text-danger",
              message: new BehaviorSubject<string>(this.settings.lastError.DescError),
              Dgltype: ModalEnum.ERROR
            }
            
            this.dialogRef = this.dialog.open(ModalMessageComponent, { width: '480px', data: initialState })

            break;
          case ModalEnum.MSGURGTURN:
            initialState = {
              title: "Alerta",
              titleClass: "text-warning",
              message: this.consService.GetMessage(),
              Dgltype: ModalEnum.MSGURGTURN
            }

            this.dialogRef = this.dialog.open(ModalMessageComponent, { width: '480px', data: initialState })

            break;

        }
        /*
        this.dialogRef.afterClosed().subscribe(result => {
          console.log("close dialog event", result, modalEnum);
          //this.dialogRef = null;
        })*/

      } else {
        console.log("close dialog", this.lastModal, modalEnum, this.dialogRef);
        if (this.dialogRef) {
          //this.dialogRef.close(modalEnum);
          this.dialog.closeAll();
          this.dialogRef = null;
        }
      }

      this.lastModal = modalEnum;

    });



    /*this.settings.Modal.show.subscribe((value: boolean) => {
      console.log("close modal", value);
      if(!value && this.dialog && this.settings.Modal.self.getValue() == this.lastModal) {
        // close dialog
        this.dialog.hide();
        this.dialog = null;        
      }
    });*/
  }

  ngOnDestroy() {
    //this.settings.Modal.self.unsubscribe();
  }

  fnAccion(accion: string) {
    let acc: AccEnum = <AccEnum>AccEnum[accion];
    console.log(acc);
    //console.log("aqui llego el mensaje");
    this.consService.fnAccion(acc);
  }

  public fnIDedit() {
    this.consService.openModal(ModalEnum.IDEDIT);
  }

  public AnimationEsperando() {
    let dEdo = this.settings.dEdo.value.getValue();
    if (dEdo == 'ESPERANDO') {
      return true;
    }
    return false;

  }

  public AnimationLlamando(): boolean {
    let dEdo = this.settings.dEdo.value.getValue();
    if (dEdo == 'LLAMANDO') {
      return true;
    }
    return false;
  }


  get msgDerivar(): string {
    let msg = "";
    if(this.settings.btDRV.disable.getValue()) {
      msg = "Derivar esta deshabilitada";
    } else {
      //msg = "Derivar";
    }
    return msg;
  }

  get msgAnular(): string {
    let msg = "";
    if(this.settings.btNUL.disable.getValue()) {
      msg = "Anular esta deshabilitado";
    } else {
      //msg = "Anular";
    }
    return msg;
  }

  get msgUrgencia(): string {
    let msg = "";
    if(this.settings.btURG.disable.getValue()) {
      msg = "Urgencia esta deshabilitada";
    } else {
      //msg = "Urgencia";
    }
    return msg;
  }

  get msgLLego(): string {
    let msg = "";
    if(this.settings.btLLE.disable.getValue()) {
      msg = "Llegó esta deshabilitado";
    } else {
      //msg = "Llegó";
    }
    return msg;
  }

  get msgRellamado(): string {
    let msg = "";
    if(this.settings.btRLL.disable.getValue()) {
      msg = "Rellamado esta deshabilitado";
    } else {
      //msg = "Rellamado";
    }
    return msg;
  }

  get msgFinalizarAtencion(): string {
    let msg = "";
    if(this.settings.btFIN.disable.getValue()) {
      msg = "Finalizar atención esta deshabilitada";
    } else {
      //msg = "Finalizar atención";
    }
    return msg;
  }
}
