import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule] 
})

export class ChatComponent implements OnInit {
  rooms: string[] = ['English', 'French', 'Spanish', 'German'];
  currentRoom: string | null = null;
  username: string = '';
  message: string = '';
  messages: any[] = [];

  constructor(private socket: Socket) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Anonymous';
    console.log("Loaded username:", this.username);
  
    this.socket.on('message', (data: any) => {
      console.log("Incoming message:", data);
      this.messages.push(data);
    });
  }
  
  joinRoom(room: string): void {
    this.currentRoom = room;
    this.messages = []; // clear previous messages
    this.socket.emit('joinRoom', room);
  }

  sendMessage(): void {
    if (!this.message.trim()) return;
    this.socket.emit('chatMessage', {
      room: this.currentRoom,
      username: this.username,
      message: this.message
    });
    this.message = '';
  }
}
