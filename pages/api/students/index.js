import { storage } from '../../../server/storage';
import { users } from '../../../shared/schema';
import { getStudentByPhone } from '../../../utils/db-utils';

// API endpoint for fetching all students or querying by phone
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Check if phone query parameter is provided
      const { phone } = req.query;
      
      if (phone) {
        // Format the phone number consistently
        let formattedPhone = phone;
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = `+91${formattedPhone}`;
        }
        console.log('Searching for student with formatted phone in API:', formattedPhone);
        
        // Get student by phone number
        const student = await getStudentByPhone(formattedPhone);
        
        // If no student found with this phone number
        if (!student) {
          console.log('No student found with phone number:', formattedPhone);
          return res.status(200).json([]);
        }
        
        // Format for frontend compatibility
        const formattedStudent = {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          firstName: student.firstName,
          lastName: student.lastName,
          fatherName: student.fatherName,
          phone: student.phone,
          email: student.email,
          schoolId: student.schoolId,
          class: student.class,
          section: student.section,
          rollNumber: student.rollNumber,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth,
          address: student.address,
          selfieUrl: student.selfieUrl,
          status: student.status,
          isVerified: student.status === 'verified',
          hasUploadedSelfie: !!student.selfieUrl,
          createdAt: student.createdAt
        };
        
        return res.status(200).json([formattedStudent]);
      }

      // Get all students from the database
      const students = await storage.getStudentsByStatus('verified');
      
      // Format students for frontend compatibility
      const formattedStudents = students.map(student => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        firstName: student.firstName,
        lastName: student.lastName,
        fatherName: student.fatherName,
        phone: student.phone,
        email: student.email,
        schoolId: student.schoolId,
        class: student.class,
        section: student.section,
        rollNumber: student.rollNumber,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        selfieUrl: student.selfieUrl,
        status: student.status,
        isVerified: student.status === 'verified',
        hasUploadedSelfie: !!student.selfieUrl,
        createdAt: student.createdAt
      }));
      
      return res.status(200).json(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      // Create a new student
      const studentData = req.body;
      
      // Validate required fields
      if (!studentData.firstName || !studentData.lastName || !studentData.phone || !studentData.schoolName) {
        return res.status(400).json({ 
          message: 'First name, last name, phone, and school name are required' 
        });
      }
      
      // Format phone number consistently
      let formattedPhone = studentData.phone;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+91${formattedPhone}`;
        studentData.phone = formattedPhone;
      }
      
      // Check if student with this phone already exists
      console.log('Checking if student exists with phone:', formattedPhone);
      const existingStudent = await getStudentByPhone(formattedPhone);
      
      if (existingStudent) {
        console.log('Found existing student:', existingStudent);
        // Format for frontend compatibility
        const formattedStudent = {
          id: existingStudent.id,
          name: `${existingStudent.firstName} ${existingStudent.lastName}`,
          firstName: existingStudent.firstName,
          lastName: existingStudent.lastName,
          phone: existingStudent.phone,
          email: existingStudent.email || '',
          status: existingStudent.status,
          isVerified: existingStudent.status === 'verified',
          hasUploadedSelfie: !!existingStudent.selfieUrl,
        };
        
        // Return the existing student instead of an error
        return res.status(200).json(formattedStudent);
      }
      
      // First, check if the school exists by name
      let school = await storage.getSchoolByName(studentData.schoolName);
      
      // If school doesn't exist, create it
      if (!school) {
        school = await storage.createSchool({
          name: studentData.schoolName,
          address: studentData.schoolAddress || '',
          city: studentData.city || '',
          state: studentData.state || '',
          zipCode: studentData.zipCode || ''
        });
      }
      
      // Create user account
      const user = await storage.createUser({
        email: studentData.email || `${studentData.phone}@example.com`,
        phone: studentData.phone,
        role: 'student'
      });
      
      // Create student profile
      const student = await storage.createStudent({
        userId: user.id,
        schoolId: school.id,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        fatherName: studentData.fatherName || '',
        class: studentData.class || '',
        section: studentData.section || '',
        rollNumber: studentData.rollNumber || '',
        gender: studentData.gender || '',
        email: studentData.email || '',
        phone: studentData.phone,
        status: 'pending'
      });
      
      // Format student for frontend compatibility
      const formattedStudent = {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        userId: student.userId,
        schoolId: student.schoolId,
        schoolName: school.name,
        firstName: student.firstName,
        lastName: student.lastName,
        fatherName: student.fatherName,
        phone: student.phone,
        email: student.email,
        class: student.class,
        section: student.section,
        rollNumber: student.rollNumber,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        status: student.status,
        isVerified: student.status === 'verified',
        hasUploadedSelfie: !!student.selfieUrl,
        createdAt: student.createdAt
      };
      
      return res.status(201).json(formattedStudent);
    } catch (error) {
      console.error('Error creating student:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
