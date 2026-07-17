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

  approveItem(loan: any, item: any) {
    item.status = 'approved';
    this.saveItemStatuses(loan);
  }

  rejectItem(loan: any, item: any) {
    item.status = 'rejected';
    this.saveItemStatuses(loan);
  }

  saveItemStatuses(loan: any) {
    const itemStatuses = loan.items.map((i: any) => ({
      id: i.id,
      status: i.status || 'pending'
    }));
    this.loanService.updateItemStatuses(loan.id, itemStatuses);
  }
}