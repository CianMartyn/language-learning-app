import { HomePage } from './home/home.page';
import { Routes } from '@angular/router';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { RegisterComponent } from './pages/register/register.component';
import { ChatComponent } from './pages/chat/chat.component';
import { AuthGuard } from './guards/auth.guard';
import { AccountComponent } from './pages/account/account.component';
import { UnitsComponent } from './pages/units/units.component';
import { LessonsComponent } from './pages/lessons/lessons.component';
import { DirectChatPage } from './direct-chat/direct-chat.page';
import { LessonTutorPage } from './lesson-tutor/lesson-tutor.page';
import { VocabularyComponent } from './pages/vocabulary/vocabulary.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: SignInComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'home', 
    component: HomePage, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'chat', 
    component: ChatComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'direct-chat', 
    component: DirectChatPage, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'account', 
    component: AccountComponent, 
    canActivate: [AuthGuard] 
  },
  {
    path: 'units',
    component: UnitsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'lessons',
    component: LessonsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'lesson-tutor',
    component: LessonTutorPage,
    canActivate: [AuthGuard]
  },
  {
    path: 'vocabulary',
    component: VocabularyComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'login' }
];
