'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { app, auth, db, storage } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

type UserData = {
  fullName: string;
  clinicName: string;
  email: string;
  role: string;
  balance: number;
  createdAt: string;
};

type FirebaseContextType = {
  app: any;
  auth: any;
  db: any;
  storage: any;
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
};

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh user data manually if needed
  const refreshUserData = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      setLoading(true);
      
      if (authUser) {
        // Set up real-time listener for user data
        const userDocRef = doc(db, "users", authUser.uid);
        const unsubscribeUserData = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error in user data listener:", error);
          setLoading(false);
        });
        
        return () => unsubscribeUserData();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ app, auth, db, storage, user, userData, loading, refreshUserData }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
} 