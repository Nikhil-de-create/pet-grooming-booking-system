import type { Express, Request, Response, NextFunction } from "express";
// Import TypeScript declaration augmentation for express-session
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { 
  insertAppointmentSchema, 
  insertBusinessSchema, 
  insertServiceSchema,
  insertStaffSchema,
  insertSubscriptionSchema,
  insertUserSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Helper function to safely get authenticated user
const getAuthenticatedUser = async (req: Request): Promise<{ user: any, userId: number } | null> => {
  if (!req.session || !req.session.userId) {
    return null;
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return null;
    }
    return { user, userId: req.session.userId };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};

// Middleware to check if user is super admin
const isSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    const user = await storage.getUser(req.session.userId);
    if (user && user.isSuperAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden - Super Admin access required" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Middleware to get business ID from slug or param
const getBusinessId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let businessId: number | undefined;
    
    // First check if we have a business ID in the session
    if (req.session && req.session.businessId) {
      businessId = req.session.businessId;
    } 
    // Then check if there's a slug in the URL or params
    else if (req.params.businessSlug) {
      const business = await storage.getBusinessBySlug(req.params.businessSlug);
      if (business) {
        businessId = business.id;
      }
    } 
    // If we have an authenticated user, get their business ID
    else if (req.session && req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user && user.businessId) {
        businessId = user.businessId;
      }
    }
    
    // Use the default business if no business ID found and we need to be backward compatible
    if (!businessId) {
      const businesses = await storage.getBusinesses();
      if (businesses.length > 0) {
        businessId = businesses[0].id;
      }
    }
    
    if (!businessId) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Attach businessId to request object for use in route handlers
    req.businessId = businessId;
    next();
  } catch (error) {
    console.error("Error in getBusinessId middleware:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== PUBLIC API ROUTES ====================
  
  // Get all businesses
  app.get("/api/businesses", async (req: Request, res: Response) => {
    try {
      const businesses = await storage.getBusinesses();
      // Only expose non-sensitive information
      const safeBusiness = businesses.map(business => {
        const { id, name, slug, description, logoUrl, city, state, phone, email, website, colors } = business;
        return {
          id,
          name,
          slug,
          description,
          logoUrl,
          city,
          state,
          phone,
          email,
          website,
          colors
        };
      });
      res.json(safeBusiness);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Error fetching businesses" });
    }
  });

  // Get business information by slug
  app.get("/api/businesses/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const business = await storage.getBusinessBySlug(slug);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Don't expose sensitive information
      const { id, name, slug: businessSlug, description, logoUrl, city, state, phone, email, website, colors } = business;
      
      res.json({
        id,
        name,
        slug: businessSlug,
        description,
        logoUrl,
        city,
        state,
        phone,
        email,
        website,
        colors
      });
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Error fetching business" });
    }
  });
  
  // Get services for a specific business
  app.get("/api/businesses/:businessSlug/services", getBusinessId, async (req: Request, res: Response) => {
    try {
      // Make sure businessId is defined with a fallback
      if (!req.businessId) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      const services = await storage.getServices(req.businessId);
      
      // Only return active services
      const activeServices = services.filter(service => service.active);
      
      res.json(activeServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Error fetching services" });
    }
  });
  
  // Get staff for a specific business
  app.get("/api/businesses/:businessSlug/staff", getBusinessId, async (req: Request, res: Response) => {
    try {
      // Make sure businessId is defined with a fallback
      if (!req.businessId) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      const staff = await storage.getStaffByBusiness(req.businessId);
      
      // Only return active staff
      const activeStaff = staff.filter(s => s.active);
      
      res.json(activeStaff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Error fetching staff" });
    }
  });
  
  // Get all services (backward compatibility)
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const businesses = await storage.getBusinesses();
      if (businesses.length > 0) {
        const businessId = businesses[0].id;
        const services = await storage.getServices(businessId);
        res.json(services);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Error fetching services" });
    }
  });

  // Book appointment
  app.post("/api/businesses/:businessSlug/book-appointment", getBusinessId, async (req: Request, res: Response) => {
    try {
      // Make sure businessId is defined with a fallback
      if (!req.businessId) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      const appointmentData = {
        ...req.body,
        businessId: req.businessId
      };
      
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
  
  // Book appointment (backward compatibility)
  app.post("/api/book-appointment", async (req: Request, res: Response) => {
    try {
      // Get default business
      const businesses = await storage.getBusinesses();
      if (!businesses.length) {
        return res.status(404).json({ message: "No business found" });
      }
      
      const appointmentData = {
        ...req.body,
        businessId: businesses[0].id
      };
      
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
  
  // ==================== ADMIN API ROUTES ====================
  
  // Get all appointments for the business
  app.get("/api/admin/appointments", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const authResult = await getAuthenticatedUser(req);
      
      if (!authResult || !authResult.user.businessId) {
        return res.status(400).json({ message: "No business associated with this user" });
      }
      
      const appointments = await storage.getAppointments(authResult.user.businessId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });
  
  // Get all appointments (backward compatibility)
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
  app.patch("/api/admin/appointments/:id/status", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !["pending", "approved", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Check if appointment belongs to this business
      const user = await storage.getUser(req.session!.userId);
      const appointment = await storage.getAppointment(Number(id));
      
      if (!user || !user.businessId || !appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      if (appointment.businessId !== user.businessId) {
        return res.status(403).json({ message: "Forbidden - Appointment does not belong to your business" });
      }
      
      const updatedAppointment = await storage.updateAppointmentStatus(Number(id), status);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Error updating appointment status" });
    }
  });
  
  // Update appointment status (backward compatibility)
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
  
  // Business-specific admin routes
  app.get("/api/admin/business", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      
      if (!user || !user.businessId) {
        return res.status(400).json({ message: "No business associated with this user" });
      }
      
      const business = await storage.getBusiness(user.businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Error fetching business" });
    }
  });
  
  app.patch("/api/admin/business", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      
      if (!user || !user.businessId) {
        return res.status(400).json({ message: "No business associated with this user" });
      }
      
      const updatedBusiness = await storage.updateBusiness(user.businessId, req.body);
      
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Error updating business" });
    }
  });
  
  // Admin routes for services
  app.get("/api/admin/services", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      
      if (!user || !user.businessId) {
        return res.status(400).json({ message: "No business associated with this user" });
      }
      
      const services = await storage.getServices(user.businessId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Error fetching services" });
    }
  });
  
  app.post("/api/admin/services", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      
      if (!user || !user.businessId) {
        return res.status(400).json({ message: "No business associated with this user" });
      }
      
      const serviceData = {
        ...req.body,
        businessId: user.businessId
      };
      
      const result = insertServiceSchema.safeParse(serviceData);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Check subscription limits
      const subscription = await storage.getSubscriptionByBusiness(user.businessId);
      const plan = subscription ? await storage.getPlan(subscription.planId) : null;
      const services = await storage.getServices(user.businessId);
      
      if (plan && plan.maxServices !== null && services.length >= plan.maxServices) {
        return res.status(403).json({ 
          message: `You have reached the maximum number of services (${plan.maxServices}) allowed in your current plan. Please upgrade to add more.`
        });
      }
      
      const service = await storage.createService(result.data);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Error creating service" });
    }
  });
  
  app.patch("/api/admin/services/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.session!.userId);
      const service = await storage.getService(Number(id));
      
      if (!user || !user.businessId || !service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      if (service.businessId !== user.businessId) {
        return res.status(403).json({ message: "Forbidden - Service does not belong to your business" });
      }
      
      const updatedService = await storage.updateService(Number(id), req.body);
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Error updating service" });
    }
  });
  
  // Admin routes for staff
  app.get("/api/admin/staff", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      
      if (!user || !user.businessId) {
        return res.status(400).json({ message: "No business associated with this user" });
      }
      
      const staff = await storage.getStaffByBusiness(user.businessId);
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Error fetching staff" });
    }
  });
  
  app.post("/api/admin/staff", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      
      if (!user || !user.businessId) {
        return res.status(400).json({ message: "No business associated with this user" });
      }
      
      const staffData = {
        ...req.body,
        businessId: user.businessId
      };
      
      const result = insertStaffSchema.safeParse(staffData);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Check subscription limits
      const subscription = await storage.getSubscriptionByBusiness(user.businessId);
      const plan = subscription ? await storage.getPlan(subscription.planId) : null;
      const staffMembers = await storage.getStaffByBusiness(user.businessId);
      
      if (plan && plan.maxStaff !== null && staffMembers.length >= plan.maxStaff) {
        return res.status(403).json({ 
          message: `You have reached the maximum number of staff members (${plan.maxStaff}) allowed in your current plan. Please upgrade to add more.`
        });
      }
      
      const staff = await storage.createStaff(result.data);
      res.status(201).json(staff);
    } catch (error) {
      console.error("Error creating staff:", error);
      res.status(500).json({ message: "Error creating staff" });
    }
  });
  
  app.patch("/api/admin/staff/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.session!.userId);
      const staffMember = await storage.getStaff(Number(id));
      
      if (!user || !user.businessId || !staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      if (staffMember.businessId !== user.businessId) {
        return res.status(403).json({ message: "Forbidden - Staff member does not belong to your business" });
      }
      
      const updatedStaff = await storage.updateStaff(Number(id), req.body);
      
      if (!updatedStaff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(updatedStaff);
    } catch (error) {
      console.error("Error updating staff:", error);
      res.status(500).json({ message: "Error updating staff" });
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
      if (user.businessId) {
        req.session.businessId = user.businessId;
      }
      
      // Update last login time
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      res.json({ 
        success: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          businessId: user.businessId,
          firstName: user.firstName,
          lastName: user.lastName
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
  
  // ==================== SUPER ADMIN API ROUTES ====================
  
  // Get all businesses
  app.get("/api/super-admin/businesses", isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
    try {
      const businesses = await storage.getBusinesses();
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Error fetching businesses" });
    }
  });
  
  // Create business
  app.post("/api/super-admin/businesses", isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
    try {
      const result = insertBusinessSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const business = await storage.createBusiness(result.data);
      res.status(201).json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Error creating business" });
    }
  });
  
  // Update business
  app.patch("/api/super-admin/businesses/:id", isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const business = await storage.updateBusiness(Number(id), req.body);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Error updating business" });
    }
  });
  
  // Get all users
  app.get("/api/super-admin/users", isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
    try {
      let users = [];
      
      // If business ID is provided, filter users by business
      if (req.query.businessId) {
        users = await storage.getUsersByBusiness(Number(req.query.businessId));
      } else {
        // Get all users from all businesses
        const businesses = await storage.getBusinesses();
        
        for (const business of businesses) {
          const businessUsers = await storage.getUsersByBusiness(business.id);
          users.push(...businessUsers);
        }
      }
      
      // Don't send passwords to the client
      const safeUsers = users.map(({ password, ...user }) => user);
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  // Create user
  app.post("/api/super-admin/users", isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const user = await storage.createUser(result.data);
      
      // Don't send password to the client
      const { password, ...safeUser } = user;
      
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  // Update user
  app.patch("/api/super-admin/users/:id", isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(Number(id), req.body);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to the client
      const { password, ...safeUser } = user;
      
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });
  
  // Get all subscription plans
  app.get("/api/super-admin/plans", isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Error fetching plans" });
    }
  });
  
  // Get all subscriptions
  app.get("/api/super-admin/subscriptions", isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
    try {
      // This would ideally query the database directly for all subscriptions
      const businesses = await storage.getBusinesses();
      const subscriptions = [];
      
      for (const business of businesses) {
        const subscription = await storage.getSubscriptionByBusiness(business.id);
        if (subscription) {
          subscriptions.push(subscription);
        }
      }
      
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Error fetching subscriptions" });
    }
  });
  
  // Create or update subscription
  app.post("/api/super-admin/subscriptions", isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
    try {
      const result = insertSubscriptionSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Check if business exists
      const business = await storage.getBusiness(result.data.businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Check if plan exists
      const plan = await storage.getPlan(result.data.planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      // Check if subscription already exists
      const existingSubscription = await storage.getSubscriptionByBusiness(result.data.businessId);
      
      if (existingSubscription) {
        // Update existing subscription
        const updatedSubscription = await storage.updateSubscription(existingSubscription.id, result.data);
        res.json(updatedSubscription);
      } else {
        // Create new subscription
        const subscription = await storage.createSubscription(result.data);
        res.status(201).json(subscription);
      }
    } catch (error) {
      console.error("Error managing subscription:", error);
      res.status(500).json({ message: "Error managing subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
