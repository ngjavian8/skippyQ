export class Item {

  constructor(
    public id: string,
    public quantity: number,
    public status: string = 'pending') { }

}