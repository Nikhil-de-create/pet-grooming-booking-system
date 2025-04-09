import { 
  User, InsertUser, 
  Service, InsertService,
  Appointment, InsertAppointment,
  Business, InsertBusiness,
  Staff, InsertStaff,
  Plan, InsertPlan,
  Subscription, InsertSubscription
} from "@shared/schema";

export interface IStorage {
  // Business operations
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessBySlug(slug: string): Promise<Business | undefined>;
  getBusinesses(): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<Business>): Promise<Business | undefined>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByBusiness(businessId: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServices(businessId?: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  
  // Staff operations
  getStaff(id: number): Promise<Staff | undefined>;
  getStaffByBusiness(businessId: number): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<Staff>): Promise<Staff | undefined>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointments(businessId?: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Plan operations
  getPlan(id: number): Promise<Plan | undefined>;
  getPlans(): Promise<Plan[]>;
  createPlan(plan: InsertPlan): Promise<Plan>;

  // Subscription operations
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByBusiness(businessId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription | undefined>;
}

export class MemStorage implements IStorage {
  private businesses: Map<number, Business>;
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private staff: Map<number, Staff>;
  private appointments: Map<number, Appointment>;
  private plans: Map<number, Plan>;
  private subscriptions: Map<number, Subscription>;
  
  private businessId: number;
  private userId: number;
  private serviceId: number;
  private staffId: number;
  private appointmentId: number;
  private planId: number;
  private subscriptionId: number;

  constructor() {
    this.businesses = new Map();
    this.users = new Map();
    this.services = new Map();
    this.staff = new Map();
    this.appointments = new Map();
    this.plans = new Map();
    this.subscriptions = new Map();
    
    this.businessId = 1;
    this.userId = 1;
    this.serviceId = 1;
    this.staffId = 1;
    this.appointmentId = 1;
    this.planId = 1;
    this.subscriptionId = 1;

    // Initialize default data
    this.initializeDefaultData();
  }

  // Create a separate method to initialize default data
  private async initializeDefaultData() {
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
      
      for (const staff of defaultStaff) {
        await this.createStaff(staff);
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
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  // Business methods
  async getBusiness(id: number): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find(
      (business) => business.slug === slug
    );
  }

  async getBusinesses(): Promise<Business[]> {
    return Array.from(this.businesses.values());
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = this.businessId++;
    const business: Business = {
      ...insertBusiness,
      id,
      active: insertBusiness.active ?? true,
      createdAt: new Date(),
      colors: insertBusiness.colors ?? JSON.stringify({primary: "#4f46e5", secondary: "#f97316"}),
      settings: insertBusiness.settings ?? JSON.stringify({}),
      timezone: insertBusiness.timezone ?? "UTC",
      // Ensure all nullable fields have a default value
      description: insertBusiness.description ?? null,
      logoUrl: insertBusiness.logoUrl ?? null,
      address: insertBusiness.address ?? null,
      city: insertBusiness.city ?? null,
      state: insertBusiness.state ?? null,
      zipCode: insertBusiness.zipCode ?? null,
      phone: insertBusiness.phone ?? null,
      email: insertBusiness.email ?? null,
      website: insertBusiness.website ?? null
    };
    this.businesses.set(id, business);
    return business;
  }

  async updateBusiness(id: number, businessUpdate: Partial<Business>): Promise<Business | undefined> {
    const business = this.businesses.get(id);
    
    if (!business) {
      return undefined;
    }
    
    const updatedBusiness = { ...business, ...businessUpdate };
    this.businesses.set(id, updatedBusiness);
    
    return updatedBusiness;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUsersByBusiness(businessId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.businessId === businessId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Ensure isAdmin is always a boolean, defaulting to false if undefined
    const isAdmin = insertUser.isAdmin ?? false;
    const isSuperAdmin = insertUser.isSuperAdmin ?? false;
    
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      isAdmin,
      isSuperAdmin,
      createdAt: new Date(),
      lastLogin: null,
      // Handle nullable values
      businessId: insertUser.businessId ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServices(businessId?: number): Promise<Service[]> {
    if (businessId) {
      return Array.from(this.services.values()).filter(
        (service) => service.businessId === businessId
      );
    }
    return Array.from(this.services.values());
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceId++;
    const service: Service = { 
      ...insertService, 
      id,
      active: insertService.active ?? true,
      createdAt: new Date()
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceUpdate: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    
    if (!service) {
      return undefined;
    }
    
    const updatedService = { ...service, ...serviceUpdate };
    this.services.set(id, updatedService);
    
    return updatedService;
  }

  // Staff methods
  async getStaff(id: number): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getStaffByBusiness(businessId: number): Promise<Staff[]> {
    return Array.from(this.staff.values()).filter(
      (staff) => staff.businessId === businessId
    );
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.staffId++;
    const staff: Staff = { 
      id,
      name: insertStaff.name,
      businessId: insertStaff.businessId,
      active: insertStaff.active ?? true,
      createdAt: new Date(),
      // Set default values for nullable fields
      phone: insertStaff.phone ?? null,
      email: insertStaff.email ?? null,
      title: insertStaff.title ?? null,
      bio: insertStaff.bio ?? null,
      imageUrl: insertStaff.imageUrl ?? null
    };
    this.staff.set(id, staff);
    return staff;
  }

  async updateStaff(id: number, staffUpdate: Partial<Staff>): Promise<Staff | undefined> {
    const staff = this.staff.get(id);
    
    if (!staff) {
      return undefined;
    }
    
    const updatedStaff = { ...staff, ...staffUpdate };
    this.staff.set(id, updatedStaff);
    
    return updatedStaff;
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointments(businessId?: number): Promise<Appointment[]> {
    if (businessId) {
      return Array.from(this.appointments.values()).filter(
        (appointment) => appointment.businessId === businessId
      );
    }
    return Array.from(this.appointments.values());
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    
    // Set default values for nullable or optional fields
    const status = insertAppointment.status || 'pending';
    const petNotes = insertAppointment.petNotes === undefined ? null : insertAppointment.petNotes;
    const staffId = insertAppointment.staffId === undefined ? null : insertAppointment.staffId;
    const notes = insertAppointment.notes === undefined ? null : insertAppointment.notes;
    
    const appointment: Appointment = { 
      ...insertAppointment,
      id, 
      status,
      petNotes,
      staffId,
      notes,
      createdAt: new Date(),
      updatedAt: null
    };
    
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    
    if (!appointment) {
      return undefined;
    }
    
    const updatedAppointment = { 
      ...appointment, 
      status,
      updatedAt: new Date()
    };
    this.appointments.set(id, updatedAppointment);
    
    return updatedAppointment;
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    
    if (!appointment) {
      return undefined;
    }
    
    const updatedAppointment = { 
      ...appointment, 
      ...appointmentUpdate,
      updatedAt: new Date()
    };
    this.appointments.set(id, updatedAppointment);
    
    return updatedAppointment;
  }

  // Plan methods
  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const id = this.planId++;
    const plan: Plan = { 
      id,
      name: insertPlan.name,
      description: insertPlan.description,
      price: insertPlan.price,
      interval: insertPlan.interval || 'month', // Use OR operator to ensure string type
      createdAt: new Date(),
      // Handle nullable fields
      features: insertPlan.features ?? null,
      maxStaff: insertPlan.maxStaff ?? null,
      maxServices: insertPlan.maxServices ?? null
    };
    this.plans.set(id, plan);
    return plan;
  }

  // Subscription methods
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionByBusiness(businessId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (subscription) => subscription.businessId === businessId && subscription.status === 'active'
    );
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const subscription: Subscription = { 
      id,
      businessId: insertSubscription.businessId,
      planId: insertSubscription.planId,
      status: insertSubscription.status || 'active', // Use OR operator to ensure string type
      startDate: insertSubscription.startDate || new Date(), // Use OR operator to ensure Date type
      createdAt: new Date(),
      // Handle nullable fields
      endDate: insertSubscription.endDate ?? null,
      externalId: insertSubscription.externalId ?? null
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, subscriptionUpdate: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    
    if (!subscription) {
      return undefined;
    }
    
    const updatedSubscription = { ...subscription, ...subscriptionUpdate };
    this.subscriptions.set(id, updatedSubscription);
    
    return updatedSubscription;
  }
}

export const storage = new MemStorage();
