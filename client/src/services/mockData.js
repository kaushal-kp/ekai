/**
 * Mock data for demo/offline functionality
 */

export const mockStudentUser = {
  id: 'student-001',
  role: 'student',
  name: 'Arjun Sharma',
  phone: '9876543210',
  email: 'arjun.sharma@student.com',
  schoolId: 'school-001',
  schoolName: 'Delhi Public School',
  classGrade: '10-A',
  rollNumber: '042',
  apaarLinked: true,
  registrationNumber: 'APAAR123456789',
  dateOfBirth: '2008-05-15',
  parentName: 'Ramesh Sharma',
  parentPhone: '9876543200'
}

export const mockSchoolAdminUser = {
  id: 'admin-001',
  role: 'school_admin',
  name: 'Priya Patel',
  phone: '9876543211',
  email: 'priya.patel@school.com',
  schoolId: 'school-001',
  schoolName: 'Delhi Public School',
  schoolCode: 'DPSX001',
  permissions: ['view_students', 'manage_attendance', 'manage_assessments', 'view_reports']
}

export const mockStudents = [
  {
    id: 'student-001',
    name: 'Arjun Sharma',
    rollNumber: '042',
    classGrade: '10-A',
    registrationNumber: 'APAAR123456789',
    parentName: 'Ramesh Sharma',
    parentPhone: '9876543200',
    status: 'active',
    admissionDate: '2020-06-15',
    totalAttendance: 92,
    apaarLinked: true
  },
  {
    id: 'student-002',
    name: 'Riya Verma',
    rollNumber: '043',
    classGrade: '10-A',
    registrationNumber: 'APAAR987654321',
    parentName: 'Suresh Verma',
    parentPhone: '9876543201',
    status: 'active',
    admissionDate: '2020-06-15',
    totalAttendance: 88,
    apaarLinked: false
  },
  {
    id: 'student-003',
    name: 'Kavya Singh',
    rollNumber: '044',
    classGrade: '10-A',
    registrationNumber: 'APAAR567890123',
    parentName: 'Vikram Singh',
    parentPhone: '9876543202',
    status: 'active',
    admissionDate: '2020-06-15',
    totalAttendance: 95,
    apaarLinked: true
  }
]

export const mockGrades = [
  {
    id: 'grade-001',
    subject: 'Mathematics',
    marks: 92,
    totalMarks: 100,
    grade: 'A+',
    percentage: 92,
    examType: 'Mid-Term',
    date: '2024-02-15'
  },
  {
    id: 'grade-002',
    subject: 'English',
    marks: 88,
    totalMarks: 100,
    grade: 'A',
    percentage: 88,
    examType: 'Mid-Term',
    date: '2024-02-16'
  },
  {
    id: 'grade-003',
    subject: 'Science',
    marks: 85,
    totalMarks: 100,
    grade: 'A',
    percentage: 85,
    examType: 'Mid-Term',
    date: '2024-02-17'
  },
  {
    id: 'grade-004',
    subject: 'Social Studies',
    marks: 90,
    totalMarks: 100,
    grade: 'A+',
    percentage: 90,
    examType: 'Mid-Term',
    date: '2024-02-18'
  }
]

export const mockAttendance = [
  {
    date: '2024-03-20',
    status: 'present',
    subject: 'Mathematics'
  },
  {
    date: '2024-03-19',
    status: 'present',
    subject: 'English'
  },
  {
    date: '2024-03-18',
    status: 'absent',
    subject: 'Science'
  },
  {
    date: '2024-03-17',
    status: 'present',
    subject: 'Social Studies'
  },
  {
    date: '2024-03-15',
    status: 'present',
    subject: 'PE'
  }
]

export const mockDocuments = [
  {
    id: 'doc-001',
    name: 'Class 10 Admit Card',
    type: 'admit_card',
    uploadDate: '2024-03-01',
    expiryDate: null,
    verified: true,
    url: '#'
  },
  {
    id: 'doc-002',
    name: 'Transfer Certificate',
    type: 'transfer_certificate',
    uploadDate: '2024-02-15',
    expiryDate: null,
    verified: true,
    url: '#'
  },
  {
    id: 'doc-003',
    name: 'Medical Certificate',
    type: 'medical_certificate',
    uploadDate: '2024-01-10',
    expiryDate: '2025-01-10',
    verified: true,
    url: '#'
  }
]

