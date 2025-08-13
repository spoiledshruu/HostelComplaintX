import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);
export const complaintStatusEnum = pgEnum("complaint_status", ["pending", "inprogress", "resolved"]);
export const complaintCategoryEnum = pgEnum("complaint_category", [
  "maintenance", 
  "food", 
  "cleanliness", 
  "security", 
  "wifi", 
  "other"
]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  roomNumber: text("room_number"),
  collegeEmail: text("college_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complaints = pgTable("complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: complaintCategoryEnum("category").notNull(),
  roomNumber: text("room_number").notNull(),
  status: complaintStatusEnum("status").notNull().default("pending"),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  complaints: many(complaints),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  student: one(users, {
    fields: [complaints.studentId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  collegeEmail: z.string().email("Please enter a valid college email").refine(
    (email) => email.endsWith("@college.edu") || email.endsWith("@university.edu") || email.endsWith("@edu"),
    "Please use your college email address"
  ),
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  studentId: true,
  status: true,
  adminResponse: true,
  createdAt: true,
  updatedAt: true,
});

export const updateComplaintSchema = createInsertSchema(complaints).pick({
  status: true,
  adminResponse: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type UpdateComplaint = z.infer<typeof updateComplaintSchema>;

// Extended types for API responses
export type ComplaintWithStudent = Complaint & {
  student: Pick<User, 'id' | 'name' | 'username' | 'roomNumber'>;
};
