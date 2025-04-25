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
  rooms: string[] = ['English', 'French', 'Spanish', 'German'];
  currentRoom: string | null = null;
  username: string = '';
  message: string = '';
  messages: any[] = [];

  constructor(
    private socket: Socket, 
    private friendService: FriendService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Anonymous';
    console.log("Loaded username:", this.username);
  
    this.socket.on('message', (data: any) => {
      console.log("Incoming message:", data);
      this.messages.push(data);
    });
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
    this.currentRoom = room;
    this.messages = []; // clear previous messages
    this.socket.emit('joinRoom', room);
  }

  leaveRoom(): void {
    if (this.currentRoom) {
      this.socket.emit('leaveRoom', this.currentRoom);
      this.currentRoom = null;
      this.messages = [];
    }
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
