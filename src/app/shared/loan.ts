import { Item } from './item';

export class Loan {
  items: Item[] = [];
  sharedUsers: string[] = [];
  isShared: boolean = false;

  constructor(
    public username: string,
    public status: string,
    public duedate: Date,
    public id?: string) { }
}