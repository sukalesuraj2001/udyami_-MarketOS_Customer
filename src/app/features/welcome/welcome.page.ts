import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

interface Particle {
  x: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

/** Animated brand landing screen shown before login. */
@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [IonicModule, RouterLink],
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage {
  readonly letters = 'Jyovix'.split('');
  readonly words = ['Plan', 'Create', 'Publish', 'Grow', 'Plan'];

  readonly orbits = [
    { icon: 'logo-instagram', size: 188, duration: 18, delay: 0 },
    { icon: 'logo-facebook', size: 250, duration: 26, delay: -8 },
    { icon: 'logo-youtube', size: 250, duration: 26, delay: -21 },
    { icon: 'logo-linkedin', size: 312, duration: 34, delay: -12 },
  ];

  readonly particles: Particle[] = Array.from({ length: 22 }, () => ({
    x: Math.round(Math.random() * 100),
    size: 2 + Math.round(Math.random() * 3),
    delay: -Math.round(Math.random() * 12000),
    duration: 9000 + Math.round(Math.random() * 7000),
    drift: Math.round(Math.random() * 60 - 30),
  }));
}
