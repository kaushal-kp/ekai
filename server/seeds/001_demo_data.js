const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/**
 * Seed: Demo Data
 * Creates sample schools, users, students, teachers, and academic records for testing.
 */

exports.seed = async function (knex) {
  // Delete existing data
  await knex('notifications').del();
  await knex('consent_audit_log').del();
  await knex('consents').del();
  await knex('academic_events').del();
  await knex('grades').del();
  await knex('assessments').del();
  await knex('attendance').del();
  await knex('teachers').del();
  await knex('students').del();
  await knex('users').del();
  await knex('schools').del();

  // Create demo schools
  const schools = [
    {
      udise_code: 'UT-LD-001',
      name: 'Delhi Public School',
      board: 'CBSE',
      state: 'Delhi',
      district: 'East Delhi',
      city: 'New Delhi',
      pin_code: '110092',
      principal_name: 'Dr. Rajesh Kumar',
      contact_phone: '+91-9876543210',
      contact_email: 'principal@dps-delhi.edu.in',
      subscription_tier: 'premium',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      udise_code: 'UT-LD-002',
      name: 'St. Mary\'s Academy',
      board: 'ICSE',
      state: 'Delhi',
      district: 'South Delhi',
      city: 'New Delhi',
      pin_code: '110025',
      principal_name: 'Ms. Priya Sharma',
      contact_phone: '+91-9876543211',
      contact_email: 'principal@stmarys-delhi.edu.in',
      subscription_tier: 'premium',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ];

  await knex('schools').insert(schools);

  // Create users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const demoPassword = await bcrypt.hash('Demo@123', 10);

  const users = [
    // School admins
    {
      id: uuidv4(),
      phone: '+91-9000000001',
      email: 'admin@dps-delhi.edu.in',
      name: 'Rajesh Kumar Admin',
      role: 'school_admin',
      school_udise: 'UT-LD-001',
      password_hash: adminPassword,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: uuidv4(),
      phone: '+91-9000000002',
      email: 'admin@stmarys-delhi.edu.in',
      name: 'Priya Sharma Admin',
      role: 'school_admin',
      school_udise: 'UT-LD-002',
      password_hash: adminPassword,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ];

  // Teachers
  const teacherIds = [];
  for (let i = 0; i < 3; i++) {
    const teacherId = uuidv4();
    teacherIds.push(teacherId);
    users.push({
      id: teacherId,
      phone: `+91-900000001${i}`,
      email: `teacher${i + 1}@dps-delhi.edu.in`,
      name: `Teacher ${i + 1}`,
      role: 'teacher',
      school_udise: 'UT-LD-001',
      password_hash: demoPassword,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }

  for (let i = 0; i < 3; i++) {
    const teacherId = uuidv4();
    teacherIds.push(teacherId);
    users.push({
      id: teacherId,
      phone: `+91-900000002${i}`,
      email: `teacher${i + 4}@stmarys-delhi.edu.in`,
      name: `Teacher ${i + 4}`,
      role: 'teacher',
      school_udise: 'UT-LD-002',
      password_hash: demoPassword,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }

  // Students
  const studentIds = [];
  for (let i = 0; i < 20; i++) {
    const studentId = uuidv4();
    studentIds.push(studentId);
    users.push({
      id: studentId,
      apaar_id: `IN-DL-001-2024-${String(i + 1).padStart(5, '0')}`,
      phone: `+91-910000000${i}`,
      name: `Student ${i + 1}`,
      role: 'student',
      school_udise: 'UT-LD-001',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }

  for (let i = 0; i < 20; i++) {
    const studentId = uuidv4();
    studentIds.push(studentId);
    users.push({
      id: studentId,
      apaar_id: `IN-DL-002-2024-${String(i + 1).padStart(5, '0')}`,
      phone: `+91-910000001${i}`,
      name: `Student ${i + 21}`,
      role: 'student',
      school_udise: 'UT-LD-002',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }

  const userIds = await knex('users').insert(users).returning('*');

  // Create teachers records
  const teachersData = [];
  for (let i = 0; i < 3; i++) {
    teachersData.push({
      id: uuidv4(),
      user_id: teacherIds[i],
      school_udise: 'UT-LD-001',
      name: `Teacher ${i + 1}`,
      employee_id: `EMP-${String(i + 1).padStart(5, '0')}`,
      designation: i === 0 ? 'Principal' : 'Teacher',
      subjects: JSON.stringify(['Mathematics', 'English', 'Science'][i] ? [[['Mathematics', 'English', 'Science'][i]]] : []),
      assigned_classes: JSON.stringify([i + 6]),
      is_class_teacher: i === 0,
      class_teacher_of_class: i === 0 ? 6 : null,
      class_teacher_of_section: i === 0 ? 'A' : null,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }

  for (let i = 0; i < 3; i++) {
    teachersData.push({
      id: uuidv4(),
      user_id: teacherIds[i + 3],
      school_udise: 'UT-LD-002',
      name: `Teacher ${i + 4}`,
      employee_id: `EMP-${String(i + 4).padStart(5, '0')}`,
      designation: i === 0 ? 'Vice Principal' : 'Teacher',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Biology'][i] ? [[['Physics', 'Chemistry', 'Biology'][i]]] : []),
      assigned_classes: JSON.stringify([i + 8]),
      is_class_teacher: i === 0,
      class_teacher_of_class: i === 0 ? 8 : null,
      class_teacher_of_section: i === 0 ? 'B' : null,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }

  await knex('teachers').insert(teachersData);

  // Create students records
  const studentsData = [];
  for (let i = 0; i < 20; i++) {
    const user = users.find((u) => u.apaar_id === `IN-DL-001-2024-${String(i + 1).padStart(5, '0')}`);
    studentsData.push({
      apaar_id: user.apaar_id,
      user_id: user.id,
      school_udise: 'UT-LD-001',
      name: `Student ${i + 1}`,
      dob: new Date(2010 - Math.floor(i / 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      gender: ['M', 'F'][Math.floor(Math.random() * 2)],
      class: 6 + Math.floor(i / 5),
      section: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      guardian_name: `Guardian ${i + 1}`,
      guardian_phone: `+91-920000000${i}`,
      guardian_relation: 'Parent',
      enrollment_date: new Date(2024, 0, 1),
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }

  for (let i = 0; i < 20; i++) {
    const user = users.find((u) => u.apaar_id === `IN-DL-002-2024-${String(i + 1).padStart(5, '0')}`);
    studentsData.push({
      apaar_id: user.apaar_id,
      user_id: user.id,
      school_udise: 'UT-LD-002',
      name: `Student ${i + 21}`,
      dob: new Date(2010 - Math.floor(i / 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      gender: ['M', 'F'][Math.floor(Math.random() * 2)],
      class: 8 + Math.floor(i / 5),
      section: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      guardian_name: `Guardian ${i + 21}`,
      guardian_phone: `+91-920000001${i}`,
      guardian_relation: 'Parent',
      enrollment_date: new Date(2024, 0, 1),
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }

  await knex('students').insert(studentsData);

  // Create attendance records (last 30 days)
  const attendanceData = [];
  const statuses = ['present', 'absent', 'late', 'half_day'];
  const today = new Date();

  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const student of studentsData) {
      attendanceData.push({
        id: uuidv4(),
        student_apaar_id: student.apaar_id,
        school_udise: student.school_udise,
        marked_by: teacherIds[0],
        date: date.toISOString().split('T')[0],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        remarks: null,
        device_id: null,
        is_offline_entry: false,
        synced_at: knex.fn.now(),
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });
    }
  }

  await knex('attendance').insert(attendanceData);

  // Create assessments
  const assessmentsData = [
    {
      id: uuidv4(),
      school_udise: 'UT-LD-001',
      created_by: teacherIds[0],
      title: 'Mathematics Unit Test 1',
      subject: 'Mathematics',
      class: 6,
      section: 'A',
      assessment_type: 'unit_test',
      max_marks: 50,
      weightage: 10,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      is_published: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: uuidv4(),
      school_udise: 'UT-LD-001',
      created_by: teacherIds[1],
      title: 'English Mid-Term Exam',
      subject: 'English',
      class: 7,
      section: 'B',
      assessment_type: 'midterm',
      max_marks: 100,
      weightage: 30,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      is_published: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: uuidv4(),
      school_udise: 'UT-LD-002',
      created_by: teacherIds[3],
      title: 'Physics Project Work',
      subject: 'Physics',
      class: 8,
      section: 'A',
      assessment_type: 'project',
      max_marks: 40,
      weightage: 20,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      is_published: false,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ];

  const createdAssessments = await knex('assessments').insert(assessmentsData).returning('*');

  // Create grades for each assessment
  const gradesData = [];
  for (const assessment of createdAssessments) {
    const relevantStudents = studentsData.filter(
      (s) => s.school_udise === assessment.school_udise && s.class === assessment.class
    );

    for (const student of relevantStudents) {
      const marksObtained = Math.floor(Math.random() * assessment.max_marks);
      const percentage = (marksObtained / assessment.max_marks) * 100;
      const gradeMap = {
        A: [90, 100],
        B: [70, 89],
        C: [50, 69],
        D: [35, 49],
        F: [0, 34],
      };

      let gradeLetter = 'F';
      for (const [grade, range] of Object.entries(gradeMap)) {
        if (percentage >= range[0] && percentage <= range[1]) {
          gradeLetter = grade;
          break;
        }
      }

      gradesData.push({
        id: uuidv4(),
        assessment_id: assessment.id,
        student_apaar_id: student.apaar_id,
        graded_by: assessment.created_by,
        marks_obtained: marksObtained,
        grade_letter: gradeLetter,
        percentile: percentage,
        remarks: percentage >= 75 ? 'Good performance' : percentage >= 50 ? 'Average' : 'Needs improvement',
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });
    }
  }

  await knex('grades').insert(gradesData);

  // Create academic events
  const academicEventsData = [
    {
      id: uuidv4(),
      school_udise: 'UT-LD-001',
      created_by: userIds[0].id,
      title: 'Summer Break',
      description: 'School will be closed for summer vacation',
      event_type: 'holiday',
      start_date: new Date(2024, 4, 15),
      end_date: new Date(2024, 6, 15),
      is_school_wide: true,
      applicable_classes: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: uuidv4(),
      school_udise: 'UT-LD-001',
      created_by: userIds[0].id,
      title: 'Annual Exam',
      description: 'Final annual examination for all classes',
      event_type: 'exam',
      start_date: new Date(2024, 3, 1),
      end_date: new Date(2024, 3, 30),
      is_school_wide: false,
      applicable_classes: JSON.stringify([6, 7, 8]),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ];

  await knex('academic_events').insert(academicEventsData);

  // Create consents
  const consentsData = [
    {
      id: uuidv4(),
      student_apaar_id: studentsData[0].apaar_id,
      granted_by: studentsData[0].user_id,
      granted_to_entity: 'UT-LD-001',
      granted_to_type: 'school',
      scope: 'full_profile',
      status: 'active',
      granted_at: knex.fn.now(),
      revoked_at: null,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ];

  await knex('consents').insert(consentsData);

  // Create consent audit logs
  const auditLogData = [
    {
      id: uuidv4(),
      consent_id: consentsData[0].id,
      performed_by: studentsData[0].user_id,
      action: 'granted',
      ip_address: '127.0.0.1',
      details: JSON.stringify({ reason: 'Profile view request' }),
      created_at: knex.fn.now(),
    },
  ];

  await knex('consent_audit_log').insert(auditLogData);
};
