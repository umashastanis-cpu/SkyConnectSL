import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthContextType, User, UserRole } from '../types';
import {
  createUserDocument,
  getUserDocument,
  updateUserEmailVerification,
} from '../services/firestoreService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userData = await getUserDocument(firebaseUser.uid);
        if (userData) {
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Send verification email
      await sendEmailVerification(firebaseUser);

      // Create user document in Firestore
      await createUserDocument(
        firebaseUser.uid,
        firebaseUser.email!,
        role,
        firebaseUser.emailVerified
      );

      // Fetch and set user
      const userData = await getUserDocument(firebaseUser.uid);
      setUser(userData);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update email verification status if changed
      if (firebaseUser.emailVerified) {
        await updateUserEmailVerification(firebaseUser.uid);
      }

      // Fetch and set user
      const userData = await getUserDocument(firebaseUser.uid);
      setUser(userData);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const firebaseUser = auth.currentUser;

      // Update email verification status
      if (firebaseUser.emailVerified) {
        await updateUserEmailVerification(firebaseUser.uid);
      }

      // Refresh user data
      const userData = await getUserDocument(firebaseUser.uid);
      setUser(userData);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    sendVerificationEmail,
    reloadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
