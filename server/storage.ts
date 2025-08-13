import { users, complaints, type User, type InsertUser, type Complaint, type InsertComplaint, type UpdateComplaint, type ComplaintWithStudent } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(filters?: { role?: string; search?: string }): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;
  
  // Complaint operations
  createComplaint(complaint: InsertComplaint & { studentId: string }): Promise<Complaint>;
  getComplaintsByStudent(studentId: string): Promise<Complaint[]>;
  getAllComplaints(filters?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ComplaintWithStudent[]>;
  getComplaintById(id: string): Promise<ComplaintWithStudent | undefined>;
  updateComplaintStatus(id: string, update: UpdateComplaint): Promise<Complaint | undefined>;
  getComplaintStats(): Promise<{
    total: number;
    pending: number;
    inprogress: number;
    resolved: number;
  }>;
  getStudentComplaintStats(studentId: string): Promise<{
    total: number;
    pending: number;
    resolved: number;
  }>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(filters?: { role?: string; search?: string }): Promise<User[]> {
    let query = db.select().from(users);
    
    const conditions = [];
    
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role as any));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(users.name, `%${filters.search}%`),
          ilike(users.username, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async createComplaint(complaint: InsertComplaint & { studentId: string }): Promise<Complaint> {
    const [newComplaint] = await db
      .insert(complaints)
      .values({
        ...complaint,
        updatedAt: new Date(),
      })
      .returning();
    return newComplaint;
  }

  async getComplaintsByStudent(studentId: string): Promise<Complaint[]> {
    return await db
      .select()
      .from(complaints)
      .where(eq(complaints.studentId, studentId))
      .orderBy(desc(complaints.createdAt));
  }

  async getAllComplaints(filters?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ComplaintWithStudent[]> {
    let query = db
      .select({
        id: complaints.id,
        studentId: complaints.studentId,
        subject: complaints.subject,
        description: complaints.description,
        category: complaints.category,
        roomNumber: complaints.roomNumber,
        status: complaints.status,
        adminResponse: complaints.adminResponse,
        createdAt: complaints.createdAt,
        updatedAt: complaints.updatedAt,
        student: {
          id: users.id,
          name: users.name,
          username: users.username,
          roomNumber: users.roomNumber,
        },
      })
      .from(complaints)
      .leftJoin(users, eq(complaints.studentId, users.id));

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(complaints.status, filters.status as any));
    }

    if (filters?.category) {
      conditions.push(eq(complaints.category, filters.category as any));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(complaints.subject, `%${filters.search}%`),
          ilike(complaints.description, `%${filters.search}%`),
          ilike(users.name, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.orderBy(desc(complaints.createdAt));
    
    return results.map(row => ({
      ...row,
      student: row.student!,
    })) as ComplaintWithStudent[];
  }

  async getComplaintById(id: string): Promise<ComplaintWithStudent | undefined> {
    const [result] = await db
      .select({
        id: complaints.id,
        studentId: complaints.studentId,
        subject: complaints.subject,
        description: complaints.description,
        category: complaints.category,
        roomNumber: complaints.roomNumber,
        status: complaints.status,
        adminResponse: complaints.adminResponse,
        createdAt: complaints.createdAt,
        updatedAt: complaints.updatedAt,
        student: {
          id: users.id,
          name: users.name,
          username: users.username,
          roomNumber: users.roomNumber,
        },
      })
      .from(complaints)
      .leftJoin(users, eq(complaints.studentId, users.id))
      .where(eq(complaints.id, id));

    if (!result) return undefined;

    return {
      ...result,
      student: result.student!,
    } as ComplaintWithStudent;
  }

  async updateComplaintStatus(id: string, update: UpdateComplaint): Promise<Complaint | undefined> {
    const [updatedComplaint] = await db
      .update(complaints)
      .set({
        ...update,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, id))
      .returning();
    return updatedComplaint || undefined;
  }

  async getComplaintStats(): Promise<{
    total: number;
    pending: number;
    inprogress: number;
    resolved: number;
  }> {
    const allComplaints = await db.select().from(complaints);
    
    return {
      total: allComplaints.length,
      pending: allComplaints.filter(c => c.status === 'pending').length,
      inprogress: allComplaints.filter(c => c.status === 'inprogress').length,
      resolved: allComplaints.filter(c => c.status === 'resolved').length,
    };
  }

  async getStudentComplaintStats(studentId: string): Promise<{
    total: number;
    pending: number;
    resolved: number;
  }> {
    const studentComplaints = await db
      .select()
      .from(complaints)
      .where(eq(complaints.studentId, studentId));
    
    return {
      total: studentComplaints.length,
      pending: studentComplaints.filter(c => c.status === 'pending').length,
      resolved: studentComplaints.filter(c => c.status === 'resolved').length,
    };
  }
}

export const storage = new DatabaseStorage();
