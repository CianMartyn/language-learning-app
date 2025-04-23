import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonicModule, IonContent } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Socket } from 'ngx-socket-io';
import { ActivatedRoute } from '@angular/router';
import { FriendService } from 'src/app/services/friend.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Message {
  username: string;
  message: string;
  time: string;
}

@Component({
  selector: 'app-direct-chat',
  templateUrl: './direct-chat.page.html',
  styleUrls: ['./direct-chat.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class DirectChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) private content!: IonContent;
  
  messages: Message[] = [];
  newMessage: string = '';
  currentUser: string = '';
  friendUsername: string = '';
  friendId: string = '';
  roomId: string = '';

  constructor(
    private socket: Socket,
    private route: ActivatedRoute,
    private friendService: FriendService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.currentUser = localStorage.getItem('username') || '';
    
    // Get friend info from query parameters
    this.route.queryParams.subscribe(params => {
      this.friendUsername = params['friendUsername'] || '';
      this.friendId = params['friendId'] || '';
      
      if (this.friendUsername && this.friendId) {
        // Create a unique room ID for the two users
        this.roomId = [this.currentUser, this.friendUsername].sort().join('-');
        
        // Join the room
        this.socket.emit('joinRoom', this.roomId);
        
        // Listen for messages
        this.socket.on('message', (message: Message) => {
          console.log('Received message:', message);
          this.messages.push(message);
          setTimeout(() => {
            this.content.scrollToBottom(300);
          }, 100);
        });

        // Load previous messages
        this.loadMessages();
      }
    });
  }

  ngOnDestroy() {
    if (this.roomId) {
      this.socket.emit('leaveRoom', this.roomId);
    }
  }

  async loadMessages() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await this.http.get<Message[]>(
        `http://localhost:5000/messages/${this.roomId}`,
        { headers }
      ).toPromise();

      if (response) {
        this.messages = response;
        setTimeout(() => {
          this.content.scrollToBottom(300);
        }, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.friendUsername) return;

    console.log('Sending message:', {
      room: this.roomId,
      username: this.currentUser,
      message: this.newMessage
    });

    this.socket.emit('chatMessage', {
      room: this.roomId,
      username: this.currentUser,
      message: this.newMessage
    });

    this.newMessage = '';
    setTimeout(() => {
      this.content.scrollToBottom(300);
    }, 100);
  }

  isMessageFromCurrentUser(message: Message): boolean {
    return message.username === this.currentUser;
  }
} 