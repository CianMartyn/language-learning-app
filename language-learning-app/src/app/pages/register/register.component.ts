import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true, 
})
export class RegisterPage {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private apiService: ApiService) {}

  register() {
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
    };

    this.apiService.registerUser(userData).subscribe(
      (response) => {
        console.log('User registered successfully:', response);
        // Navigate to login or show a success message
      },
      (error) => {
        console.error('Error registering user:', error);
        // Show error message to the user
      }
    );
  }
}
