import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../shared/services/firebase-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: FirebaseAuthService
  ) { }

  login() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    this.authService.login(this.email, this.password)
      .then(user => {
        if (user.role === 'manager') {
          this.router.navigate(['/tabs/manage']);
        } else {
          this.router.navigate(['/tabs/new-loan']);
        }
      })
      .catch(error => {
        if (
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/invalid-login-credentials' ||
          error.code === 'auth/invalid-credential'
        ) {
          this.errorMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/invalid-email') {
          this.errorMessage = 'Please enter a valid email address.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      });
  }
}