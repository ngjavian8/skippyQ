import { Component } from '@angular/core';
import { Loan } from '../shared/loan';
import { LoanService } from '../shared/loan.service';

@Component({
  selector: 'app-loans',
  templateUrl: 'loans.page.html',
  styleUrls: ['loans.page.scss'],
  standalone: false,
})
export class LoansPage {
  loans: Loan[];

  constructor(private loanService: LoanService) {
    this.loanService.getAllLoans()
      .subscribe(data => {
        this.loans = data;
      })
  }

}
