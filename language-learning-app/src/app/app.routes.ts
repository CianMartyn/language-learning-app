import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  { path: '', component: HomePage }, // Home page
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: SignInComponent },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  { path: '**', redirectTo: '' }, // Redirect unknown routes to Hom
];
