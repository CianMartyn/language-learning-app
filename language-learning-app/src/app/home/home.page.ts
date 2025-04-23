import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FriendService } from '../services/friend.service';

interface Friend {
  _id: string;
  username: string;
}

interface FriendRequest {
  _id: string;
  fromUsername: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
})
export class HomePage implements OnInit {

  selectedLanguage: string = '';
  customTopic: string = '';
  showCustomLessonForm: boolean = false;
  toastController: any;
  isLoading: boolean = false;
  username: string = '';
  showFriendRequestModal: boolean = false;
  newFriendUsername: string = '';
  friends: Friend[] = [];
  pendingRequests: FriendRequest[] = [];
  pendingRequestsCount: number = 0;
  
  constructor(
    private router: Router,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private friendService: FriendService
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || '';
    this.loadFriends();
    this.loadPendingRequests();
  }

  async loadFriends() {
    try {
      const response = await this.friendService.getFriends().toPromise();
      this.friends = response || [];
    } catch (error) {
      console.error('Error loading friends:', error);
      this.showToast('Failed to load friends', 'danger');
    }
  }

  async loadPendingRequests() {
    try {
      const response = await this.friendService.getPendingRequests().toPromise();
      this.pendingRequests = response.requests || [];
      this.pendingRequestsCount = this.pendingRequests.length;
    } catch (error) {
      console.error('Error loading pending requests:', error);
      this.showToast('Failed to load pending requests', 'danger');
    }
  }

  async acceptRequest(requestId: string) {
    try {
      await this.friendService.acceptFriendRequest(requestId).toPromise();
      this.showToast('Friend request accepted', 'success');
      this.loadFriends();
      this.loadPendingRequests();
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      this.showToast(error?.error?.message || 'Failed to accept friend request', 'danger');
    }
  }

  goToChat() {
    this.router.navigate(['/direct-chat']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToLessons() {
    this.router.navigate(['/lessons']);
  }

  goToUnits() {
    this.router.navigate(['/units']);
  }

  showCustomLesson() {
    this.showCustomLessonForm = true;
  }

  async generateCustomLesson() {
    if (!this.selectedLanguage || !this.customTopic) {
      const toast = await this.toastCtrl.create({
        message: 'Please select a language and enter a topic',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    console.log('Starting lesson generation...');
    
    try {
      console.log('Sending request with:', { language: this.selectedLanguage, topic: this.customTopic });
      const response = await firstValueFrom(
        this.http.post('http://localhost:5000/generate-lesson', {
          language: this.selectedLanguage,
          topic: this.customTopic
        })
      );

      console.log('Received response:', response);

      if (!response) {
        throw new Error('No response received from server');
      }

      // Store the lesson data in localStorage
      console.log('Storing lesson in localStorage:', response);
      localStorage.setItem('currentLesson', JSON.stringify(response));
      
      // Close the custom lesson form and reset loading state
      this.showCustomLessonForm = false;
      this.selectedLanguage = '';
      this.customTopic = '';
      this.isLoading = false;
      
      // Navigate to the lessons page
      this.router.navigate(['/lessons'], { replaceUrl: true });
    } catch (error) {
      console.error('Error generating lesson:', error);
      await this.showError('Failed to generate lesson. Please try again.');
      this.isLoading = false;
    }
  }

  async showError(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }

  openFriendRequestModal() {
    this.showFriendRequestModal = true;
  }

  closeFriendRequestModal() {
    this.showFriendRequestModal = false;
    this.newFriendUsername = '';
  }

  async sendFriendRequest() {
    if (!this.newFriendUsername) {
      this.showToast('Please enter a username', 'warning');
      return;
    }

    console.log('Sending friend request to:', this.newFriendUsername);
    console.log('Current user:', this.username);

    try {
      const response = await this.friendService.sendFriendRequest(this.newFriendUsername).toPromise();
      console.log('Friend request response:', response);
      this.showToast('Friend request sent successfully', 'success');
      this.closeFriendRequestModal();
      // Refresh friends list after sending request
      this.loadFriends();
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      if (error?.error?.message) {
        this.showToast(error.error.message, 'danger');
      } else {
        this.showToast('Failed to send friend request', 'danger');
      }
    }
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  startChat(friend: Friend) {
    // Navigate to direct chat with the selected friend
    this.router.navigate(['/direct-chat'], { 
      queryParams: { 
        friendId: friend._id,
        friendUsername: friend.username
      }
    });
  }

  async removeFriend(friendId: string) {
    try {
      await this.friendService.removeFriend(friendId).toPromise();
      this.showToast('Friend removed successfully', 'success');
      this.loadFriends(); // Refresh the friends list
    } catch (error) {
      console.error('Error removing friend:', error);
      this.showToast('Failed to remove friend', 'danger');
    }
  }
}
