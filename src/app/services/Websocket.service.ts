import { Injectable } from '@angular/core'
import { QueueingSubject } from 'queueing-subject'
import { Observable } from 'rxjs/Observable'
import websocketConnect from './rxjs-websockets'
import 'rxjs/add/operator/share'

//@Injectable()
export class WebsocketService {
  private inputStream: QueueingSubject<string>
  public messages: Observable<string>
  public open: Observable<boolean>;
  
  constructor(    
  ) {
    console.clear();
  }

  public connect(url: string) {
    if (this.messages)
      return

    console.log("connecting to server [%s] ...", url);

    // Using share() causes a single websocket to be created when the first
    // observer subscribes. This socket is shared with subsequent observers
    // and closed when the observer count falls to zero.
    //let connectionStatus: Observable<number>;

    const { connectionStatus, messages, open } = websocketConnect(
      url,
      this.inputStream = new QueueingSubject<string>()
    );
    this.messages = messages.share();
    this.open = open;
    this.messages.share();
  }

  public send(message: string, accion: string):void {
    // If the websocket is not connected then the QueueingSubject will ensure
    // that messages are queued and delivered when the websocket reconnects.
    // A regular Subject can be used to discard messages sent when the websocket
    // is disconnected.
    console.log("acc =", accion);
    console.log("req 2=", message);
    this.inputStream.next(message)
  }
}


