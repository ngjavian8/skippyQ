import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Item } from '../shared/item';
import { ItemService } from '../shared/item.service';
import { FirebaseLoanService } from '../shared/services/firebase-loan.service';

@Component({
  selector: 'app-new-loan',
  templateUrl: 'new-loan.page.html',
  styleUrls: ['new-loan.page.scss'],
  standalone: false,
})
export class NewLoanPage {
  items: Item[] = [];

  constructor(
    private itemService: ItemService,
    private loanService: FirebaseLoanService,
    private toastController: ToastController
  ) {
    this.itemService.getAllAsync().subscribe(data => {
      this.items = data;
    });
  }

  hasSelectedItems(): boolean {
    return this.items && this.items.some(item => item.quantity > 0);
  }

  getSharedUsers(): string[] {
    return this.itemService.getSharedUsers();
  }

  async submit() {
    if (!this.hasSelectedItems()) {
      const toast = await this.toastController.create({
        message: 'You cannot create a loan with no items.',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
      return;
    }

    const sharedUsers = this.itemService.getSharedUsers();

    this.loanService.addLoan(this.items, sharedUsers).then(async (loan) => {
      const toast = await this.toastController.create({
        message: 'Loan created with ID ' + loan.id,
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
      this.itemService.resetQuantity();
    });
  }
}