import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
})
export class HomePage {
  constructor(private router: Router) {}

  goToChat() {
    this.router.navigate(['/chat']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToLessons() {
    this.router.navigate(['/lessons']);
  }

  goToAccount() {
    this.router.navigate(['/account']);
  }
}
