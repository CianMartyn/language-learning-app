import { SocketIoConfig } from 'ngx-socket-io';

export const socketConfig: SocketIoConfig = {
  url: 'http://localhost:5000', //  Node.js server
  options: {
    transports: ['websocket'], 
  },
};
