import { Component } from '@angular/core';
import { Loan } from '../shared/loan';
import { FirebaseLoanService } from '../shared/services/firebase-loan.service';

@Component({
  selector: 'app-manage',
  templateUrl: 'manage.page.html',
  styleUrls: ['manage.page.scss'],
  standalone: false,
})
export class ManagePage {
  loans: Loan[] = [];

  constructor(private loanService: FirebaseLoanService) { }

  ionViewWillEnter() {
    this.loanService.getPendingLoans().subscribe(data => {
      this.loans = data;
    });
  }

  approve(id: string) {
    this.loanService.updateLoanStatus(id, 'approved');
  }

  reject(id: string) {
    this.loanService.updateLoanStatus(id, 'rejected');
  }
}