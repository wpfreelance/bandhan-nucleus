import { storage } from '../../../server/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phone, firstName, lastName, email } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Check if a student with this phone already exists
    const existingStudent = await storage.getStudentByPhone(phone);
    
    if (existingStudent) {
      // If student exists, return the existing record
      return res.status(200).json({ 
        student: existingStudent,
        message: 'Student record already exists',
        exists: true
      });
    }

    // Create a new user with the student role
    const user = await storage.createUser({
      email: email || null,
      phone: phone,
      role: 'student',
      createdAt: new Date()
    });

    // Create a new student record
    const student = await storage.createStudent({
      userId: user.id,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone,
      email: email || '',
      status: 'pending',
      createdAt: new Date()
    });

    res.status(201).json({ 
      student,
      message: 'Student record created successfully'
    });
  } catch (error) {
    console.error('Error creating student record:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
}