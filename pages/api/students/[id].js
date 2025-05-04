import { storage } from '../../../server/storage';
import { getStudentByPhone, updateStudent } from '../../../utils/db-utils';

// API endpoint for getting, updating, or deleting a specific student by ID
export default async function handler(req, res) {
  const { id } = req.query;
  
  // Convert ID to number
  const studentId = parseInt(id, 10);

  if (isNaN(studentId)) {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  // Get the student from database
  const student = await storage.getStudent(studentId);
  
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  // GET method - Retrieve a student
  if (req.method === 'GET') {
    try {
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
        createdAt: student.createdAt,
        verifiedAt: student.verifiedAt
      };
      
      return res.status(200).json(formattedStudent);
    } catch (error) {
      console.error('Error fetching student:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // PATCH method - Update a student
  else if (req.method === 'PATCH') {
    try {
      const updateData = req.body;
      
      // Prepare the data for database update
      const studentUpdate = {};
      
      // Map frontend fields to database fields
      if (updateData.firstName) studentUpdate.firstName = updateData.firstName;
      if (updateData.lastName) studentUpdate.lastName = updateData.lastName;
      if (updateData.fatherName) studentUpdate.fatherName = updateData.fatherName;
      if (updateData.email) studentUpdate.email = updateData.email;
      if (updateData.class) studentUpdate.class = updateData.class;
      if (updateData.section) studentUpdate.section = updateData.section;
      if (updateData.rollNumber) studentUpdate.rollNumber = updateData.rollNumber;
      if (updateData.gender) studentUpdate.gender = updateData.gender;
      if (updateData.address) studentUpdate.address = updateData.address;
      if (updateData.selfieUrl) studentUpdate.selfieUrl = updateData.selfieUrl;
      
      // Special handling for status updates
      if (updateData.status) {
        studentUpdate.status = updateData.status;
        
        // If verifying the student, update verified timestamp
        if (updateData.status === 'verified' && student.status !== 'verified') {
          studentUpdate.verifiedAt = new Date();
          // TODO: Set verified by when we have auth
        }
      }
      
      // Update the student in the database
      const updatedStudent = await updateStudent(studentId, studentUpdate);
      
      // Format updated student for frontend
      const formattedStudent = {
        id: updatedStudent.id,
        name: `${updatedStudent.firstName} ${updatedStudent.lastName}`,
        firstName: updatedStudent.firstName,
        lastName: updatedStudent.lastName,
        fatherName: updatedStudent.fatherName,
        phone: updatedStudent.phone,
        email: updatedStudent.email,
        schoolId: updatedStudent.schoolId,
        class: updatedStudent.class,
        section: updatedStudent.section,
        rollNumber: updatedStudent.rollNumber,
        gender: updatedStudent.gender,
        dateOfBirth: updatedStudent.dateOfBirth,
        address: updatedStudent.address,
        selfieUrl: updatedStudent.selfieUrl,
        status: updatedStudent.status,
        isVerified: updatedStudent.status === 'verified',
        hasUploadedSelfie: !!updatedStudent.selfieUrl,
        createdAt: updatedStudent.createdAt,
        verifiedAt: updatedStudent.verifiedAt
      };
      
      return res.status(200).json(formattedStudent);
    } catch (error) {
      console.error('Error updating student:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // DELETE method is not implemented for production
  // We should never delete student records in a production environment,
  // but rather mark them as inactive or archived
  else if (req.method === 'DELETE') {
    return res.status(405).json({ 
      message: 'Student deletion is not supported in the production environment' 
    });
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
