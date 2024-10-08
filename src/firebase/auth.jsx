// src/firebase/auth.js

import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  signInWithPopup 
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

// Google sign-in function
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
      prompt: 'select_account'
  });
  try {
      console.log('Attempting to sign in with Google');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in result:', result);
      const user = result.user;
      console.log('Authenticated user:', user);

      await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          createdAt: new Date(),
      }, { merge: true });

      return user;
  } catch (error) {
      console.error('Error during Google sign-in:', error);
      throw error;
  }
};

// Email and password sign-up function
export const doSignUpWithEmailAndPassword = async (email, password, fullname) => {
  try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: fullname, // Store fullname as displayName
          email: email,
          createdAt: new Date(),
      });

      alert('Sign up Successful!');
      return user;
  } catch (error) {
      console.error("Error during email sign-up", error);
      throw error;
  }
};

// Email and password sign-in function
export const doSignInWithEmailAndPassword = async (email, password) => {
  try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
  } catch (error) {
      console.error("Error during email sign-in", error);
      throw error;
  }
};
