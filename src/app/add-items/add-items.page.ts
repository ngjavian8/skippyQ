import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from '../shared/item';
import { ItemService } from '../shared/item.service';

@Component({
  selector: 'app-add-items',
  templateUrl: './add-items.page.html',
  styleUrls: ['./add-items.page.scss'],
  standalone: false,
})
export class AddItemsPage {
  items: Item[];
  allItems: Item[];
  searchText: string = '';

  constructor(
    private router: Router,
    private itemService: ItemService
  ) {
    this.allItems = this.itemService.getAll();
    this.items = [...this.allItems];
  }

  save() {
    this.router.navigate(['/tabs/new-loan']);
  }

  search(event: any) {
    this.searchText = (event.detail.value || '').toLowerCase().trim();

    this.items = this.allItems.filter(item =>
      item.id.toLowerCase().includes(this.searchText)
    );
  }
}