import { Component, Input } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FriendService } from '../../services/friend.service';

@Component({
  selector: 'app-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class UserProfileModalComponent {
  @Input() user: any;
  @Input() isFriend: boolean = false;
  @Input() currentUsername: string = '';

  constructor(
    private modalController: ModalController,
    private friendService: FriendService,
    private toastController: ToastController
  ) {}

  async sendFriendRequest() {
    try {
      await this.friendService.sendFriendRequest(this.user.username).toPromise();
      this.showToast('Friend request sent successfully', 'success');
      this.dismiss();
    } catch (error: any) {
      this.showToast(error.error?.message || 'Failed to send friend request', 'danger');
    }
  }

  async removeFriend() {
    try {
      await this.friendService.removeFriend(this.user._id).toPromise();
      this.showToast('Friend removed successfully', 'success');
      this.dismiss();
    } catch (error) {
      this.showToast('Failed to remove friend', 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }
} 