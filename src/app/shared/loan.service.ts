import { Injectable } from '@angular/core';
import { Item } from './item';
import { Loan } from './loan';

import firebase from 'firebase/app';
import 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  constructor() { }

  createLoan(items: Item[]) {

    // Due date is 2 weeks after today 
    let duedate = new Date(); // Today
    duedate.setHours(0, 0, 0, 0); // Midnight
    duedate.setDate(duedate.getDate() + 14); // 2 weeks later

    // TODO: Get username logged in
    let loan = new Loan('amy@nyp.sg', 'pending', duedate);

    // Add to collection '/loans/<autoID>' 
    return firebase.firestore().collection('loans').add({
      username: loan.username,
      status: loan.status,
      duedate: loan.duedate
    }).then(doc => {
      loan.id = doc.id;
      // Add to collection '/loans/<autoID>/items/'
      for (let item of items) {
        if (item.quantity > 0) {
          // Add a new document '/loans/<autoID>/items/<itemID>'
          firebase.firestore().collection('loans/' + doc.id + '/items/').doc(item.id).set({
            quantity: item.quantity
          });
        }
      }
      return loan;
    })

  }

  getAllLoans(): Observable<any> {
    return new Observable(observer => {
      // Read collection '/loans'
      firebase.firestore().collection('loans').orderBy('duedate').onSnapshot(collection => {
        let array = [];
        collection.forEach(doc => {

          // Add loan into array if there's no error
          try {
            let loan = new Loan(doc.data()['username'], doc.data()['status'], doc.data()['duedate'].toDate(), doc.id);
            array.push(loan);

            // Read subcollection '/loans/<autoID>/items'
            let dbItems = firebase.firestore().collection('loans/' + doc.id + '/items');
            dbItems.onSnapshot(itemsCollection => {
              loan.items = []; // Empty array
              itemsCollection.forEach(itemDoc => {
                let item = new Item(itemDoc.id, itemDoc.data()['quantity']);
                loan.items.push(item);
              });
            });
          } catch (error) { }

        });
        observer.next(array);
      });
    });
  }

  getLoanById(id: string) {
    // Read document '/loans/<id>'
    return firebase.firestore().collection('loans').doc(id).get().then(doc => {
      let loan = new Loan(doc.data()['username'], doc.data()['status'], doc.data()['duedate'].toDate(), doc.id);

      // Read subcollection '/loans/<id>/items'
      return firebase.firestore().collection('loans/' + id + '/items').get().then(collection => {
        loan.items = []; // Empty array
        collection.forEach(doc => {
          let item = new Item(doc.id, doc.data()['quantity']);
          loan.items.push(item);
        })
        return loan;
      });
    });
  }
  deleteLoan(id: string) {
    return firebase.firestore().collection('loans').doc(id).delete();
  }

  updateStatus(id: string, status: string) {
    return firebase.firestore().collection('loans').doc(id).update({ status: status });
  }

}
