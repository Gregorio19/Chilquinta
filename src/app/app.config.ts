import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppConfig {
    private config: Object = null;

    constructor(private http: HttpClient) {

    }

    public get(key: any) {
        return this.config[key];
    }

    public load() {
        return new Promise((resolve, reject) => {
            this.http.get(environment.configJson)
            .catch((error: any):any => {
                var d = new Date();              
                console.log(d, ' Configuración no encontrada');
                resolve(true);
                return Observable.throw(error.json().error || 'Server error');
            }).subscribe( (responseData) => {                
                this.config = responseData;
                resolve(true);                
            });

        });
    }
}