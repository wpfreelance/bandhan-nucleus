import { pgTable, serial, varchar, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Create enums for student status and user roles
export const statusEnum = pgEnum('status', ['pending', 'verified', 'rejected']);
export const roleEnum = pgEnum('role', ['admin', 'student']);

// Users table for authentication
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique(),
  fullName: varchar('full_name', { length: 256 }),
  email: varchar('email', { length: 256 }).unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  password: varchar('password', { length: 256 }),
  role: roleEnum('role').notNull().default('student'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Schools table
export const schools = pgTable('schools', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  zipCode: varchar('zip_code', { length: 20 }),
  contactPerson: varchar('contact_person', { length: 256 }),
  contactEmail: varchar('contact_email', { length: 256 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  adminId: serial('admin_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Students table
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  schoolId: serial('school_id').references(() => schools.id),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  fatherName: varchar('father_name', { length: 200 }),
  class: varchar('class', { length: 20 }),
  section: varchar('section', { length: 10 }),
  rollNumber: varchar('roll_number', { length: 20 }),
  gender: varchar('gender', { length: 10 }),
  dateOfBirth: timestamp('date_of_birth'),
  address: text('address'),
  email: varchar('email', { length: 256 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  selfieUrl: text('selfie_url'),
  status: statusEnum('status').default('pending'),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: serial('verified_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Discount applications table
export const discountApplications = pgTable('discount_applications', {
  id: serial('id').primaryKey(),
  studentId: serial('student_id').references(() => students.id),
  serviceId: varchar('service_id', { length: 256 }).notNull(), // WooCommerce product ID
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),
});

// Define relationships between tables
export const userRelations = relations(users, ({ one, many }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  school: one(schools, {
    fields: [users.id],
    references: [schools.adminId],
  }),
}));

export const schoolRelations = relations(schools, ({ many, one }) => ({
  students: many(students),
  admin: one(users, {
    fields: [schools.adminId],
    references: [users.id],
  }),
}));

export const studentRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [students.schoolId],
    references: [schools.id],
  }),
  verifier: one(users, {
    fields: [students.verifiedBy],
    references: [users.id],
  }),
  discountApplications: many(discountApplications),
}));

export const discountApplicationRelations = relations(discountApplications, ({ one }) => ({
  student: one(students, {
    fields: [discountApplications.studentId],
    references: [students.id],
  }),
}));

// Type definitions for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

export type DiscountApplication = typeof discountApplications.$inferSelect;
export type InsertDiscountApplication = typeof discountApplications.$inferInsert;