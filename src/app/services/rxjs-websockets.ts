import { Observable, Subscribable } from 'rxjs/Observable'
import { AnonymousSubscription } from 'rxjs/Subscription'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

export interface Connection {
  connectionStatus: Observable<number>,
  messages: Observable<string>,
  open: BehaviorSubject<boolean>
}

export interface IWebSocket {
  close()
  send(data: string | ArrayBuffer | Blob)
  onopen?: (OpenEvent: any) => any
  onclose?: (CloseEvent: any) => any
  onmessage?: (MessageEvent: any) => any
  onerror?: (ErrorEvent: any) => any
}

export type WebSocketFactory = (url: string, protocols?: string | string[]) => IWebSocket

const defaultWebsocketFactory = (url: string, protocol?: string): IWebSocket => new WebSocket(url, protocol)

export default function connect(
  url: string,
  input: Subscribable<string>,
  protocols?: string | string[],
  websocketFactory: WebSocketFactory = defaultWebsocketFactory
): Connection {
  const connectionStatus = new BehaviorSubject<number>(0)
  const open = new BehaviorSubject<boolean>(false);

  const messages = new Observable<string>(observer => {
    let socket = null;
    try {
      socket = websocketFactory(url, protocols)
    } catch (e) {
      observer.error(e);
    }

    let inputSubscription: AnonymousSubscription

    //let open = false
    const closed = () => {
      if (!open.getValue())
        return

      connectionStatus.next(connectionStatus.getValue() - 1)
      open.next(false);
    }

    socket.onopen = () => {
      open.next(true);
      connectionStatus.next(connectionStatus.getValue() + 1)
      inputSubscription = input.subscribe(data => {
        socket.send(data)
      })
    }

    socket.onmessage = (message: MessageEvent) => {
      var d = new Date();
      //console.log(d);
      console.log(d, "onmessage: ", message.data);
      observer.next(message.data)
    }

    socket.onerror = (error: ErrorEvent) => {
      closed()
      observer.error(error)
    }

    socket.onclose = (event: CloseEvent) => {
      closed()
      if (event.wasClean)
        observer.complete()
      else
        observer.error(new Error(event.reason))
    }

    return () => {
      if (inputSubscription) {
        inputSubscription.unsubscribe()
      }


      if (socket) {
        closed()
        socket.close()
      }
    }
  })

  return { messages, connectionStatus, open }
}