import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { ThemeService } from './services/theme.service';
import { Socket } from 'ngx-socket-io';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular({
      mode: 'ios',
      backButtonText: '',
      rippleEffect: true,
      animated: true
    }),
    ThemeService,
    {
      provide: Socket,
      useFactory: () => {
        return new Socket({
          url: 'http://localhost:5000',
          options: {
            transports: ['websocket']
          }
        });
      }
    }
  ]
}; 