import { users, type User, type InsertUser } from "../shared/schema";
import { students, type Student, type InsertStudent } from "../shared/schema";
import { schools, type School, type InsertSchool } from "../shared/schema";
import { discountApplications, type DiscountApplication, type InsertDiscountApplication } from "../shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Student operations
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;
  getStudentByPhone(phone: string): Promise<Student | undefined>;
  getStudentsBySchool(schoolId: number): Promise<Student[]>;
  getStudentsByStatus(status: 'pending' | 'verified' | 'rejected'): Promise<Student[]>;
  createStudent(insertStudent: InsertStudent): Promise<Student>;
  updateStudent(id: number, updateStudent: Partial<InsertStudent>): Promise<Student>;
  
  // School operations
  getSchool(id: number): Promise<School | undefined>;
  getSchoolByName(name: string): Promise<School | undefined>;
  getSchoolByAdminId(adminId: number): Promise<School | undefined>;
  createSchool(insertSchool: InsertSchool): Promise<School>;
  updateSchool(id: number, updateSchool: Partial<InsertSchool>): Promise<School>;
  
  // Discount application operations
  getDiscountApplication(id: number): Promise<DiscountApplication | undefined>;
  getStudentDiscounts(studentId: number): Promise<DiscountApplication[]>;
  createDiscountApplication(insertApplication: InsertDiscountApplication): Promise<DiscountApplication>;
  deactivateDiscountApplication(id: number): Promise<boolean>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Student operations
  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student;
  }

  async getStudentByPhone(phone: string): Promise<Student | undefined> {
    // Normalize phone number by ensuring it starts with +91
    let normalizedPhone = phone;
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+' + normalizedPhone;
    }
    if (!normalizedPhone.startsWith('+91') && normalizedPhone.length > 10) {
      // Extract last 10 digits and add Indian prefix
      const lastTenDigits = normalizedPhone.slice(-10);
      normalizedPhone = '+91' + lastTenDigits;
    }
    
    // Try with the normalized phone first
    let [student] = await db.select().from(students).where(eq(students.phone, normalizedPhone));
    
    if (!student) {
      // If not found, try with the original phone format
      [student] = await db.select().from(students).where(eq(students.phone, phone));
    }
    
    // If still not found and phone has a +91 prefix, try without it
    if (!student && phone.startsWith('+91')) {
      const phoneWithoutPrefix = phone.substring(3);
      [student] = await db.select().from(students).where(eq(students.phone, phoneWithoutPrefix));
    }
    
    // If still not found, try matching the last 10 digits
    if (!student && phone.length >= 10) {
      const lastTenDigits = phone.slice(-10);
      // For now, just check if the phone ends with the last 10 digits
      const matchingStudents = await db
        .select()
        .from(students)
        .where(eq(students.phone, lastTenDigits));
      
      if (matchingStudents.length > 0) {
        student = matchingStudents[0];
      }
    }
    
    return student;
  }

  async getStudentsBySchool(schoolId: number): Promise<Student[]> {
    return db.select().from(students).where(eq(students.schoolId, schoolId));
  }

  async getStudentsByStatus(status: 'pending' | 'verified' | 'rejected'): Promise<Student[]> {
    return db.select().from(students).where(eq(students.status, status));
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async updateStudent(id: number, updateStudent: Partial<InsertStudent>): Promise<Student> {
    const [student] = await db
      .update(students)
      .set(updateStudent)
      .where(eq(students.id, id))
      .returning();
    return student;
  }
  
  // School operations
  async getSchool(id: number): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.id, id));
    return school;
  }

  async getSchoolByName(name: string): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.name, name));
    return school;
  }

  async getSchoolByAdminId(adminId: number): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.adminId, adminId));
    return school;
  }

  async createSchool(insertSchool: InsertSchool): Promise<School> {
    const [school] = await db.insert(schools).values(insertSchool).returning();
    return school;
  }

  async updateSchool(id: number, updateSchool: Partial<InsertSchool>): Promise<School> {
    const [school] = await db
      .update(schools)
      .set(updateSchool)
      .where(eq(schools.id, id))
      .returning();
    return school;
  }
  
  // Discount application operations
  async getDiscountApplication(id: number): Promise<DiscountApplication | undefined> {
    const [application] = await db
      .select()
      .from(discountApplications)
      .where(eq(discountApplications.id, id));
    return application;
  }

  async getStudentDiscounts(studentId: number): Promise<DiscountApplication[]> {
    return db
      .select()
      .from(discountApplications)
      .where(eq(discountApplications.studentId, studentId))
      .orderBy(desc(discountApplications.appliedAt));
  }

  async createDiscountApplication(insertApplication: InsertDiscountApplication): Promise<DiscountApplication> {
    const [application] = await db
      .insert(discountApplications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async deactivateDiscountApplication(id: number): Promise<boolean> {
    const [application] = await db
      .update(discountApplications)
      .set({ isActive: false })
      .where(eq(discountApplications.id, id))
      .returning();
    return !!application;
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();