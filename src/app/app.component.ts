import { Component, Inject, HostListener, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from './services/settings.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { ConsService } from './services/Cons.service';
import { MotivosService } from './services/motivos.service';
import { AppConfig } from './app.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, AfterViewInit {
  @ViewChild('Username') Username: ElementRef;
  client: any;

  ngOnDestroy(): void {
    this.consService.destroy();
    this.MotivosService.destroy();
  }
  constructor(
    public settings: SettingsService,
    public consService: ConsService,
    public MotivosService: MotivosService,
    private config: AppConfig    
  ) {       
    this.client = this.config.get('clients')[this.config.get('clients').client];
     }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event) {
    var dialogText = '¿Desea salir de la sesión?';
    (event || window.event).returnValue = dialogText; // Gecko + IE
    return dialogText; // Webkit, Safari, Chrome etc.
  }
  
  @HostListener('window:unload', ['$event'])
  unloadHandler(event) 
  {
    this.consService.AccLGO();
    this.MotivosService.AccLGO(); 
  }
  
  ngAfterViewInit()
  {
   if(!this.client.LoginWithUserPass) {
     let elem = <HTMLInputElement>document.getElementById('Username');
     if(elem) {
      let username = elem.value;
      this.settings.hiUsr = username;
     }
   }
  }

}
