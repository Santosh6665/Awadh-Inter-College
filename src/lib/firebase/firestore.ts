
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Student } from '../types';

const studentsCollection = collection(db, 'students');

export async function addStudent(student: Omit<Student, 'id'>): Promise<Student> {
  const docRef = await addDoc(studentsCollection, student);
  return { id: docRef.id, ...student };
}

export async function getStudents(): Promise<Student[]> {
  const snapshot = await getDocs(studentsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
}

export async function getStudent(id: string): Promise<Student | null> {
    const docRef = doc(db, 'students', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Student;
    }
    return null;
}

export async function getStudentByEmail(email: string): Promise<Student | null> {
    const q = query(studentsCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Student;
    }
    return null;
}


export async function updateStudent(id: string, student: Partial<Student>): Promise<void> {
  const studentDoc = doc(db, 'students', id);
  await updateDoc(studentDoc, student);
}

export async function deleteStudent(id: string): Promise<void> {
  const studentDoc = doc(db, 'students', id);
  await deleteDoc(studentDoc);
}
