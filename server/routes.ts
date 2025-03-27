import type { Express, Request, Response, NextFunction } from "express";
// Import TypeScript declaration augmentation for express-session
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Error fetching services" });
    }
  });

  // Book appointment
  app.post("/api/book-appointment", async (req: Request, res: Response) => {
    try {
      const appointmentData = req.body;
      
      // Validate appointment data
      const result = insertAppointmentSchema.safeParse(appointmentData);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Create appointment
      const appointment = await storage.createAppointment(result.data);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Error creating appointment" });
    }
  });

  // Get all appointments
  app.get("/api/appointments", async (req: Request, res: Response) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  // Update appointment status
  app.patch("/api/appointments/:id/status", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !["pending", "approved", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const appointment = await storage.updateAppointmentStatus(Number(id), status);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Error updating appointment status" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password || !user.isAdmin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create admin session
      if (!req.session) {
        return res.status(500).json({ message: "Session not available" });
      }
      
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      
      res.json({ 
        success: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err: Error | null) => {
        if (err) {
          res.status(500).json({ message: "Failed to logout" });
        } else {
          res.json({ success: true });
        }
      });
    } else {
      res.json({ success: true });
    }
  });

  // Admin check
  app.get("/api/admin/check", (req: Request, res: Response) => {
    if (req.session && req.session.isAdmin) {
      res.json({ isAdmin: true });
    } else {
      res.status(401).json({ isAdmin: false });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
