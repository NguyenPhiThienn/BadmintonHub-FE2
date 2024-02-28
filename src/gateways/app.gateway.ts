import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // User joins their personal room for notifications
  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    const room = `user:${data.userId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', data: { room } };
  }

  // User leaves their room
  @SubscribeMessage('leave')
  handleLeave(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    const room = `user:${data.userId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { event: 'left', data: { room } };
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    const room = `user:${userId}`;
    this.server.to(room).emit(event, data);
    this.logger.log(`Sent ${event} to ${room}`);
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Broadcast ${event} to all clients`);
  }

  // Admin notifies all owners
  @SubscribeMessage('admin:broadcast')
  handleAdminBroadcast(@MessageBody() data: { message: string; type: string }, @ConnectedSocket() client: Socket) {
    this.broadcast('admin:notification', data);
    return { event: 'broadcast-sent', data: { success: true } };
  }
}
