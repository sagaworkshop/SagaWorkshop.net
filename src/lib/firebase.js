import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

export {firebase};

firebase.initializeApp({
    apiKey: 'PLACEHOLDER',
    authDomain: 'PLACEHOLDER',
    databaseURL: 'PLACEHOLDER'
});

export const auth = firebase.auth();
export const db = firebase.database();

export function signIn() {
    let provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider);
}

export function signOut() {
    return auth.signOut();
}
