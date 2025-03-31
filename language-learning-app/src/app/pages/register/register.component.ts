import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [HttpClientModule, FormsModule, IonicModule],
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    if (!this.username || !this.email || !this.password) {
      alert('Please fill out all fields!');
      return;
    }

    const user = {
      username: this.username,
      email: this.email,
      password: this.password,
    };

    this.http.post('http://localhost:5000/register', user).subscribe(
      (response: any) => {
        console.log('Registration successful', response);
        // After successful registration, automatically sign in
        this.http.post('http://localhost:5000/login', { email: this.email, password: this.password }).subscribe(
          (loginResponse: any) => {
            localStorage.setItem('token', loginResponse.token);
            localStorage.setItem('username', loginResponse.username);
            this.router.navigate(['/home']);
          },
          (error) => {
            console.error('Auto login failed', error);
            alert('Registration successful but login failed. Please try logging in manually.');
          }
        );
      },
      (error: any) => {
        console.error('Registration failed', error);
        alert('Registration failed: ' + error.error.message);
      }
    );
  }
}
    