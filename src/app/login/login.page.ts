import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {

  constructor(private router: Router) {
  }

  login() {
    // TODO: Based on user role go to different page
    this.router.navigate(['/tabs/new-loan']);
  }
}
