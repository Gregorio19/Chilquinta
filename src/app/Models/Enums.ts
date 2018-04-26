import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs";

export enum ActionEnum {
    LOGIN = "{8D0A29DE-1482-4859-A3A6-A01507D7D2A4}",
    GETUSERNAME = "{13a134e4-d931-481c-a873-77a4d9284e1e}",
    LOGOFF = "{4A590315-9EAD-4BA4-8E53-051D833FC1D8}",
    GETEDOBASE = "{D25128B7-6752-4312-B179-5141593CF65A}",
    GETEDOSESION = "{030AF03D-9B04-4C13-90F7-3C7A82CFEE1B}",
    GETPAUSAS = "{C1356B4F-BBD4-45DE-AD11-7DBB3E6C485E}",
    GETSERIES = "{78F8EBAA-ED7E-4E74-89F6-606E3DDBBFEF}",
    GETMOTIVOS = "{BC877A80-62DF-420A-9C16-C36D30AC04C2}",
    SETPAUSA = "{0A1082E1-82AA-456B-890B-CABDEB2062D3}",
    PIDOTURNO = "{0F988841-06E7-4186-AA03-CE6D0197764D}",
    RELLAMO = "{4E3B009C-122C-4B4B-B8E0-CEBD616B4322}",
    ANULO = "{EB932F11-DAB1-4F50-9C52-FEA43BBD04E2}",
    PROCESOTURNO = "{6CD9A884-3073-4822-A599-AC3269DC4A1D}",
    FINTURNO = "{988BFF9A-B829-424B-AC31-C1D5BED81951}",
    DERIVOTURNO = "{E1873C72-B4C8-48CB-B7C0-09AAB9F2D16F}",
    URGENCIA = "{B72D2104-C0E5-42E6-8957-041F70E3C499}",
    SETIDC = "{F750E487-F33E-4034-BD79-C05E4FA61A97}"
  }

  export enum AccEnum {
    EDB = "EDB",
    EDS = "EDS",
    LGI = "LGI",
    LGISET = "LGISET",
    LGO= "LGO",
    INI = "INI",
    FIN = "FIN",
    FINTUR = "FINTUR",
    PAUGET = "PAUGET",
    PAUSET = "PAUSET",
    LLE = "LLE",
    RLL = "RLL",
    NUL = "NUL",
    URGSER = "URGSER",
    URGSET = "URGSET",
    DRVSER = "DRVSER",
    DRVSET = "DRVSET",
    SID = "SID",
    LOG = "LOG",
    LOGOFF = "LOGOFF",
    PAUSA = "PAUSA",
    ESPERANDO = "ESPERANDO",
    LLAMANDO = "LLAMANDO",
    ATENDIENDO = "ATENDIENDO",
    UNKNOW = "UNKNOW",
    X = "x" 
  }
  
  export class tElement {
    disable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    value: BehaviorSubject<string> = new BehaviorSubject<string>("");
    data: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    show: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    class: BehaviorSubject<string> = new BehaviorSubject<string>("");
    onclick: boolean = false;
    checked: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    name: string;
  }

  
  export enum ModalEnum {
    GETPAUSAS = "GETPAUSAS",
    GETSERIES_DRVSER = "DRVSER",
    GETSERIES_URGSER = "URGSER",
    GETMOTIVOS = "GETMOTIVOS",
    LOGIN = "LOGIN",
    IDEDIT = "IDEDIT",
    ERROR = "ERROR",
    MSGURGTURN = "MSGURGTURN",
    CONFEJE = "CONFEJE"
  }

  export class tModalElement {
    //show: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    show: boolean = false;
    self: BehaviorSubject<ModalEnum> = new BehaviorSubject<ModalEnum>(null);
  }

  export class MsgError {
    MsgType: ActionEnum;
    CodError: string;
    DescError: string;
    isError: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
    //isError: Observable<boolean> = new Observable<boolean>();
  }