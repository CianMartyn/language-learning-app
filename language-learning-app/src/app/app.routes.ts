import { HomePage } from './home/home.page';
import { Routes } from '@angular/router';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { RegisterComponent } from './pages/register/register.component';
import { ChatComponent } from './pages/chat/chat.component';
//import { LessonsComponent } from './pages/lessons/lessons.component';
//import { AccountComponent } from './pages/account/account.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: SignInComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomePage },
  { path: 'chat', component: ChatComponent },
 // { path: 'lessons', component: LessonsComponent },
 // { path: 'account', component: AccountComponent },
  { path: '**', redirectTo: 'login' },
];
