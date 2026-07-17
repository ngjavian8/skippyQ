import { Injectable } from '@angular/core';
import { Item } from './item';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private items: Item[] = [
    new Item('Table', 0),
    new Item('Chair', 0),
    new Item('Projector', 0),
    new Item('Speaker', 0),
    new Item('DSLR', 0),
    new Item('Video Camera', 0),
    new Item('Tripod', 0),
    new Item('Laptop', 0),
    new Item('Monitor', 0),
    new Item('TV', 0),
    new Item('Keyboard', 0),
    new Item('Mouse', 0),
  ];

  private itemsSubject = new BehaviorSubject<Item[]>(this.items);
  private sharedUsers: string[] = [];

  constructor() { }

  getAllAsync(): Observable<Item[]> {
    return this.itemsSubject.asObservable();
  }

  resetQuantity() {
    this.items.forEach(item => item.quantity = 0);
    this.sharedUsers = [];
    this.itemsSubject.next(this.items);
  }

  setSharedUsers(users: string[]) {
    this.sharedUsers = users;
  }

  getSharedUsers(): string[] {
    return this.sharedUsers;
  }
}