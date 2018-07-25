import { BaseModel } from "./BaseModel";

export class LoginModel extends BaseModel {
    public User : string;
    public Pass : string;
        
    public toJson() {
        return JSON.stringify({
            MsgType : this.MsgType,
            ClienteInterno : this.ClienteInterno,
            Id : this.Id,
            IdEscritorio : this.IdEscritorio,
            User : this.User,
            Pass : this.Pass
          });
    }
}