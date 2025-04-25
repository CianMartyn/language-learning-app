import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Socket } from 'ngx-socket-io';
import { RouterModule } from '@angular/router';
import { FriendService } from 'src/app/services/friend.service';
import { UserProfileModalComponent } from '../../components/user-profile-modal/user-profile-modal.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule] 
})

export class ChatComponent implements OnInit {
  rooms: string[] = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Japanese',
  ];
  selectedRoom: string = '';
  messages: any[] = [];
  newMessage: string = '';
  username: string = localStorage.getItem('username') || '';
  currentRoomUsers: string[] = [];
  isTyping: boolean = false;
  typingUsers: string[] = [];
  typingTimeout: any;
  userAvatars: { [key: string]: string } = {};
  isDarkMode: boolean = false;

  constructor(
    private socket: Socket, 
    private friendService: FriendService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {
    // Set the username when the component is created
    this.username = localStorage.getItem('username') || 'Anonymous';
    console.log("Initialised username:", this.username);
  }

  ngOnInit(): void {
    console.log("Loaded username:", this.username);
  
    this.socket.on('message', (data: any) => {
      console.log("Incoming message:", data);
      this.messages.push(data);
    });

    // Handle user joining room
    this.socket.on('userJoined', (data: { username: string, room: string }) => {
      if (data.room === this.selectedRoom) {
        this.currentRoomUsers.push(data.username);
      }
    });

    // Handle user leaving room
    this.socket.on('userLeft', (data: { username: string, room: string }) => {
      if (data.room === this.selectedRoom) {
        this.currentRoomUsers = this.currentRoomUsers.filter(user => user !== data.username);
      }
    });

    // Handle room users list
    this.socket.on('roomUsers', (data: { room: string, users: string[] }) => {
      if (data.room === this.selectedRoom) {
        this.currentRoomUsers = data.users;
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  }

  getLanguageIcon(language: string): string {
    const icons: { [key: string]: string } = {
      'English': 'language-outline',
      'Spanish': 'language-outline',
      'French': 'language-outline',
      'German': 'language-outline',
      'Italian': 'language-outline',
      'Portuguese': 'language-outline',
      'Japanese': 'language-outline',
    };
    return icons[language] || 'language-outline';
  }

  getUserAvatar(username: string): string {
    if (this.userAvatars[username]) {
      return this.userAvatars[username];
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
  }

  onTyping(): void {
    if (!this.isTyping) {
      this.isTyping = true;
      this.socket.emit('typing', {
        room: this.selectedRoom,
        username: this.username
      });
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.socket.emit('stopTyping', {
        room: this.selectedRoom,
        username: this.username
      });
    }, 1000);
  }

  async viewUserProfile(username: string) {
    try {
      const response = await this.friendService.getFriendProfile(username).toPromise();
      const isFriend = await this.friendService.isFriend(username).toPromise();
      
      const modal = await this.modalController.create({
        component: UserProfileModalComponent,
        componentProps: {
          user: response,
          isFriend: isFriend,
          currentUsername: this.username
        }
      });
      await modal.present();
    } catch (error) {
      console.error('Error viewing user profile:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Failed to load user profile',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  
  joinRoom(room: string): void {
    this.selectedRoom = room;
    this.messages = []; // clear previous messages
    this.currentRoomUsers = []; // clear previous users
    
    // Ensure we have a valid username
    const currentUsername = localStorage.getItem('username');
    if (!currentUsername) {
      console.error('No username found in localStorage');
      return;
    }

    console.log('Joining room with username:', currentUsername);
    this.socket.emit('joinRoom', {
      room: room,
      username: currentUsername
    });
  }

  leaveRoom(): void {
    if (this.selectedRoom) {
      this.socket.emit('leaveRoom', {
        room: this.selectedRoom,
        username: this.username
      });
      this.selectedRoom = '';
      this.messages = [];
      this.currentRoomUsers = [];
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    this.socket.emit('chatMessage', {
      room: this.selectedRoom,
      username: this.username,
      message: this.newMessage
    });
    this.newMessage = '';
  }
}
