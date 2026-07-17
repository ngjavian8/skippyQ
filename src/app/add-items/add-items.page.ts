import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from '../shared/item';
import { ItemService } from '../shared/item.service';
import firebase from 'firebase/app';
import 'firebase/firestore';

@Component({
  selector: 'app-add-items',
  templateUrl: './add-items.page.html',
  styleUrls: ['./add-items.page.scss'],
  standalone: false,
})
export class AddItemsPage {
  items: Item[] = [];
  searchText: string = '';

  shareEmail: string = '';
  sharedUsers: string[] = [];
  shareError: string = '';
  isValidating: boolean = false;

  constructor(
    private itemService: ItemService,
    private router: Router
  ) {
    this.itemService.getAllAsync().subscribe(data => {
      this.items = data;
    });
  }

  filteredItems(): Item[] {
    if (!this.searchText) return this.items;
    return this.items.filter(item =>
      item.id.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  async addSharedUser() {
    const email = this.shareEmail.trim().toLowerCase();
    this.shareError = '';

    // If empty, do nothing — no error shown
    if (!email) {
      return;
    }

    // Validation 1: valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.shareError = 'Please enter a valid email address.';
      return;
    }

    // Validation 2: can't add yourself
    const currentUser = firebase.auth().currentUser;
    if (currentUser && email === currentUser.email?.toLowerCase()) {
      this.shareError = 'You cannot share a loan with yourself.';
      return;
    }

    // Validation 3: no duplicates
    if (this.sharedUsers.includes(email)) {
      this.shareError = 'This user has already been added.';
      return;
    }

    // Validation 4: check if user exists in Firestore 'users' collection
    this.isValidating = true;
    try {
      const doc = await firebase.firestore().collection('users').doc(email).get();
      if (!doc.exists) {
        this.shareError = 'No account found for this email. Make sure they are registered.';
        this.isValidating = false;
        return;
      }
    } catch (err) {
      this.shareError = 'Error checking user. Please try again.';
      this.isValidating = false;
      return;
    }

    // All passed — add to list
    this.sharedUsers.push(email);
    this.shareEmail = '';
    this.isValidating = false;
  }
  removeSharedUser(email: string) {
    this.sharedUsers = this.sharedUsers.filter(e => e !== email);
  }

  done() {
    // Save sharedUsers back to ItemService so new-loan page can read it
    this.itemService.setSharedUsers(this.sharedUsers);
    this.router.navigate(['/tabs/new-loan']);
  }
}