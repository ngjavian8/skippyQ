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
          let loan = new Loan(data['username'], data['status'], data['duedate'].toDate(), doc.id);

          const loadItems = firebase.firestore()
            .collection('loans/' + doc.id + '/items').get()
            .then((itemsSnapshot) => {
              loan.items = [];
              itemsSnapshot.forEach((itemDoc) => {
                let item = new Item(itemDoc.id, itemDoc.data()['quantity'], itemDoc.data()['status'] || 'pending');
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

  getLoanById(id: string): Promise<Loan> {
    return this.loansRef.doc(id).get().then((doc) => {
      let data = doc.data();
      let loan = new Loan(data!['username'], data!['status'], data!['duedate'].toDate(), doc.id);
      loan.sharedUsers = data!['sharedUsers'] || [];

      return firebase.firestore().collection('loans/' + id + '/items').get().then((itemsSnapshot) => {
        loan.items = [];
        itemsSnapshot.forEach((itemDoc) => {
          let item = new Item(itemDoc.id, itemDoc.data()['quantity'], itemDoc.data()['status'] || 'pending');
          loan.items.push(item);
        });
        return loan;
      });
    });
  }

  addLoan(items: Item[], sharedUsers: string[] = []) {
    let duedate = new Date();
    duedate.setHours(0, 0, 0, 0);
    duedate.setDate(duedate.getDate() + 14);

    const username = firebase.auth().currentUser?.email || 'amy@nyp.sg';

    return this.loansRef.add({
      username: username,
      status: 'pending',
      duedate: duedate,
      sharedUsers: sharedUsers
    }).then((doc) => {
      let promises: Promise<any>[] = [];

      for (let item of items) {
        if (item.quantity > 0) {
          promises.push(
            firebase.firestore()
              .collection('loans/' + doc.id + '/items')
              .doc(item.id)
              .set({ quantity: item.quantity, status: 'pending' })
          );
        }
      }

      return Promise.all(promises).then(() => {
        return new Loan(username, 'pending', duedate, doc.id);
      });
    });
  }

  deleteLoan(id: string) {
    const ref = this.loansRef.doc(id);
    return ref.get().then((doc) => {
      if (doc.exists) return ref.delete();
      else return Promise.resolve();
    });
  }

  updateLoanStatus(id: string, status: string) {
    return this.loansRef.doc(id).update({ status: status });
  }

  getLoansForUser(email: string): Observable<any> {
    return new Observable((observer) => {
      let ownLoans: Loan[] = [];
      let sharedLoans: Loan[] = [];

      const loadItems = (doc: any, isShared: boolean): Promise<Loan> => {
        let data = doc.data();
        let loan = new Loan(data['username'], data['status'], data['duedate'].toDate(), doc.id);
        loan.sharedUsers = data['sharedUsers'] || [];
        loan.isShared = isShared;

        return firebase.firestore()
          .collection('loans/' + doc.id + '/items').get()
          .then((itemsSnapshot) => {
            loan.items = [];
            itemsSnapshot.forEach((itemDoc: any) => {
              let item = new Item(itemDoc.id, itemDoc.data()['quantity'], itemDoc.data()['status'] || 'pending');
              loan.items.push(item);
            });
            return loan;
          });
      };

      const emit = () => {
        const combined = [...ownLoans, ...sharedLoans]
          .filter(l => l.items && l.items.length > 0)
          .sort((a, b) => a.duedate.getTime() - b.duedate.getTime());
        observer.next(combined);
      };

      this.loansRef.where('username', '==', email).onSnapshot((snap) => {
        Promise.all(snap.docs.map(doc => loadItems(doc, false))).then(loans => {
          ownLoans = loans;
          emit();
        });
      });

      this.loansRef.where('sharedUsers', 'array-contains', email).onSnapshot((snap) => {
        Promise.all(snap.docs.map(doc => loadItems(doc, true))).then(loans => {
          sharedLoans = loans;
          emit();
        });
      });
    });
  }

  getPendingLoans(): Observable<any> {
    return new Observable((observer) => {
      this.loansRef.where('status', '==', 'pending').onSnapshot((querySnapshot) => {
        let loans: Loan[] = [];
        let pendingItemLoads: Promise<void>[] = [];

        querySnapshot.forEach((doc) => {
          let data = doc.data();
          let loan = new Loan(data['username'], data['status'], data['duedate'].toDate(), doc.id);

          const loadItems = firebase.firestore()
            .collection('loans/' + doc.id + '/items').get()
            .then((itemsSnapshot) => {
              loan.items = [];
              itemsSnapshot.forEach((itemDoc) => {
                let item = new Item(itemDoc.id, itemDoc.data()['quantity'], itemDoc.data()['status'] || 'pending');
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

  updateItemStatuses(loanId: string, itemStatuses: { id: string, status: string }[]) {
    let promises: Promise<any>[] = [];

    for (let item of itemStatuses) {
      promises.push(
        firebase.firestore()
          .collection('loans/' + loanId + '/items')
          .doc(item.id)
          .update({ status: item.status })
      );
    }

    const allApproved = itemStatuses.every(i => i.status === 'approved');
    const allRejected = itemStatuses.every(i => i.status === 'rejected');
    const anyPending = itemStatuses.some(i => i.status === 'pending');

    let overallStatus = 'partial';
    if (allApproved) overallStatus = 'approved';
    else if (allRejected) overallStatus = 'rejected';
    else if (anyPending) overallStatus = 'pending';

    promises.push(this.loansRef.doc(loanId).update({ status: overallStatus }));
    return Promise.all(promises);
  }
}