"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export type UserRole = 'traveler' | 'partner' | 'admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  userRole: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        const userDoc = await getUserDocument(firebaseUser.uid);
        setUser(userDoc);
        setUserRole(userDoc?.role || null);
      } else {
        setFirebaseUser(null);
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserDocument = async (uid: string): Promise<User | null> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        role: data.role,
        emailVerified: data.emailVerified,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }

    return null;
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user: firebaseUser } = userCredential;

    // Send email verification
    await sendEmailVerification(firebaseUser);

    // Create user document in Firestore
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role,
      emailVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setUserRole(null);
  };

  const sendVerificationEmail = async () => {
    if (firebaseUser) {
      await sendEmailVerification(firebaseUser);
    }
  };

  const reloadUser = async () => {
    if (firebaseUser) {
      await firebaseUser.reload();
      const userDoc = await getUserDocument(firebaseUser.uid);
      setUser(userDoc);
      setUserRole(userDoc?.role || null);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    sendVerificationEmail,
    reloadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
