import { Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';
import { WebsocketService } from '../services/Websocket.service';
import { UserModel } from '../Models/UserModel';
import { Subscription, ISubscription } from 'rxjs/Subscription'
import { IfObservable } from 'rxjs/observable/IfObservable';
import { Observable } from 'rxjs/Observable';
import { LoginModel } from '../Models/LoginModel';
import { ActionEnum, ModalEnum } from '../Models/Enums';
import { SettingsService } from '../services/settings.service';
import { Action } from 'rxjs/scheduler/Action';
import { ConsService } from '../services/Cons.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { CustomValidators } from 'ng2-validation';
import { AppConfig } from '../app.config';
import { MotivosService } from '../services/motivos.service';
import { ConfEjeComponent } from '../conf-eje/conf-eje.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginModel: LoginModel;
  loginForm: FormGroup;

  client: any;

  data: ISubscription;

  constructor(
    public consService: ConsService,
    public settings: SettingsService,
    public fb: FormBuilder,
    private config: AppConfig,
    public MotivosService: MotivosService,
    private changeDetection: ChangeDetectorRef
  ) {
    this.loginModel = new LoginModel();

  }

  ngOnInit() {
    this.client = this.config.get('clients')[this.config.get('clients').client];

    if (this.client.LoginWithUserPass) {
      this.loginForm = this.fb.group({
        txEsc: [null, Validators.compose([
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(3),
          CustomValidators.number
        ])
        ],
        txUsr: [null, Validators.compose([
          Validators.required,
          Validators.maxLength(15)
        ])],
        txPsw: [null, Validators.compose([
          Validators.required,
          Validators.maxLength(15)
        ])
        ]
      });
    } else {
      this.loginForm = this.fb.group({
        txEsc: [null, Validators.compose([
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(3),
          CustomValidators.number
        ])
        ],
      });
    }

    this.data = this.settings.data.subscribe(value => {
      if (value) {
        this.consService.AccLGISET(this.loginModel);

        if (this.consService.IsLogged) {
          this.closed();
        }
      }
    });

  }

  loginBtn() {
    this.loginModel.Id = "1";
    this.loginModel.MsgType = ActionEnum.LOGIN;
    this.loginModel.ClienteInterno = "";
    this.loginModel.IdEscritorio = this.loginModel.IdEscritorio.toString();
    if (!this.client.LoginWithUserPass) {
      if (this.config.get('clients').client == "Chilquinta") {
        this.loginModel.User = 'ntapia';
        this.loginModel.Pass = "1234";
      } else {
        this.loginModel.User = this.settings.hiUsr;
      }


    }

    this.consService.AccLGISET(this.loginModel);
  }

  closed(): void {
    this.consService.closeModal(ModalEnum.LOGIN);
  }

  ngOnDestroy() {
    this.data.unsubscribe();
  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    this.consService.clearError();
  }
}
