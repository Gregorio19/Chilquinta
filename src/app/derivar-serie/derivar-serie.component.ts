import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConsService } from '../services/Cons.service';
import { SettingsService } from '../services/settings.service';
import { AccEnum, ModalEnum } from '../Models/Enums';
import { AppConfig } from '../app.config';

@Component({
  selector: 'app-derivar-serie',
  templateUrl: './derivar-serie.component.html',
  styleUrls: ['./derivar-serie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DerivarSerieComponent implements OnInit {
  derivarSerieForm: FormGroup;
  model = new DerivarSerie();
  client: any;

  constructor(
    private consService: ConsService,
    public settings: SettingsService,
    public fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private config: AppConfig
  ) {

  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnInit() {
    this.client = this.config.get('clients')[this.config.get('clients').client];

    this.derivarSerieForm = this.fb.group({
      rbSer: [null, Validators.required],
      rbDrv: [null, [Validators.required]]
    });

    this.model.rbDrv = 'N';
  }

  closed(): void {
    this.consService.closeModal(ModalEnum.GETSERIES_DRVSER);
  }

  fnAccion(accion: string) {
    this.settings.rbSer.checked.next(true);
    this.settings.rbDrv.checked.next(true);
    this.settings.rbSer.value.next(this.model.rbSer);
    this.settings.rbDrv.value.next(this.model.rbDrv);

    let acc: AccEnum = <AccEnum>AccEnum[accion];
    this.consService.fnAccion(acc);
    this.closed();

  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    this.consService.clearError();
  }

  showRbSer(idSerie): boolean {
    if (this.settings.hiIdSDRV != idSerie) {
      return true;
    }
    return false;
  }

}

export class DerivarSerie {
  rbSer: string;
  rbDrv: string;
}