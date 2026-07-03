import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Loan } from '../shared/loan';
import { LoanService } from '../shared/loan.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: false,
})
export class DetailPage {
  loan: Loan; 

  constructor() { }

}
