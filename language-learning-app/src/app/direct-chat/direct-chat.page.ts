import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonicModule, IonContent, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Socket } from 'ngx-socket-io';
import { ActivatedRoute } from '@angular/router';
import { FriendService } from 'src/app/services/friend.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface Message {
  _id?: string;
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
  currentUser: string = '';
  newMessage: string = '';
  friendUsername: string = '';
  friendId: string = '';
  roomId: string = '';
  private token = localStorage.getItem('token') || '';
  private apiUrl = 'http://localhost:5000';

  constructor(
    private socket: Socket,
    private route: ActivatedRoute,
    private friendService: FriendService,
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
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
          
          // Find the temporary message and update it with the ID
          const index = this.messages.findIndex(m => 
            m.username === message.username && 
            m.message === message.message && 
            !m._id // Only look for messages without an ID
          );
          
          if (index !== -1) {
            // Update the existing message with the server response (including _id)
            this.messages[index] = message;
            console.log('Updated message with ID:', message);
          } else {
            // This is a new message from the other user
            this.messages.push(message);
            console.log('Added new message:', message);
          }
          
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

    const time = new Date().toLocaleTimeString();
    const newMessage: Message = {
      username: this.currentUser,
      message: this.newMessage.trim(),
      time: time
    };

    // Add message to local array first
    this.messages.push(newMessage);

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

  async deleteMessage(message: Message) {
    if (!message._id) {
      console.error('Cannot delete message without _id:', message);
      await this.showToast('Cannot delete this message', 'danger');
      return;
    }

    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });

      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/messages/${message._id}`, { headers })
      );

      // Remove the message from the local array
      this.messages = this.messages.filter(m => m._id !== message._id);
      await this.showToast('Message deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting message:', error);
      await this.showToast('Failed to delete message', 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
} 