export const mockTeachers = [
  {
    id: 'teacher-001',
    name: 'Mrs. Anjali Verma',
    subject: 'Mathematics',
    experience: 12,
    phone: '9876543220',
    email: 'anjali.verma@school.com',
    qualification: 'M.Sc. Mathematics',
    joinDate: '2015-06-01'
  },
  {
    id: 'teacher-002',
    name: 'Mr. Rahul Gupta',
    subject: 'English',
    experience: 8,
    phone: '9876543221',
    email: 'rahul.gupta@school.com',
    qualification: 'M.A. English',
    joinDate: '2018-06-01'
  },
  {
    id: 'teacher-003',
    name: 'Dr. Neha Singh',
    subject: 'Science',
    experience: 15,
    phone: '9876543222',
    email: 'neha.singh@school.com',
    qualification: 'M.Sc. Physics, Ph.D.',
    joinDate: '2012-06-01'
  }
]

export const mockAssessments = [
  {
    id: 'assessment-001',
    name: 'Mathematics Unit Test 1',
    subject: 'Mathematics',
    totalMarks: 100,
    date: '2024-03-25',
    status: 'completed',
    class: '10-A',
    teacher: 'Mrs. Anjali Verma'
  },
  {
    id: 'assessment-002',
    name: 'English Mid-Term Exam',
    subject: 'English',
    totalMarks: 100,
    date: '2024-03-22',
    status: 'completed',
    class: '10-A',
    teacher: 'Mr. Rahul Gupta'
  },
  {
    id: 'assessment-003',
    name: 'Science Practical Exam',
    subject: 'Science',
    totalMarks: 50,
    date: '2024-03-28',
    status: 'pending',
    class: '10-A',
    teacher: 'Dr. Neha Singh'
  }
]

export const mockAttendanceRecords = [
  {
    studentId: 'student-001',
    name: 'Arjun Sharma',
    present: 45,
    absent: 3,
    leave: 2,
    total: 50,
    percentage: 92
  },
  {
    studentId: 'student-002',
    name: 'Riya Verma',
    present: 44,
    absent: 4,
    leave: 2,
    total: 50,
    percentage: 88
  },
  {
    studentId: 'student-003',
    name: 'Kavya Singh',
    present: 47,
    absent: 2,
    leave: 1,
    total: 50,
    percentage: 94
  }
]

export const mockNotifications = [
  {
    id: 'notif-001',
    title: 'Assignment Submission Deadline',
    message: 'Mathematics assignment is due tomorrow at 5:00 PM',
    type: 'assignment',
    date: '2024-03-24T10:30:00Z',
    read: false
  },
  {
    id: 'notif-002',
    title: 'Exam Result Published',
    message: 'Your Science Mid-Term exam result has been published',
    type: 'result',
    date: '2024-03-23T14:20:00Z',
    read: true
  },
  {
    id: 'notif-003',
    title: 'Class Cancelled',
    message: 'PE class for today (2024-03-24) has been cancelled',
    type: 'class_update',
    date: '2024-03-24T08:00:00Z',
    read: false
  }
]

export const mockConsentScopes = [
  {
    id: 'academic_records',
    name: 'Academic Records',
    description: 'Access to grades, test scores, and academic progress',
    requested: true
  },
  {
    id: 'attendance_records',
    name: 'Attendance Records',
    description: 'Access to daily attendance information',
    requested: true
  },
  {
    id: 'personal_info',
    name: 'Personal Information',
    description: 'Access to name, date of birth, and contact details',
    requested: true
  }
]

export const mockCalendarEvents = [
  {
    id: 'event-001',
    title: 'Mid-Term Exams Start',
    date: '2024-04-01',
    type: 'exam',
    description: 'Mid-term examination begins for all classes'
  },
  {
    id: 'event-002',
    title: 'Teacher-Parent Meeting',
    date: '2024-04-10',
    type: 'meeting',
    description: 'Parent-teacher conference for Class 10'
  },
  {
    id: 'event-003',
    title: 'Annual Sports Day',
    date: '2024-04-15',
    type: 'event',
    description: 'Annual sports competition for all classes'
  }
]

export const mockReports = [
  {
    id: 'report-001',
    title: 'Class Attendance Report - March 2024',
    type: 'attendance',
    generatedDate: '2024-03-24',
    period: 'March 2024'
  },
  {
    id: 'report-002',
    title: 'Class Performance Analysis',
    type: 'performance',
    generatedDate: '2024-03-24',
    period: 'Term 2'
  }
]
