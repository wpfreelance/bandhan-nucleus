// API endpoint for applying student discount
import { applyStudentDiscount } from '../../utils/woocommerce';
import { storage } from '../../server/storage';
import { getStudentByPhone, createDiscountApplication } from '../../utils/db-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { studentId, phone, serviceId } = req.body;
    
    if (!studentId || !phone) {
      return res.status(400).json({ message: 'Student ID and phone number are required' });
    }
    
    // Parse student ID to integer
    const parsedStudentId = parseInt(studentId, 10);
    
    if (isNaN(parsedStudentId)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    // Get student from the database
    const student = await storage.getStudent(parsedStudentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Verify student is eligible for discount
    if (student.status !== 'verified' || !student.selfieUrl) {
      return res.status(400).json({ 
        message: 'Student must be verified and have a selfie uploaded to receive a discount'
      });
    }
    
    // Check if phone number matches
    if (student.phone !== phone) {
      return res.status(400).json({ 
        message: 'Phone number does not match student record'
      });
    }
    
    // Create a record of this discount application
    const discountApplication = await createDiscountApplication({
      studentId: parsedStudentId,
      serviceId: serviceId || 'general_discount',
      appliedAt: new Date(),
      // Set expiry date to 30 days from now
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    });
    
    // In a real implementation, you would call the WooCommerce API here to create a coupon
    // For now, we'll simulate the response but track the application in our database
    
    // Return success response
    const discountResult = {
      success: true,
      discountId: discountApplication.id,
      studentId: parsedStudentId,
      phone,
      serviceId: serviceId || 'general_discount',
      discountPercentage: 30,
      expiresAt: discountApplication.expiresAt,
      message: 'Discount successfully applied'
    };
    
    return res.status(200).json(discountResult);
  } catch (error) {
    console.error('Error applying discount:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
