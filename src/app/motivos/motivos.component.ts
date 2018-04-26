import { Component, OnInit } from '@angular/core';
import { ConsService } from '../services/Cons.service';
import { SettingsService } from '../services/settings.service';
import { BsModalRef } from 'ngx-bootstrap';
import { AccEnum, tElement } from '../Models/Enums';
import { environment } from '../../environments/environment';
import { AppConfig } from '../app.config';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-motivos',
  templateUrl: './motivos.component.html',
  styleUrls: ['./motivos.component.scss']
})
export class MotivosComponent implements OnInit {
  MotivosForm: FormGroup;
  rows: any[] = [];
  selected = [];
  loadingIndicator: boolean = true; 
  messages = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: 'No hay motivos',

    // Footer total message
    totalMessage: 'total',
    selectedMessage: 'seleccionado'
  };

  MotCierre: string = this.config.get('MotCierre');
  isError: boolean = false;

  client: any;
    
  constructor(
    private consService: ConsService,
    public settings: SettingsService,
    public bsModalRef: BsModalRef,
    private config: AppConfig,
    public fb: FormBuilder,
  ) { }
  
  ngOnInit() {
    this.client = this.config.get('clients')[this.config.get('clients').client];

    this.MotivosForm = this.fb.group({
      txMot: [null, Validators.compose([
          CustomValidators.number
        ])
      ]
    });

      this.settings.Motivos.subscribe(motivos => {        
        motivos.map(m => {
            this.rows.push({
              "IDMot": m.IdMot,
              "cbMot": 1,
              "Motivo": m.Motivo
            })
        })
        //this.rows = motivos; 
        setTimeout(() => { this.loadingIndicator = false; }, 1500); 
      });
      
  }

  closed(): void {
    this.bsModalRef.hide();
  }

  fnAccion() {
    this.settings.cbMot = [];
    this.selected.forEach(s => {
      let elem = {
        "IdMot": s.IDMot,
        "Cantidad": s.cbMot
      };
      this.settings.cbMot.push(elem);
    });

    if(this.settings.cbMot.length > 0) {
      this.consService.fnAccion(AccEnum.FINTUR);
    }
    
    this.consService.IsError().subscribe(isError => {
      if(isError && !isError) {
        this.bsModalRef.hide();
      }
    });
    
  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    this.consService.clearError();
  }

  /*get urgTur() {
    return this.TurnoySerieForm.get('urgTur');
  }*/

  onSelect({ selected }) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    if(typeof selected === 'undefined') {
      return;
    }
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);    
  } 

  updateValue(event, cell, rowIndex) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  onActivate(event) {
    
  }

  Clear() {
    this.isError = false;
  }

}
