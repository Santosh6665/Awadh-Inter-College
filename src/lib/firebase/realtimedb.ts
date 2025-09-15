
import { db } from './firebase';
import { ref, push, get, set, remove, query, orderByChild, equalTo, update } from 'firebase/database';
import type { Student, Teacher, AttendanceRecord, Book, BusRoute } from '../types';

// Helper to convert snapshot to array
const snapshotToArray = (snapshot: any) => {
    const array: any[] = [];
    snapshot.forEach((childSnapshot: any) => {
        const item = childSnapshot.val();
        item.id = childSnapshot.key;
        array.push(item);
    });
    return array;
};


// Student Functions
export async function addStudent(student: Omit<Student, 'id'>): Promise<Student> {
  const studentsRef = ref(db, 'students');
  const newStudentRef = push(studentsRef);
  await set(newStudentRef, student);
  return { id: newStudentRef.key!, ...student };
}

export async function getStudents(): Promise<Student[]> {
  const studentsRef = ref(db, 'students');
  const snapshot = await get(studentsRef);
  return snapshot.exists() ? snapshotToArray(snapshot) : [];
}

export async function getStudent(id: string): Promise<Student | null> {
    const studentRef = ref(db, `students/${id}`);
    const snapshot = await get(studentRef);
    if (snapshot.exists()) {
        return { id: snapshot.key, ...snapshot.val() } as Student;
    }
    return null;
}

export async function getStudentByEmail(email: string): Promise<Student | null> {
    const studentsRef = ref(db, 'students');
    const q = query(studentsRef, orderByChild('email'), equalTo(email));
    const snapshot = await get(q);
    if (snapshot.exists()) {
        const students = snapshotToArray(snapshot);
        return students[0];
    }
    return null;
}

export async function updateStudent(id: string, studentData: Partial<Student>): Promise<void> {
  const studentRef = ref(db, `students/${id}`);
  await update(studentRef, studentData);
}

export async function deleteStudent(id: string): Promise<void> {
  const studentRef = ref(db, `students/${id}`);
  await remove(studentRef);
}

// Teacher Functions
export async function addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
  const teachersRef = ref(db, 'teachers');
  const newTeacherRef = push(teachersRef);
  await set(newTeacherRef, teacher);
  return { id: newTeacherRef.key!, ...teacher };
}

export async function getTeachers(): Promise<Teacher[]> {
  const teachersRef = ref(db, 'teachers');
  const snapshot = await get(teachersRef);
  return snapshot.exists() ? snapshotToArray(snapshot) : [];
}

export async function getTeacher(id: string): Promise<Teacher | null> {
    const teacherRef = ref(db, `teachers/${id}`);
    const snapshot = await get(teacherRef);
    if (snapshot.exists()) {
        return { id: snapshot.key, ...snapshot.val() } as Teacher;
    }
    return null;
}

export async function updateTeacher(id: string, teacher: Partial<Teacher>): Promise<void> {
  const teacherRef = ref(db, `teachers/${id}`);
  await update(teacherRef, teacher);
}

export async function deleteTeacher(id: string): Promise<void> {
  const teacherRef = ref(db, `teachers/${id}`);
  await remove(teacherRef);
}


// Attendance Functions
export async function saveAttendance(records: { studentId: string, status: 'Present' | 'Absent' | 'Late' }[], date: string) {
  const updates: { [key: string]: any } = {};
  records.forEach(record => {
    const docId = `${date}_${record.studentId}`;
    updates[`/attendance/${docId}`] = { ...record, date, studentId: record.studentId };
  });
  await update(ref(db), updates);
}

export async function getAttendanceForDate(date: string): Promise<AttendanceRecord[]> {
  const attendanceRef = ref(db, 'attendance');
  const q = query(attendanceRef, orderByChild('date'), equalTo(date));
  const snapshot = await get(q);
  return snapshot.exists() ? snapshotToArray(snapshot) : [];
}

export async function getAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
  const attendanceRef = ref(db, 'attendance');
  const q = query(attendanceRef, orderByChild('studentId'), equalTo(studentId));
  const snapshot = await get(q);
  return snapshot.exists() ? snapshotToArray(snapshot) : [];
}

// Library Functions
export async function addBook(book: Omit<Book, 'id'>): Promise<Book> {
  const booksRef = ref(db, 'books');
  const newBookRef = push(booksRef);
  await set(newBookRef, book);
  return { id: newBookRef.key!, ...book };
}

export async function getBooks(): Promise<Book[]> {
  const booksRef = ref(db, 'books');
  const snapshot = await get(booksRef);
  return snapshot.exists() ? snapshotToArray(snapshot) : [];
}

export async function updateBook(id: string, bookUpdate: Partial<Book>): Promise<void> {
  const bookRef = ref(db, `books/${id}`);
  await update(bookRef, bookUpdate);
}

// Transport Functions
export async function addBusRoute(route: Omit<BusRoute, 'id'>): Promise<BusRoute> {
    const routesRef = ref(db, 'busRoutes');
    const newRouteRef = push(routesRef);
    await set(newRouteRef, route);
    return { id: newRouteRef.key!, ...route };
}

export async function getBusRoutes(): Promise<BusRoute[]> {
    const routesRef = ref(db, 'busRoutes');
    const snapshot = await get(routesRef);
    return snapshot.exists() ? snapshotToArray(snapshot) : [];
}

export async function updateBusRoute(id: string, route: Partial<BusRoute>): Promise<void> {
    const routeRef = ref(db, `busRoutes/${id}`);
    await update(routeRef, route);
}

export async function deleteBusRoute(id: string): Promise<void> {
    const routeRef = ref(db, `busRoutes/${id}`);
    await remove(routeRef);
}
