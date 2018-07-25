import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../services/settings.service';
import { ConsService } from '../services/Cons.service';
import { AccEnum } from '../Models/Enums';
import { ChilquintaService } from '../services/chilquinta.service';
import { Turno } from '../Models/chilquintaturno';


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
    public settings: SettingsService,
    private ChilquintaService: ChilquintaService
  ) {

  }

  fnAccion(accion: string) {
    let acc: AccEnum = <AccEnum>AccEnum[accion];
    this.consService.fnAccion(acc);
  }

  probar_servicio() {
    var turno: Turno = { login: "ntapia", num_atencion: 55 };
    this.ChilquintaService.addchilquintaServ(turno, "13040718-8").subscribe(response => {
      console.log("hola ");
      console.log(response);
    },
      error => {
        console.log("hola error");
        console.log(error);

    });

  }

}
