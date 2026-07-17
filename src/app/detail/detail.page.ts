import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Loan } from '../shared/loan';
import { FirebaseLoanService } from '../shared/services/firebase-loan.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: false,
})
export class DetailPage {
  loan: Loan;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: FirebaseLoanService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    this.loanService.getLoanById(id!).then(data => {
      this.loan = data;
    });
  }

  cancelLoan() {
    this.loanService.deleteLoan(this.loan.id).then(() => {
      this.router.navigate(['/tabs/loans']);
    });
  }
}