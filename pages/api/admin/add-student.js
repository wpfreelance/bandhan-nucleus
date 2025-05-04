import { storage } from '../../../server/storage';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // For browser-based client authentication, we don't need to check the request
    // The authentication is already handled by the browser and localStorage
    
    const { 
      firstName, 
      lastName, 
      fatherName, 
      class: className, 
      section, 
      rollNumber, 
      gender, 
      dateOfBirth, 
      address, 
      email, 
      phone,
      schoolId,
      status = 'verified'
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !phone || !schoolId) {
      return res.status(400).json({ message: 'First name, last name, phone number, and school ID are required' });
    }
    
    // Check if a student with this phone number already exists
    const existingStudent = await storage.getStudentByPhone(phone);
    if (existingStudent) {
      return res.status(409).json({ message: 'A student with this phone number already exists' });
    }
    
    console.log('Creating new student:', { firstName, lastName, phone, schoolId });
    
    // Create a new user record first (for authentication)
    // Generate a default email if not provided
    const defaultEmail = email || `${phone.replace(/\+/g, '')}@bandhan.com`;
    
    const newUser = await storage.createUser({
      username: phone, // Use phone as username
      password: phone.substring(phone.length - 6), // Use last 6 digits of phone as default password
      role: 'student',
      phone: phone,
      email: defaultEmail,
      fullName: `${firstName} ${lastName}`
    });
    
    console.log('Created user record for student:', newUser);
    
    // Create the student record
    const newStudent = await storage.createStudent({
      userId: newUser.id,
      schoolId,
      firstName,
      lastName,
      fatherName,
      class: className,
      section,
      rollNumber,
      gender,
      dateOfBirth: dateOfBirth || null,
      address,
      email,
      phone,
      status,
      selfieUrl: null // Students added manually will need to upload selfies
    });
    
    console.log('Created student record:', newStudent);
    
    return res.status(201).json({ 
      message: 'Student added successfully', 
      student: newStudent 
    });
    
  } catch (error) {
    console.error('Error adding student:', error);
    return res.status(500).json({ 
      message: 'An error occurred while adding the student',
      error: error.message
    });
  }
}