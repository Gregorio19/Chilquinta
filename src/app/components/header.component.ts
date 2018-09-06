import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../services/settings.service';
import { ConsService } from '../services/Cons.service';
import { AccEnum } from '../Models/Enums';
import { AppConfig } from '../app.config';


declare let TweenMax: any;
declare let TimelineMax: any;
declare let Power0: any;

@Component({
  selector: 'header-section',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {
  public isLogged: boolean = false;
  isCollapsed = true;
  public pausaEnable: boolean = false;

  constructor(
    private consService: ConsService,
    public settings: SettingsService,
    private config: AppConfig,    
  ) {
    if(this.config.get('socket').ActivarPausa == "S"){
      this.pausaEnable = true;
    }    
    
  }

  fnAccion(accion: string) {
    let acc: AccEnum = <AccEnum>AccEnum[accion];
    this.settings.IdPausaFin = 1;  
    //var d = new Date();
    //console.log(d," idPausaFin botonPausa: ", this.settings.IdPausaFin);
    this.consService.fnAccion(acc);
  }
  
}
