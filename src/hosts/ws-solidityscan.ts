import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const bearerToken = process.env['SOLIDITYSCAN_TOKEN']

export function setupWsServer(server: HttpServer, path: string) {
  console.log('Setting up WebSocket server on path:' + path);

  const wss = new WebSocketServer({ server, path });

  wss.on('connection', (clientSocket: WebSocket) => {
    console.log('Client connected');

    // Connect to the SolidityScan WebSocket API
    const solidityScanSocket = new WebSocket('wss://api-ws.solidityscan.com');

    // Forward messages from SolidityScan to the client
    solidityScanSocket.on('open', () => {
      console.log('Connected to SolidityScan WebSocket');

      const tokenRegRequest = {
        "action": "message",
        "payload": {
          "type": "auth_token_register",
          "body": {
            "auth_token": bearerToken
          }
        }
      }
      console.log('Sending token registration request to SolidityScan:', tokenRegRequest);
      solidityScanSocket.send(JSON.stringify(tokenRegRequest))
    });

    solidityScanSocket.on('message', (data: Buffer) => {
      console.log('Message from SolidityScan:', data.toString());

      // Forward message to the client
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(data.toString());
      }
    });

    // Handle incoming messages from the client
    clientSocket.on('message', (message: Buffer) => {
      console.log('Received from client:', message.toString());
      const data = JSON.parse(message.toString());
      console.log('Sending to SolidityScan:', data);
      solidityScanSocket.send(JSON.stringify(data));
      // You can handle messages from the client here if needed
    });

    // Handle client disconnection
    clientSocket.on('close', () => {
      console.log('Client disconnected');
      solidityScanSocket.close();
    });

    // Handle SolidityScan WebSocket disconnection
    solidityScanSocket.on('close', () => {
      console.log('SolidityScan WebSocket disconnected');
    });

    // Handle errors
    solidityScanSocket.on('error', (error: Error) => {
      console.error('SolidityScan WebSocket error:', error);
    });

    clientSocket.on('error', (error: Error) => {
      console.error('Client WebSocket error:', error);
    });
  });
}
