import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { ConsService } from '../services/Cons.service';
import { AccEnum, ModalEnum } from '../Models/Enums';
import { Router } from '@angular/router';
import { PausaComponent } from '../pausa/pausa.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { LoginComponent } from '../login/login.component';
import { TurnoySerieComponent } from '../turnoy-serie/turnoy-serie.component';
import { IdeditComponent } from '../idedit/idedit.component';
import { MotivosComponent } from '../motivos/motivos.component';
import { DerivarSerieComponent } from '../derivar-serie/derivar-serie.component';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs';
import { MotivosService } from '../services/motivos.service';
import { MotivosAtencionComponent } from '../motivos-atencion/motivos-atencion.component';
import { AppConfig } from '../app.config';
import { ErrorComponent } from '../error/error.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public dialog: BsModalRef = null;
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
    private modalService: BsModalService,
    private config: AppConfig
  ) {
    /*
    this.modalService.onHide.subscribe((event: any) => {
      this.dialog = null;
    });*/

    this.observable = new Observable<boolean>((observer: any) => this.observer = observer).share();

    this.settings.dTur.value.subscribe(value => {
      this.number = parseInt(value);
      if(this.number > 0) {
        this.letter = true;
        //this.observer.next(true);
      } else {
        this.letter = false;
      }
      
    });

    this.client = this.config.get('clients')[this.config.get('clients').client];
    this.settings.isLogged.subscribe((value: boolean) => {
      if(this.client.MotivosExt) {
        if(this.consService.loginModel.IdEscritorio) {
          if(value) {
            this.MotivosService.AccLGISET(this.consService.loginModel);
            this.MotivosService.AccMotivos();
          } else {
            this.MotivosService.AccLGO(); //bugs cannot closed session   
          }    
        }
        
      }
        
    });

  }


  ngOnInit() {
   
    this.settings.lastError.isError.subscribe(value => {
      if(value) {
        
        if(!this.dialog) {
          //this.dialog = this.modalService.show(ModalErrorComponent);
        }
      }
    },
    err => {
      console.log(err);
  });

    this.settings.Modal.self.subscribe((modalEnum: ModalEnum) => {
      console.log("home modal", modalEnum);
      if(modalEnum != null)
      {
        this.lastModal = modalEnum;
      }
           
      if(this.settings.Modal.show) {
        switch(modalEnum) {        
          case ModalEnum.GETPAUSAS:
              this.dialog = this.modalService.show(PausaComponent);
            break;
          case ModalEnum.LOGIN:
              this.dialog = this.modalService.show(LoginComponent);
            break;
          case ModalEnum.GETSERIES_URGSER:
              this.dialog = this.modalService.show(TurnoySerieComponent);
            break;
            case ModalEnum.GETSERIES_DRVSER:
              this.dialog = this.modalService.show(DerivarSerieComponent);
            break;
          case ModalEnum.IDEDIT:
              this.dialog = this.modalService.show(IdeditComponent);
            break;
          case ModalEnum.GETMOTIVOS:
              if(this.client.MotivosExt) {
                this.dialog = this.modalService.show(MotivosAtencionComponent);              
              } else {
                this.dialog = this.modalService.show(MotivosComponent);
              }            
            break;  
          case ModalEnum.ERROR:
              if(!this.dialog || this.settings.lastError.CodError == "11599") {
                if(this.settings.lastError.isError.getValue()) {
                  //this.dialog.hide();
                  this.dialog = this.modalService.show(ErrorComponent);
                }
                
              }
            break;        
        }
      } else {
        console.log("close dialog", this.dialog, this.lastModal, modalEnum );
        // close dialog
        if(this.dialog) {
          this.dialog.hide();
          this.dialog = null; 
        }
        
      }      
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
    this.consService.fnAccion(acc);
  }

  public fnIDedit() {
    this.dialog = this.modalService.show(IdeditComponent);
  }

  public AnimationEsperando() {
    let dEdo = this.settings.dEdo.value.getValue();
        if(dEdo == 'ESPERANDO') {
          return true;
        }
        return false;
      
  }

  public AnimationLlamando(): boolean {
    let dEdo = this.settings.dEdo.value.getValue();
    if(dEdo == 'LLAMANDO') {
        return true;
      }
      return false;
  }

  
}
