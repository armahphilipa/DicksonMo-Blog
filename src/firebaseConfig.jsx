const apiKey = import.meta.env.VITE_APP_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN;

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER,
  appId: import.meta.env.VITE_APP_APP_ID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID,
};
console.log(import.meta.env.VITE_FIREBASE_API_KEY); 

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Firebase Storage
const auth = getAuth(app);

export { db, storage, auth };



/*
export { auth, googleProvider,  signInWithEmailAndPassword, signInWithPopup };
export default app;
 const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  // Handle Email/Password Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential);
      if(user){
      await setDoc(doc(db,'users',user.uid), {
        email: user.email,
        fullName: user.fname,
      });
     }
      alert('Sign up successful!');
      navigate('/login'); // Navigate to login page after successful sign-up
    } catch (error) {
      console.error('Error signing up:', error);
      alert(error.message);
    }
  };

  // Handle Google Sign Up
  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-up successful:', result);
      alert('Google sign-up successful!');
      navigate('/login');
    } catch (error) {
      console.error('Error with Google sign-up:', error);
      alert(error.message);
    }
  };

 

  const handleSignUp = async (e)=>{
    e.preventDefault();
    try {
     await createUserWithEmailAndPassword(auh, email, password);
     const user = auth.currentUser;
     console.log(user); 
     console.log('Sign up sucessful')
    } catch (error) {
      console.log(error.message);
    }
  }; 
  
  // Handle Email/Password Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential);
      alert('Sign up successful!');
      navigate('/login'); // Navigate to login page after successful sign-up
    } catch (error) {
      console.error('Error signing up:', error);
      alert(error.message);
    }
  };

  // Handle Google Sign Up
  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-up successful:', result);
      alert('Google sign-up successful!');
      navigate('/login');
    } catch (error) {
      console.error('Error with Google sign-up:', error);
      alert(error.message);
    }
  };
  */