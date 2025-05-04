import { storage } from '../../../server/storage';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  console.log('Admin registration API called');
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Registration request body:', JSON.stringify(req.body, null, 2));
    const { username, fullName, email, password, school } = req.body;

    // Validate required fields
    console.log('Validating required fields');
    if (!username || !fullName || !email || !password || !school?.name) {
      const missingFields = [];
      if (!username) missingFields.push('username');
      if (!fullName) missingFields.push('fullName');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!school?.name) missingFields.push('school.name');
      
      console.log('Missing required fields:', missingFields.join(', '));
      return res.status(400).json({ 
        message: 'Missing required fields', 
        details: `Missing: ${missingFields.join(', ')}` 
      });
    }

    // Check if username already exists
    console.log('Checking if username exists:', username);
    const existingUserByUsername = await storage.getUserByUsername(username);
    if (existingUserByUsername) {
      console.log('Username already exists');
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    console.log('Checking if email exists:', email);
    const existingUserByEmail = await storage.getUserByEmail(email);
    if (existingUserByEmail) {
      console.log('Email already exists');
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    console.log('Hashing password');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with admin role
    console.log('Creating admin user with username:', username);
    try {
      const user = await storage.createUser({
        username,
        fullName,
        email,
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('Admin user created successfully with ID:', user.id);

      // Create school associated with this admin
      console.log('Creating school for admin ID:', user.id);
      try {
        const schoolData = await storage.createSchool({
          name: school.name,
          address: school.address || '',
          city: school.city || '',
          state: school.state || '',
          zipCode: school.zipCode || '',
          contactPerson: school.contactPerson || fullName,
          contactEmail: school.contactEmail || email,
          contactPhone: school.contactPhone || '',
          adminId: user.id
        });
        
        console.log('School created successfully with ID:', schoolData.id);
        
        // Return user and school data without sensitive information
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
          message: 'Admin and school registered successfully',
          user: userWithoutPassword,
          school: schoolData
        });
      } catch (schoolError) {
        console.error('Error creating school:', schoolError);
        throw new Error(`School creation failed: ${schoolError.message}`);
      }
    } catch (userError) {
      console.error('Error creating user:', userError);
      throw new Error(`User creation failed: ${userError.message}`);
    }
  } catch (error) {
    console.error('Error in admin register API:', error);
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    });
  }
}