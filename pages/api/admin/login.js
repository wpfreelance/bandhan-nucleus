import { storage } from '../../../server/storage';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  console.log('Admin login API called');
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    // Validate required fields
    if (!username || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user by username
    console.log('Finding user with username:', username);
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found:', { id: user.id, username: user.username, role: user.role });

    // Check if user is an admin
    if (user.role !== 'admin') {
      console.log('User is not an admin, role:', user.role);
      return res.status(403).json({ message: 'Access denied. Not an admin account.' });
    }

    // Compare password
    console.log('Comparing passwords');
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password match successful');

    // Return user data without the password
    const { password: _, ...userWithoutPassword } = user;
    console.log('User data being returned:', userWithoutPassword);

    // Create session (in a real app, you'd do this through a proper session mechanism)
    // For now, just return the user data for the client to store
    console.log('Login successful, returning user data');
    
    res.status(200).json({
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error in admin login API:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: error.message
    });
  }
}