import { storage } from '../server/storage';

// Helper function to get a user from the database by email
export const getUserByEmail = async (email) => {
  try {
    return await storage.getUserByEmail(email);
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

// Helper function to get a user from the database by id
export const getUserById = async (id) => {
  try {
    return await storage.getUser(id);
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
};

// Helper function to get a student from the database by user id
export const getStudentByUserId = async (userId) => {
  try {
    return await storage.getStudentByUserId(userId);
  } catch (error) {
    console.error('Error getting student by user id:', error);
    return null;
  }
};

// Helper function to get a student from the database by phone
export const getStudentByPhone = async (phone) => {
  try {
    // Make sure the phone number is properly formatted with country code
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`;
    }
    console.log('Searching for student with formatted phone:', formattedPhone);
    return await storage.getStudentByPhone(formattedPhone);
  } catch (error) {
    console.error('Error getting student by phone:', error);
    return null;
  }
};

// Helper function to get all students with a specific status
export const getStudentsByStatus = async (status) => {
  try {
    return await storage.getStudentsByStatus(status);
  } catch (error) {
    console.error('Error getting students by status:', error);
    return [];
  }
};

// Helper function to create a new student in the database
export const createStudent = async (studentData) => {
  try {
    return await storage.createStudent(studentData);
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Helper function to update a student in the database
export const updateStudent = async (id, updatedData) => {
  try {
    return await storage.updateStudent(id, updatedData);
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

// Helper function to create a new discount application
export const createDiscountApplication = async (applicationData) => {
  try {
    return await storage.createDiscountApplication(applicationData);
  } catch (error) {
    console.error('Error creating discount application:', error);
    throw error;
  }
};

// Helper function to get all discount applications for a student
export const getStudentDiscounts = async (studentId) => {
  try {
    return await storage.getStudentDiscounts(studentId);
  } catch (error) {
    console.error('Error getting student discounts:', error);
    return [];
  }
};