import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule], // Add IonicModule and FormsModule here
})
export class SignInComponent {
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient) {}

  signIn() {
    const user = { email: this.email, password: this.password };

    this.http.post('http://localhost:5000/login', user).subscribe(
      (response: any) => {
        console.log('Login successful', response);
        alert('Login successful');
        // Save token to localStorage or sessionStorage
        localStorage.setItem('token', response.token);
      },
      (error) => {
        console.error('Login failed', error);
        alert('Login failed: ' + error.error.message);
      }
    );
  }
}
