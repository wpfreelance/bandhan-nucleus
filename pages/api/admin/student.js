import { storage } from '../../../server/storage';

export default async function handler(req, res) {
  // Only allow GET method
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const student = await storage.getStudent(Number(id));
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    return res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({ 
      message: 'An error occurred while fetching the student',
      error: error.message
    });
  }
}