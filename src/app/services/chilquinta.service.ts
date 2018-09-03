import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams, Response } from '@angular/http';
import { environment } from '../../environments/environment';
import { AppConfig } from '../app.config';
import { SettingsService } from './settings.service';
import { HttpClient, HttpHeaders, HttpParams, HttpParameterCodec } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Turno } from '../Models/chilquintaturno';
import { RespuestaLog } from '../Models/RespuestaLog';
import { Observable } from 'rxjs/Observable';

export class HttpFormEncodingCodec implements HttpParameterCodec {
  encodeKey(k: string): string { return encodeURIComponent(k).replace(/%20/g, '+'); }

  encodeValue(v: string): string { return encodeURIComponent(v).replace(/%20/g, '+'); }

  decodeKey(k: string): string { return decodeURIComponent(k.replace(/\+/g, ' ')); }

  decodeValue(v: string) { return decodeURIComponent(v.replace(/\+/g, ' ')); }
}

@Injectable()
export class ChilquintaService {

  RespuestaLogs: RespuestaLog[];
  domain: string;

  constructor(private http: HttpClient, private config: AppConfig) {
    this.RespuestaLogs = [];
    this.domain = this.config.get('clients')["Chilquinta"].UrlapiContact;
  }

  extractData(res: Response) {// Manejadoresd de Errores o Procesos correctos
    let body = res.json();
    return body || {};
  }
  handleErrorPromise(error: Response | any) {// Manejadoresd de retornos de Errores o Procesos correctos
    console.error(error.message || error);
    return Promise.reject(error.message || error);
  }

  addchilquintaServ(newTask: Turno, dataurl) {// Enviar Datos de Consulta de turno al Servicio.

    let url: string = this.domain  + dataurl + "/";
    console.log(url);

    var headers: HttpHeaders = new HttpHeaders().append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    const body = new HttpParams({ encoder: new HttpFormEncodingCodec() })
      .append('login', newTask.login.toString())
      .append('num_atencion', newTask.num_atencion.toString())
      .toString();
    return this.http.post(url, body, { headers: headers })
  }


  getLocalResp(): RespuestaLog[] {// Obtener Datos del Local Storage (Cokkies)
    if (localStorage.getItem('LocalLogResps') === null) {
      this.RespuestaLogs = [];
      console.log(this.RespuestaLogs);
    } else {
      this.RespuestaLogs = JSON.parse(localStorage.getItem('LocalLogResps'));
      // console.log(this.RespuestaLogs);
      //----------------------------------Imprimir documento txt---------------------------\n
      let documents = "";
      this.RespuestaLogs.forEach(element => {
        documents =  documents  
        + element.FechadeAgregado + "," 
        + element.NombreOficina+ "," 
        + element.IdSerie+ "," 
        + element.IdEscritorio + "," 
        + element.NumeroTurnoCliente + ","  
        + element.RutCliente + ","
        + element.UserEjecutivo + ","
        + element.Respuesta
        + "\r\n";
      });
      var file = new Blob([documents], { type: "text/plain" });
      if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, "C:/Users/jose.paz/pruebadocumento.log");
      else { // Others
        var a = document.createElement("a"),
          url = URL.createObjectURL(file);
        a.href = url;
        a.download = "pruebadocumento";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      }
      //----------------------------------Imprimir documento txt---------------------------
    }
    return this.RespuestaLogs;
  }

  addLocalResp(RespuestaLog: RespuestaLog) {// Agregar Datos al LocalStorage  (Cokkies)
    this.RespuestaLogs.unshift(RespuestaLog);
    let RespuestaLogs
    if (localStorage.getItem('LocalLogResps') === null) {
      RespuestaLogs = [];
      RespuestaLogs.unshift(RespuestaLog);
      localStorage.setItem('LocalLogResps', JSON.stringify(RespuestaLogs));
      this.RespuestaLogs = [];
    } else {
      RespuestaLogs = JSON.parse(localStorage.getItem('LocalLogResps'));
      RespuestaLogs.unshift(RespuestaLog);
      localStorage.setItem('LocalLogResps', JSON.stringify(RespuestaLogs));
      //console.log(RespuestaLogs);
    }
  }

}
