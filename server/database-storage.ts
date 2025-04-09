import { 
  User, InsertUser, 
  Service, InsertService,
  Appointment, InsertAppointment,
  Business, InsertBusiness,
  Staff, InsertStaff,
  Plan, InsertPlan,
  Subscription, InsertSubscription,
  users, services, appointments, businesses, staff, plans, subscriptions,
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, and, desc, isNull } from "drizzle-orm";
import { IStorage } from "./storage";
import { sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // Business operations
  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }

  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug));
    return business;
  }

  async getBusinesses(): Promise<Business[]> {
    return db.select().from(businesses);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async updateBusiness(id: number, business: Partial<Business>): Promise<Business | undefined> {
    const [updatedBusiness] = await db
      .update(businesses)
      .set(business)
      .where(eq(businesses.id, id))
      .returning();
    return updatedBusiness;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsersByBusiness(businessId: number): Promise<User[]> {
    return db.select().from(users).where(eq(users.businessId, businessId));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServices(businessId?: number): Promise<Service[]> {
    if (businessId) {
      return db.select().from(services).where(eq(services.businessId, businessId));
    }
    return db.select().from(services);
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  // Staff operations
  async getStaff(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember;
  }

  async getStaffByBusiness(businessId: number): Promise<Staff[]> {
    return db.select().from(staff).where(eq(staff.businessId, businessId));
  }

  async createStaff(staffMember: InsertStaff): Promise<Staff> {
    const [newStaffMember] = await db.insert(staff).values(staffMember).returning();
    return newStaffMember;
  }

  async updateStaff(id: number, staffMember: Partial<Staff>): Promise<Staff | undefined> {
    const [updatedStaffMember] = await db
      .update(staff)
      .set(staffMember)
      .where(eq(staff.id, id))
      .returning();
    return updatedStaffMember;
  }

  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async getAppointments(businessId?: number): Promise<Appointment[]> {
    if (businessId) {
      return db.select().from(appointments).where(eq(appointments.businessId, businessId));
    }
    return db.select().from(appointments);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  // Plan operations
  async getPlan(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async getPlans(): Promise<Plan[]> {
    return db.select().from(plans);
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [newPlan] = await db.insert(plans).values(plan).returning();
    return newPlan;
  }

  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async getSubscriptionByBusiness(businessId: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions)
      .where(eq(subscriptions.businessId, businessId));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(subscription)
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  // Helper method to add default data if database is empty
  async initializeDefaultData() {
    // Check if we already have businesses
    const existingBusinesses = await this.getBusinesses();
    if (existingBusinesses.length > 0) {
      console.log("Database already has data, skipping initialization");
      return;
    }

    try {
      // Create basic plan
      const basicPlan = {
        name: "Basic Plan",
        description: "Perfect for small pet grooming businesses",
        price: 1999, // $19.99
        interval: "month",
        features: JSON.stringify([
          "Up to 1 staff member",
          "Up to 5 services",
          "Booking management",
          "Email notifications"
        ]),
        maxStaff: 1,
        maxServices: 5
      };
      const basicPlanRecord = await this.createPlan(basicPlan);

      // Create professional plan
      const proPlan = {
        name: "Professional Plan",
        description: "Ideal for growing pet grooming salons",
        price: 4999, // $49.99
        interval: "month",
        features: JSON.stringify([
          "Up to 5 staff members",
          "Up to 15 services",
          "Booking management",
          "Email notifications",
          "SMS reminders",
          "Custom branding"
        ]),
        maxStaff: 5,
        maxServices: 15
      };
      const proPlanRecord = await this.createPlan(proPlan);

      // Create a default business
      const businessData = {
        name: "Pet Grooming Salon",
        slug: "pet-grooming-salon",
        description: "Your friendly neighborhood pet grooming service",
        logoUrl: null,
        address: "123 Main Street",
        city: "Anytown",
        state: "CA",
        zipCode: "12345",
        phone: "555-123-4567",
        email: "contact@petgroomingsalon.com",
        website: "http://petgroomingsalon.com",
        active: true,
        colors: JSON.stringify({primary: "#4f46e5", secondary: "#f97316"}),
        settings: JSON.stringify({}),
        timezone: "America/New_York"
      };
      const business = await this.createBusiness(businessData);

      // Create subscription for the business
      const subscriptionData = {
        businessId: business.id,
        planId: proPlanRecord.id,
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        externalId: null
      };
      await this.createSubscription(subscriptionData);

      // Add admin user for the business
      const userData = {
        businessId: business.id,
        username: "admin@example.com",
        password: "password",
        isAdmin: true,
        isSuperAdmin: true,
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        phone: null
      };
      await this.createUser(userData);

      // Add default staff for the business
      const defaultStaff = [
        {
          businessId: business.id,
          name: "Jane Smith",
          title: "Lead Groomer",
          email: "jane@petgroomingsalon.com",
          phone: "555-987-6543",
          bio: "Over 5 years of experience with all breeds",
          imageUrl: null,
          active: true
        },
        {
          businessId: business.id,
          name: "Mike Johnson",
          title: "Senior Groomer",
          email: "mike@petgroomingsalon.com",
          phone: "555-876-5432",
          bio: "Specialized in handling nervous and anxious pets",
          imageUrl: null,
          active: true
        },
        {
          businessId: business.id,
          name: "Sarah Williams",
          title: "Groomer",
          email: "sarah@petgroomingsalon.com",
          phone: "555-765-4321",
          bio: "Expert in creative styling and show cuts",
          imageUrl: null,
          active: true
        },
        {
          businessId: business.id,
          name: "Carlos Rodriguez",
          title: "Junior Groomer",
          email: "carlos@petgroomingsalon.com",
          phone: "555-654-3210",
          bio: "New talent with great attention to detail",
          imageUrl: null,
          active: true
        }
      ];
      
      for (const staffMember of defaultStaff) {
        await this.createStaff(staffMember);
      }

      // Add default services for the business
      const defaultServices = [
        {
          businessId: business.id,
          name: "Basic Bath & Brush",
          description: "Bath, blow dry, brush out, nail trim, ear cleaning",
          price: 45,
          duration: 60,
          icon: "fa-shower",
          active: true
        },
        {
          businessId: business.id,
          name: "Full Grooming",
          description: "Bath, blow dry, haircut, style, nail trim, ear cleaning",
          price: 65,
          duration: 90,
          icon: "fa-cut",
          active: true
        },
        {
          businessId: business.id,
          name: "Deluxe Spa Package",
          description: "Premium shampoo, conditioner, teeth brushing, and pawdicure",
          price: 85,
          duration: 120,
          icon: "fa-spa",
          active: true
        },
        {
          businessId: business.id,
          name: "Nail Trim & Ear Cleaning",
          description: "Quick service for nail trimming and ear cleaning only",
          price: 25,
          duration: 30,
          icon: "fa-paw",
          active: true
        }
      ];

      for (const service of defaultServices) {
        await this.createService(service);
      }

      console.log("Database initialized with default data");
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }
}