import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { AppConfig } from '../app.config';
import { __MotivoModel, _MotivoModel, SSMotivosAtencion, SSSMotivosAtencion, SMotivosAtencion } from '../Models/MotivoModel';
import { ISubscription } from 'rxjs/Subscription';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-motivos-atencion-busqueda',
  templateUrl: './motivos-atencion-busqueda.component.html',
  styleUrls: ['./motivos-atencion-busqueda.component.scss']
})
export class MotivosAtencionBusquedaComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;

  title: string;
  //_motivos: _MotivoModel; // motivos desde gateway
  motivos: __MotivoModel; // motivos cargados con selected
  motivoModel: _MotivoModel; // motivos del form
  columns = [];
  rows: any[] = [];
  rowsTemp: any[] = [];
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

  client: any;

  constructor(
    public settings: SettingsService,
    private config: AppConfig,
    @Inject(MAT_DIALOG_DATA) data,
    public dialogRef: MatDialogRef<MotivosAtencionBusquedaComponent>
  ) {
    this.motivoModel = data.motivoModel;
    this.motivos = data.motivos;
  }

  ngOnInit() {
    this.client = this.config.get('clients')[this.config.get('clients').client];

    this.getRows();
    this.rowsTemp = this.rows;
  }

  getRows() {
    if (this.motivoModel.SSMot) {
      this.motivoModel.SSMot.SSSMot.forEach(s => {
        let t = this.motivoModel.SMot;
        let m = this.motivoModel.SSMot;
        this.rows.push({
          "IdMotivo": this.motivoModel.Mot.IdMotivo,
          "IdSMot": t.IdSMot,
          "IdSSMot": m.IdSSMot,
          "IdSSSMot": s.IdSSSMot,
          "Tramites": s.SSSubMotivo
        });
      });
      this.columns.push({
        prop: 'Tramites'
      });
      setTimeout(() => { this.loadingIndicator = false; }, 1500);

    } else if (this.motivoModel.SMot) {
      this.motivos.SSMot.forEach((m: SSMotivosAtencion) => {
        let t = this.motivoModel.SMot;
        m.SSSMot.forEach((s: SSSMotivosAtencion) => {
          this.rows.push({
            "IdMotivo": this.motivoModel.Mot.IdMotivo,
            "IdSMot": t.IdSMot,
            "IdSSMot": m.IdSSMot,
            "IdSSSMot": s.IdSSSMot,
            "Temas": m.SSubMotivo,
            "Tramites": s.SSSubMotivo
          });
        });


      });
      this.columns.push(
        { prop: "Temas" },
        { prop: 'Tramites' }
      );
      setTimeout(() => { this.loadingIndicator = false; }, 1500);
    } else if (this.motivoModel.Mot) {
      this.motivoModel.Mot.SMot.forEach((t: SMotivosAtencion) => {
        t.SSMot.forEach((m: SSMotivosAtencion) => {
          m.SSSMot.forEach((s: SSSMotivosAtencion) => {
            this.rows.push({
              "IdMotivo": this.motivoModel.Mot.IdMotivo,
              "IdSMot": t.IdSMot,
              "IdSSMot": m.IdSSMot,
              "IdSSSMot": s.IdSSSMot,
              "TipoMateria": t.SubMotivo,
              "Temas": m.SSubMotivo,
              "Tramites": s.SSSubMotivo
            });
          });
        });

      })

      this.columns.push(
        { prop: "TipoMateria", name: "Tipo Materia" },
        { prop: "Temas" },
        { prop: 'Tramites' }
      );
      setTimeout(() => { this.loadingIndicator = false; }, 1500);
    }
  }

  closed(): void {
    this.dialogRef.close();
    
  }

  onChanges(val) {
    this.settings.iTOw = this.config.get('socket').TOwin;
    //this.consService.clearError();
  }

  /*get urgTur() {
    return this.TurnoySerieForm.get('urgTur');
  }*/

  onSelect({ selected }) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    if (typeof selected === 'undefined') {
      return;
    }
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event) {

  }

  Enviar() {
    this.dialogRef.close(this.selected[0]);

  }

  updateFilterTMateria(event) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    const val = event.target.value.toLowerCase();

    const temp = this.rowsTemp.filter((d) => {
      return d.TipoMateria.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;
    this.table.offset = 0;
  }

  updateFilterTemas(event) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    const val = event.target.value.toLowerCase();

    const temp = this.rowsTemp.filter((d) => {
      return d.Temas.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;
    this.table.offset = 0;
  }

  updateFilterTramite(event) {
    this.settings.iTOw = this.config.get('socket').TOwin;

    const val = event.target.value.toLowerCase();

    const temp = this.rowsTemp.filter((d) => {
      return d.Tramites.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;
    this.table.offset = 0;
  }

  isVisibleTipoMateria(): boolean {
    if (this.motivoModel.Mot &&
      (!this.motivoModel.SMot && !this.motivoModel.SSMot)) {
      return true;
    }
    return false;
  }

  isVisibleTemas(): boolean {
    if (!this.motivoModel.SSMot) {
      return true;
    }
    return false;
  }

  isVisibleTramite(): boolean {
    if (!this.motivoModel.SSMot) {
      return true;
    }
    return false;
  }
}
