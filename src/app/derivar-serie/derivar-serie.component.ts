import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConsService } from '../services/Cons.service';
import { SettingsService } from '../services/settings.service';
import { BsModalRef } from 'ngx-bootstrap';
import { AccEnum } from '../Models/Enums';
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
  
  constructor(
    private consService: ConsService,
    public settings: SettingsService,
    public fb: FormBuilder,
    public bsModalRef: BsModalRef,
    private cd: ChangeDetectorRef,
    private config: AppConfig
  ) { }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }
  
  ngOnInit() {
    this.derivarSerieForm = this.fb.group({
      rbSer: ['', Validators.required],
      rbDrv: ['', [Validators.required]]
      });
  }

  closed(): void {
    this.bsModalRef.hide();
  }

  fnAccion(accion: string) {
    this.settings.rbSer.checked.next(true); 
    this.settings.rbSer.value.next(this.model.rbSer);
    this.settings.rbDrv.value.next(this.model.rbDrv);

    let acc: AccEnum = <AccEnum>AccEnum[accion];
    this.consService.fnAccion(acc);
    this.settings.lastError.isError.subscribe(isError => {
      console.log("lasterror");
      if(isError && !isError) {
        this.bsModalRef.hide();
      }
    });
    
  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    this.consService.clearError();
  }

  showRbSer(idSerie): boolean {
    if(this.settings.hiIdSDRV != idSerie) {
      return true;
    }

    return false;
  }

  
}

export class DerivarSerie {
  rbSer: string;
  rbDrv: string;
}