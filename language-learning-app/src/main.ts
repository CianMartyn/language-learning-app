import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { IonicModule } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Route } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { RegisterComponent } from './app/pages/register/register.component'; // Import the RegisterComponent


const routes: Route[] = [
  { path: '', redirectTo: 'register', pathMatch: 'full' }, // Default route
  { path: 'register', component: RegisterComponent },      // Route for register page
  // Add other routes here as needed
];
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(IonicModule.forRoot()),
    provideHttpClient(),
    provideRouter(routes), // Provide the router
  ],
}).catch((err) => console.error(err));
