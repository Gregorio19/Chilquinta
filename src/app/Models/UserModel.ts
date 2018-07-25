import { LoginModel } from "./LoginModel";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

export class UserModel {
    Oficina: string;
    Escritorio: string;
    Ejecutivo: string;
    Encuestas: string[];
    Estado: string;
    Login: LoginModel;    
    
    constructor(
        Oficina: string = null,
        Escritorio: string = null,
        Ejecutivo: string = null,
        Encuestas: string[] = null,
        Estado: string = null,
        Login: LoginModel = null
    ) {
        this.Oficina = Oficina;
        this.Escritorio = Escritorio;
        this.Ejecutivo = Ejecutivo;
        this.Encuestas = Encuestas;
        this.Estado = Estado;
        this.Login = Login;
    }

    public toJson() {
        return JSON.stringify({
            Oficina: this.Oficina,
            Escritorio: this.Escritorio,
            Ejecutivo: this.Ejecutivo,
            Encuestas: this.Encuestas
          });
    }
}