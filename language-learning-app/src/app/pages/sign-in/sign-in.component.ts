import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule], 
})
export class SignInComponent {
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  signIn() {
    const user = { email: this.email, password: this.password };

    this.http.post('http://localhost:5000/login', user).subscribe(
      (response: any) => {
        console.log('Login successful', response);
        this.router.navigate(['/home']);
        localStorage.setItem('token', response.token);
      },
      (error) => {
        console.error('Login failed', error);
        alert('Login failed: ' + error.error.message);
      }
    );
  }
}
