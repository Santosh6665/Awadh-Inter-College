

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Student, Teacher, AttendanceRecord } from '../types';

const studentsCollection = collection(db, 'students');
const teachersCollection = collection(db, 'teachers');
const attendanceCollection = collection(db, 'attendance');

// Student Functions
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

// Teacher Functions
export async function addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
  const docRef = await addDoc(teachersCollection, teacher);
  return { id: docRef.id, ...teacher };
}

export async function getTeachers(): Promise<Teacher[]> {
  const snapshot = await getDocs(teachersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
}

export async function getTeacher(id: string): Promise<Teacher | null> {
    const docRef = doc(db, 'teachers', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Teacher;
    }
    return null;
}

export async function updateTeacher(id: string, teacher: Partial<Teacher>): Promise<void> {
  const teacherDoc = doc(db, 'teachers', id);
  await updateDoc(teacherDoc, teacher);
}

export async function deleteTeacher(id: string): Promise<void> {
  const teacherDoc = doc(db, 'teachers', id);
  await deleteDoc(teacherDoc);
}


// Attendance Functions
export async function saveAttendance(records: { studentId: string, status: 'Present' | 'Absent' | 'Late' }[], date: string) {
  const batch = writeBatch(db);

  records.forEach(record => {
    // Create a unique ID for each attendance record to avoid overwriting
    const docId = `${date}_${record.studentId}`;
    const docRef = doc(attendanceCollection, docId);
    batch.set(docRef, {
      ...record,
      date,
    });
  });

  await batch.commit();
}

export async function getAttendanceForDate(date: string): Promise<AttendanceRecord[]> {
  const q = query(attendanceCollection, where("date", "==", date));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as AttendanceRecord);
}

export async function getAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
  const q = query(attendanceCollection, where("studentId", "==", studentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as AttendanceRecord);
}
