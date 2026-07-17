import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import firebase from 'firebase/app';
import 'firebase/firestore';

import { Loan } from '../loan';
import { Item } from '../item';

@Injectable({
  providedIn: 'root'
})
export class FirebaseLoanService {

  private loansRef = firebase.firestore().collection('loans');

  constructor() { }

  getLoans(): Observable<any> {
    return new Observable((observer) => {
      this.loansRef.orderBy('duedate').onSnapshot((querySnapshot) => {
        let loans: Loan[] = [];
        let pendingItemLoads: Promise<void>[] = [];

        querySnapshot.forEach((doc) => {
          let data = doc.data();
          let loan = new Loan(
            data['username'],
            data['status'],
            data['duedate'].toDate(),
            doc.id
          );

          const loadItems = firebase.firestore()
            .collection('loans/' + doc.id + '/items')
            .get()
            .then((itemsSnapshot) => {
              loan.items = [];
              itemsSnapshot.forEach((itemDoc) => {
                let item = new Item(itemDoc.id, itemDoc.data()['quantity']);
                loan.items.push(item);
              });
            });

          pendingItemLoads.push(loadItems);
          loans.push(loan);
        });

        Promise.all(pendingItemLoads).then(() => {
          // Remove loans that have 0 items
          loans = loans.filter(l => l.items && l.items.length > 0);

          // Sort by due date nearest first
          loans.sort((a, b) => a.duedate.getTime() - b.duedate.getTime());

          observer.next(loans);
        });
      });
    });
  }
  getLoanById(id: string): Promise<Loan> {
    return this.loansRef.doc(id).get().then((doc) => {
      let data = doc.data();
      let loan = new Loan(
        data!['username'],
        data!['status'],
        data!['duedate'].toDate(),
        doc.id
      );

      return firebase.firestore().collection('loans/' + id + '/items').get().then((itemsSnapshot) => {
        loan.items = [];
        itemsSnapshot.forEach((itemDoc) => {
          let item = new Item(itemDoc.id, itemDoc.data()['quantity']);
          loan.items.push(item);
        });
        return loan;
      });
    });
  }

  addLoan(items: Item[]) {
    let duedate = new Date();
    duedate.setHours(0, 0, 0, 0);
    duedate.setDate(duedate.getDate() + 14);

    return this.loansRef.add({
      username: 'amy@nyp.sg',
      status: 'pending',
      duedate: duedate
    }).then((doc) => {
      let promises = [];

      for (let item of items) {
        if (item.quantity > 0) {
          promises.push(
            firebase.firestore()
              .collection('loans/' + doc.id + '/items')
              .doc(item.id)
              .set({
                quantity: item.quantity
              })
          );
        }
      }

      return Promise.all(promises).then(() => {
        return new Loan('amy@nyp.sg', 'pending', duedate, doc.id);
      });
    });
  }

  deleteLoan(id: string) {
    const ref = this.loansRef.doc(id);
    return ref.get().then((doc) => {
      if (doc.exists) {
        return ref.delete();
      } else {
        return Promise.resolve();
      }
    });
  }

  updateLoanStatus(id: string, status: string) {
    const ref = this.loansRef.doc(id);
    return ref.update({
      status: status
    });
  }
  getLoansForUser(email: string): Observable<any> {
    return new Observable((observer) => {
      this.loansRef
        .where('username', '==', email)
        .onSnapshot((querySnapshot) => {
          let loans: Loan[] = [];
          let pendingItemLoads: Promise<void>[] = [];

          querySnapshot.forEach((doc) => {
            let data = doc.data();
            let loan = new Loan(
              data['username'],
              data['status'],
              data['duedate'].toDate(),
              doc.id
            );

            const loadItems = firebase.firestore()
              .collection('loans/' + doc.id + '/items')
              .get()
              .then((itemsSnapshot) => {
                loan.items = [];
                itemsSnapshot.forEach((itemDoc) => {
                  let item = new Item(itemDoc.id, itemDoc.data()['quantity']);
                  loan.items.push(item);
                });
              });

            pendingItemLoads.push(loadItems);
            loans.push(loan);
          });

          Promise.all(pendingItemLoads).then(() => {
            loans = loans.filter(l => l.items && l.items.length > 0);
            loans.sort((a, b) => a.duedate.getTime() - b.duedate.getTime());
            observer.next(loans);
          });
        });
    });
  }
  getPendingLoans(): Observable<any> {
    return new Observable((observer) => {
      this.loansRef
        .where('status', '==', 'pending')
        .onSnapshot((querySnapshot) => {
          let loans: Loan[] = [];
          let pendingItemLoads: Promise<void>[] = [];

          querySnapshot.forEach((doc) => {
            let data = doc.data();
            let loan = new Loan(
              data['username'],
              data['status'],
              data['duedate'].toDate(),
              doc.id
            );

            const loadItems = firebase.firestore()
              .collection('loans/' + doc.id + '/items')
              .get()
              .then((itemsSnapshot) => {
                loan.items = [];
                itemsSnapshot.forEach((itemDoc) => {
                  let item = new Item(itemDoc.id, itemDoc.data()['quantity']);
                  loan.items.push(item);
                });
              });

            pendingItemLoads.push(loadItems);
            loans.push(loan);
          });

          Promise.all(pendingItemLoads).then(() => {
            // Remove pending loans that have 0 items
            loans = loans.filter(l => l.items && l.items.length > 0);

            // Sort by due date nearest first
            loans.sort((a, b) => a.duedate.getTime() - b.duedate.getTime());

            observer.next(loans);
          });
        });
    });
  }
}
