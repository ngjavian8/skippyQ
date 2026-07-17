import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Loan } from '../shared/loan';
import { FirebaseLoanService } from '../shared/services/firebase-loan.service';
import firebase from 'firebase/app';
import 'firebase/auth';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: false,
})
export class DetailPage {
  loan!: Loan;
  isOwner: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: FirebaseLoanService
  ) { }

  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loanService.getLoanById(id).then(data => {
      this.loan = data;
      const currentUser = firebase.auth().currentUser;
      this.isOwner = (currentUser?.email === this.loan.username);
    });
  }

  cancelLoan() {
    this.loanService.deleteLoan(this.loan.id!).then(() => {
      this.router.navigate(['/tabs/loans']);
    });
  }
}