import { ActionEnum } from "./Enums";
import { BaseModel } from "./BaseModel";

export class ProtoModel extends BaseModel {
    public Motivos : any[];
    public Encuesta : any[];
    public IdPausa: string;
    public IdSerie: number;
    public Turno: string;
    public Rut: string;
    public Fono: string;


    public toJson() {
        return JSON.stringify({
            MsgType : this.MsgType,
            ClienteInterno : this.ClienteInterno,
            Id : this.Id,
            IdEscritorio : this.IdEscritorio
          });
    }
    
    public FINTURtoJson() {
        return JSON.stringify({
            MsgType : this.MsgType,
            ClienteInterno : this.ClienteInterno,
            Id : this.Id,
            IdEscritorio : this.IdEscritorio,
            Motivos : this.Motivos,
            Encuesta : this.Encuesta
          });
    }

    public PAUSETtoJson() {
        return JSON.stringify({
            MsgType : this.MsgType,
            ClienteInterno : this.ClienteInterno,
            Id : this.Id,
            IdEscritorio : this.IdEscritorio,  
            IdPausa : this.IdPausa          
          });
    }
    
    public URGSETtoJson() {
        return JSON.stringify({
            MsgType : ActionEnum.URGENCIA,
            ClienteInterno : this.ClienteInterno,
            Id : this.Id,
            IdEscritorio : this.IdEscritorio,
            IdSerie : this.IdSerie,
            Turno : this.Turno
          });
    }

    public DRVSERtoJson() {
        return JSON.stringify({
            MsgType : ActionEnum.GETSERIES,
            ClienteInterno : this.ClienteInterno,
            Id : this.Id,
            IdEscritorio : this.IdEscritorio,
            //IdSerie : this.IdSerie
          });
    }

    public DRVSETtoJson() {
        return JSON.stringify({
            MsgType : ActionEnum.DERIVOTURNO,
            ClienteInterno : this.ClienteInterno,
            Id : this.Id,
            IdEscritorio : this.IdEscritorio,
            IdSerie : this.IdSerie
          });
    }

    public SIDtoJson() {
        return JSON.stringify({
            MsgType : ActionEnum.SETIDC,
            ClienteInterno : this.ClienteInterno,
            Id : this.Id,
            IdEscritorio : this.IdEscritorio,
            Rut : this.Rut,
            Fono : this.Fono
          });
    }
}