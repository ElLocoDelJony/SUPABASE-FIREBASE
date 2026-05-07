import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "../firebaseClient";

export const obtenerToken = async () => {
  if (!auth.currentUser) return null;
  return await auth.currentUser.getIdToken(true); // fuerza refresco
};


export const registrar = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken(true);
  return { user: userCredential.user, token };
};

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();
  return { user: userCredential.user, token };
};

export const logout = () => signOut(auth);

export const escucharSesion = (callback) => onAuthStateChanged(auth, callback);
