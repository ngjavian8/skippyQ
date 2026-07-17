import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Loan } from '../shared/loan';
import { FirebaseLoanService } from '../shared/services/firebase-loan.service';
import { FirebaseAuthService } from '../shared/services/firebase-auth.service';

@Component({
  selector: 'app-loans',
  templateUrl: 'loans.page.html',
  styleUrls: ['loans.page.scss'],
  standalone: false,
})
export class LoansPage {
  loans: Loan[] = [];
  email: string = '';

  constructor(
    private loanService: FirebaseLoanService,
    private authService: FirebaseAuthService,
    private router: Router
  ) { }

  ionViewWillEnter() {
    const user = this.authService.getCurrentUser();
    this.email = user?.email || '';

    if (this.email) {
      this.loanService.getLoansForUser(this.email).subscribe(data => {
        this.loans = data;
      });
    }
  }

  goToDetail(id: string | undefined) {
    if (!id) {
      console.error('Loan ID is undefined');
      return;
    }
    this.router.navigate(['/tabs/detail', id]);
  }
}