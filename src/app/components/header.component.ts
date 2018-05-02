import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../services/settings.service';
import { ConsService } from '../services/Cons.service';
import { AccEnum } from '../Models/Enums';


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
  
  constructor(
    private consService: ConsService,
    public settings: SettingsService    
  ) {
    
    this.settings.isLogged.subscribe(value => {
    })
  }

  fnAccion(accion: string) {
    let acc: AccEnum = <AccEnum>AccEnum[accion];
    this.consService.fnAccion(acc);
  }
  
}
