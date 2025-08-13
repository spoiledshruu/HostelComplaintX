import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { insertComplaintSchema, updateComplaintSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Middleware to check if user is admin
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Student complaint routes
  app.post("/api/complaints", requireAuth, async (req: any, res, next) => {
    try {
      if (req.user?.role !== 'student') {
        return res.status(403).json({ message: "Only students can submit complaints" });
      }

      const validatedData = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint({
        ...validatedData,
        studentId: req.user.id,
      });

      res.status(201).json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/complaints/my", requireAuth, async (req: any, res, next) => {
    try {
      if (req.user?.role !== 'student') {
        return res.status(403).json({ message: "Only students can view their complaints" });
      }

      const complaints = await storage.getComplaintsByStudent(req.user.id);
      res.json(complaints);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/complaints/stats/my", requireAuth, async (req: any, res, next) => {
    try {
      if (req.user?.role !== 'student') {
        return res.status(403).json({ message: "Only students can view their stats" });
      }

      const stats = await storage.getStudentComplaintStats(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Admin complaint routes
  app.get("/api/complaints", requireAdmin, async (req: any, res, next) => {
    try {
      const { status, category, search } = req.query;
      const filters = {
        status: status as string,
        category: category as string,
        search: search as string,
      };

      const complaints = await storage.getAllComplaints(filters);
      res.json(complaints);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/complaints/stats", requireAdmin, async (req: any, res, next) => {
    try {
      const stats = await storage.getComplaintStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/complaints/:id", requireAdmin, async (req: any, res, next) => {
    try {
      const complaint = await storage.getComplaintById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      res.json(complaint);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/complaints/:id", requireAdmin, async (req: any, res, next) => {
    try {
      const validatedData = updateComplaintSchema.parse(req.body);
      const complaint = await storage.updateComplaintStatus(req.params.id, validatedData);
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      res.json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      next(error);
    }
  });

  // User management routes (Admin only)
  app.get("/api/users", requireAdmin, async (req: any, res, next) => {
    try {
      const { role, search } = req.query;
      const users = await storage.getAllUsers({ role: role as string, search: search as string });
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users", requireAdmin, async (req: any, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...validatedData,
        password: await hashPassword(validatedData.password),
      });

      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req: any, res, next) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
