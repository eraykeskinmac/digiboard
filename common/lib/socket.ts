import { Socket, io } from 'socket.io-client';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
