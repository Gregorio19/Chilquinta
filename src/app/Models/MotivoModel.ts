import { BehaviorSubject, Subject } from 'rxjs/Rx';
import { ObserveOnMessage } from 'rxjs/operators/observeOn';

export class SSSMotivosAtencion {
    IdSSSMot: number;
    IdSSMot: number;
    IdSMot: number;
    IdMotivo: number;
    SSSubMotivo: number;
    fPreMot: number;
    PreMotAlias: string;
  }
  
  export class SSMotivosAtencion {
    IdSSMot: number;
    IdSMot: number;
    IdMotivo: number;
    SSubMotivo: string;
    SSSMot: Array<SSSMotivosAtencion>;
  
    constructor() {
      this.SSSMot = new Array<SSSMotivosAtencion>();
    }
  }
  
  export class SMotivosAtencion {
    IdSMot: number;
    IdMotivo: number;
    SubMotivo: string;
    SSMot: Array<SSMotivosAtencion>;
  
    constructor() {
      this.SSMot = new Array<SSMotivosAtencion>();
    }
  }
  
  export class MotivosAtencion {
    IdMotivo: number;
    Motivo: string;
    Series: Array<number>;  
    SMot: Array<SMotivosAtencion>;
  
    constructor() {
      this.SMot = new Array<SMotivosAtencion>();
    }
  }
  
  export class PreMotivo {
    fPreMot: number;
    PreMotAlias: string;
    Mot: MotivosAtencion;
    SMot: SMotivosAtencion;
    SSMot: SSMotivosAtencion;
    SSSMot: SSSMotivosAtencion;
  }
  
  /*
  export class Motivos {
    Nombre: string;
    ejecutivo: number;
    Mot: [MotivosAtencion];
    SMot: [SMotivosAtencion];
    SSMot: [SSMotivosAtencion];
    SSSMot: [SSSMotivosAtencion];
  }
  */
  export class MotivoModel {
    Traf: PreMotivo[];// Array<PreMotivo>;
    Mot: Array<MotivosAtencion>;
    /*SMot: Array<SMotivosAtencion>;
    SSMot: Array<SSMotivosAtencion>;
    SSSMot: Array<SSSMotivosAtencion>;*/
  
    constructor() {
      this.Mot = new Array<MotivosAtencion>();
    }
  }
  
  export class _MotivoModel {
    Traf: PreMotivo[]; //Array<PreMotivo>;
    Mot: MotivosAtencion;
    SMot: SMotivosAtencion;
    SSMot: SSMotivosAtencion;
    SSSMot: SSSMotivosAtencion;
  }
  
  // model selected
  export class __MotivoModel {
    Traf: Array<PreMotivo>;
    Mot: BehaviorSubject<MotivosAtencion[]>;
    SMot: Array<SMotivosAtencion>;
    SSMot: Array<SSMotivosAtencion>;
    SSSMot: Array<SSSMotivosAtencion>;
  
    constructor() {
      this.Traf = new Array<PreMotivo>();
      this.Mot = new BehaviorSubject<MotivosAtencion[]>(null);
      this.SMot = new Array<SMotivosAtencion>();
      this.SSMot = new Array<SSMotivosAtencion>();
      this.SSSMot = new Array<SSSMotivosAtencion>();
    }
  }