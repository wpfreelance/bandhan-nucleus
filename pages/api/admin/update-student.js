import { storage } from '../../../server/storage';

export default async function handler(req, res) {
  // Only allow PUT method
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { 
      id,
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
      status
    } = req.body;
    
    // Validate required fields
    if (!id || !firstName || !lastName || !phone) {
      return res.status(400).json({ message: 'Student ID, first name, last name, and phone number are required' });
    }
    
    console.log('Updating student with ID:', id);
    
    // Get the existing student to verify it exists
    const existingStudent = await storage.getStudent(Number(id));
    
    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Create the update object, omitting dateOfBirth initially
    const updateData = {
      firstName,
      lastName,
      fatherName,
      class: className,
      section,
      rollNumber,
      gender,
      address,
      email,
      phone,
      status
    };
    
    // Only add dateOfBirth if it's provided and valid
    if (dateOfBirth) {
      try {
        // Check if it's a valid date
        const date = new Date(dateOfBirth);
        if (!isNaN(date.getTime())) {
          // Valid date, add it to the update
          updateData.dateOfBirth = date;
        }
      } catch (e) {
        console.error('Invalid date format, skipping date update:', e);
        // Don't include dateOfBirth in the update if it's invalid
      }
    } else {
      // If dateOfBirth is null or empty, explicitly set it to null
      updateData.dateOfBirth = null;
    }

    console.log('Update data:', updateData);
    
    // Update the student record
    const updatedStudent = await storage.updateStudent(Number(id), updateData);
    
    console.log('Student updated successfully:', updatedStudent);
    
    return res.status(200).json({ 
      message: 'Student updated successfully', 
      student: updatedStudent 
    });
    
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ 
      message: 'An error occurred while updating the student',
      error: error.message
    });
  }
}