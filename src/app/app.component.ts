import { Component } from '@angular/core';
import firebase from 'firebase';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  platform: any;
  constructor() {
    // Your web app's Firebase configuration


    const firebaseConfig = {
  apiKey: "AIzaSyAzXPYOsLo6QG3J-AzaSt10eyxy4GGyfxY",
  authDomain: "msa26s2.firebaseapp.com",
  projectId: "msa26s2",
  storageBucket: "msa26s2.firebasestorage.app",
  messagingSenderId: "282356644876",
  appId: "1:282356644876:web:b86b6f86a1a135fa184229"
};


    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.firestore().settings({ experimentalForceLongPolling: true });

  }

  initializeApp() {

    this.platform.ready().then(() => {
    });
  }

}
