import { storage } from '../../../server/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id, selfieUrl, ...otherUpdateFields } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Get current student record
    const existingStudent = await storage.getStudent(id);
    
    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update student record
    const updateData = {
      ...otherUpdateFields
    };
    
    // Only update selfieUrl if provided
    if (selfieUrl) {
      updateData.selfieUrl = selfieUrl;
    }
    
    const updatedStudent = await storage.updateStudent(id, updateData);
    
    res.status(200).json({ 
      student: updatedStudent,
      message: 'Student updated successfully' 
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ 
      message: 'Server error during update', 
      error: error.message 
    });
  }
}