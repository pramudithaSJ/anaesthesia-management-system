'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Hospital, Person } from '@/types';

interface DataContextType {
  // Hospitals
  hospitals: Hospital[];
  hospitalsLoading: boolean;
  addHospital: (hospital: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateHospital: (id: string, hospital: Partial<Hospital>) => Promise<void>;
  deleteHospital: (id: string) => Promise<void>;
  
  // People
  people: Person[];
  peopleLoading: boolean;
  addPerson: (person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePerson: (id: string, person: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  
  // Pagination
  loadMorePeople: () => Promise<void>;
  hasMorePeople: boolean;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const PEOPLE_PAGE_SIZE = 10;

export function DataProvider({ children }: { children: ReactNode }) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [lastPeopleDoc, setLastPeopleDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMorePeople, setHasMorePeople] = useState(true);
  const lastPeopleDocRef = useRef<DocumentSnapshot | null>(null);

  // Load hospitals
  const loadHospitals = useCallback(async () => {
    try {
      if (!db) {
        console.error('Database not initialized');
        return;
      }
      
      setHospitalsLoading(true);
      const hospitalsCollection = collection(db, 'hospitals');
      const hospitalsQuery = query(hospitalsCollection, orderBy('name'));
      const snapshot = await getDocs(hospitalsQuery);
      
      const hospitalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hospital[];
      
      setHospitals(hospitalsData);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    } finally {
      setHospitalsLoading(false);
    }
  }, []);

  // Load people with pagination
  const loadPeople = useCallback(async (isLoadMore = false) => {
    try {
      if (!db) {
        console.error('Database not initialized');
        return;
      }
      
      if (!isLoadMore) setPeopleLoading(true);
      
      const peopleCollection = collection(db, 'people');
      let peopleQuery = query(
        peopleCollection, 
        orderBy('lastName'), 
        limit(PEOPLE_PAGE_SIZE)
      );
      
      if (isLoadMore && lastPeopleDocRef.current) {
        peopleQuery = query(
          peopleCollection,
          orderBy('lastName'),
          startAfter(lastPeopleDocRef.current),
          limit(PEOPLE_PAGE_SIZE)
        );
      }
      
      const snapshot = await getDocs(peopleQuery);
      
      const peopleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Person[];
      
      if (isLoadMore) {
        setPeople(prev => [...prev, ...peopleData]);
      } else {
        setPeople(peopleData);
        setLastPeopleDoc(null); // Reset pagination for fresh load
        lastPeopleDocRef.current = null;
      }
      
      const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      setLastPeopleDoc(lastDoc);
      lastPeopleDocRef.current = lastDoc;
      setHasMorePeople(snapshot.docs.length === PEOPLE_PAGE_SIZE);
      
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      if (!isLoadMore) setPeopleLoading(false);
    }
  }, []); // Remove dependency to prevent recreation

  // Initial load
  useEffect(() => {
    loadHospitals();
    loadPeople();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array for initial load only

  // Hospital CRUD operations
  const addHospital = async (hospitalData: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      const now = new Date().toISOString();
      const cleanedData = cleanFirebaseData({
        ...hospitalData,
        createdAt: now,
        updatedAt: now
      });
      
      const docRef = await addDoc(collection(db, 'hospitals'), cleanedData);
      
      const newHospital: Hospital = {
        id: docRef.id,
        ...hospitalData,
        createdAt: now,
        updatedAt: now
      };
      
      setHospitals(prev => [...prev, newHospital].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error adding hospital:', error);
      throw error;
    }
  };

  const updateHospital = async (id: string, hospitalData: Partial<Hospital>) => {
    try {
      const now = new Date().toISOString();
      const cleanedData = cleanFirebaseData({
        ...hospitalData,
        updatedAt: now
      });
      
      await updateDoc(doc(db!, 'hospitals', id), cleanedData);
      
      setHospitals(prev => 
        prev.map(hospital => 
          hospital.id === id 
            ? { ...hospital, ...hospitalData, updatedAt: now }
            : hospital
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (error) {
      console.error('Error updating hospital:', error);
      throw error;
    }
  };

  const deleteHospital = async (id: string) => {
    try {
      await deleteDoc(doc(db!, 'hospitals', id));
      setHospitals(prev => prev.filter(hospital => hospital.id !== id));
    } catch (error) {
      console.error('Error deleting hospital:', error);
      throw error;
    }
  };

  // Helper function to clean undefined values for Firebase
  const cleanFirebaseData = (data: Record<string, unknown>) => {
    const cleaned: Record<string, unknown> = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          cleaned[key] = cleanFirebaseData(value as Record<string, unknown>);
        } else {
          cleaned[key] = value;
        }
      }
    });
    return cleaned;
  };

  // Person CRUD operations
  const addPerson = async (personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      const cleanedData = cleanFirebaseData({
        ...personData,
        createdAt: now,
        updatedAt: now
      });
      
      const docRef = await addDoc(collection(db!, 'people'), cleanedData);
      
      const newPerson: Person = {
        id: docRef.id,
        ...personData,
        createdAt: now,
        updatedAt: now
      };
      
      setPeople(prev => [newPerson, ...prev]);
    } catch (error) {
      console.error('Error adding person:', error);
      throw error;
    }
  };

  const updatePerson = async (id: string, personData: Partial<Person>) => {
    try {
      const now = new Date().toISOString();
      const cleanedData = cleanFirebaseData({
        ...personData,
        updatedAt: now
      });
      
      await updateDoc(doc(db!, 'people', id), cleanedData);
      
      setPeople(prev => 
        prev.map(person => 
          person.id === id 
            ? { ...person, ...personData, updatedAt: now }
            : person
        )
      );
    } catch (error) {
      console.error('Error updating person:', error);
      throw error;
    }
  };

  const deletePerson = async (id: string) => {
    try {
      await deleteDoc(doc(db!, 'people', id));
      setPeople(prev => prev.filter(person => person.id !== id));
    } catch (error) {
      console.error('Error deleting person:', error);
      throw error;
    }
  };

  const loadMorePeople = useCallback(async () => {
    if (hasMorePeople && lastPeopleDoc && db) {
      try {
        const peopleCollection = collection(db, 'people');
        const peopleQuery = query(
          peopleCollection,
          orderBy('lastName'),
          startAfter(lastPeopleDoc),
          limit(PEOPLE_PAGE_SIZE)
        );
        
        const snapshot = await getDocs(peopleQuery);
        
        const peopleData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Person[];
        
        setPeople(prev => [...prev, ...peopleData]);
        setLastPeopleDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMorePeople(snapshot.docs.length === PEOPLE_PAGE_SIZE);
        
      } catch (error) {
        console.error('Error loading more people:', error);
      }
    }
  }, [hasMorePeople, lastPeopleDoc]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadHospitals(),
      loadPeople()
    ]);
  }, [loadHospitals, loadPeople]);

  const value = {
    hospitals,
    hospitalsLoading,
    addHospital,
    updateHospital,
    deleteHospital,
    
    people,
    peopleLoading,
    addPerson,
    updatePerson,
    deletePerson,
    
    loadMorePeople,
    hasMorePeople,
    
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}