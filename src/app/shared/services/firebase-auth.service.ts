import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {

  private usersRef = firebase.firestore().collection('users');

  constructor() { }

  login(email: string, password: string): Promise<{ email: string, role: string }> {
    return firebase.auth().signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const email = userCredential.user?.email || '';
        const doc = await this.usersRef.doc(email).get();
        const data = doc.data();
        const role = data ? data['role'] : 'user';

        return { email, role };
      });
  }

  getCurrentUser(): firebase.User | null {
    return firebase.auth().currentUser;
  }
}