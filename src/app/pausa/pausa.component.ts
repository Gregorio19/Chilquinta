import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormControl, NgForm, FormBuilder } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { ConsService } from '../services/Cons.service';
import { AccEnum } from '../Models/Enums';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AppConfig } from '../app.config';

@Component({
  selector: 'app-pausa',
  templateUrl: './pausa.component.html',
  styleUrls: ['./pausa.component.scss']
})

export class PausaComponent implements OnInit {
  pausaForm: FormGroup;
  rbPau: string='';
  client: any;
   
  constructor(
    public settings: SettingsService,
    private consService: ConsService,    
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    private config: AppConfig,
  ) {    
   }

  ngOnInit() {
    this.client = this.config.get('clients')[this.config.get('clients').client];

    this.pausaForm = this.fb.group({
      rbPau: [null, Validators.required]
      });
  }

  closed(): void {
    this.bsModalRef.hide();
  }

  fnAccion(accion: string) {
    this.settings.rbPau.checked.next(true); 
    this.settings.rbPau.value.next(this.rbPau);    

    let acc: AccEnum = <AccEnum>AccEnum[accion];
    this.consService.fnAccion(acc);
    this.bsModalRef.hide();
  }

  onChanges(val) {
    this.consService.clearError();
  }

}
