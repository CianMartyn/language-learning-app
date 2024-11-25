import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient) {}

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
        alert('Registration successful');
      },
      (error: any) => {
        console.error('Registration failed', error);
        alert('Registration failed: ' + error.error.message);
      }
    );
  }
}
    