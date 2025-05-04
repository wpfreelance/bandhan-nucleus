import { storage } from '../../../server/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { phone } = req.query;
      
      if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      
      const student = await storage.getStudentByPhone(phone);
      
      if (!student) {
        return res.status(404).json({ 
          message: 'Student not found', 
          error: 'USER_PHONE_NOT_FOUND' 
        });
      }
      
      res.status(200).json({ student });
    } catch (error) {
      console.error('Error fetching student data:', error);
      res.status(500).json({ 
        message: 'Server error when fetching student', 
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}