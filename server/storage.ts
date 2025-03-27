import { 
  User, InsertUser, 
  Service, InsertService,
  Appointment, InsertAppointment
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private appointments: Map<number, Appointment>;
  private userId: number;
  private serviceId: number;
  private appointmentId: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.appointments = new Map();
    this.userId = 1;
    this.serviceId = 1;
    this.appointmentId = 1;

    // Add admin user
    this.createUser({
      username: "admin@example.com",
      password: "password",
      isAdmin: true
    });

    // Add default services
    const defaultServices = [
      {
        name: "Basic Bath & Brush",
        description: "Bath, blow dry, brush out, nail trim, ear cleaning",
        price: 45,
        duration: 60,
        icon: "fa-shower"
      },
      {
        name: "Full Grooming",
        description: "Bath, blow dry, haircut, style, nail trim, ear cleaning",
        price: 65,
        duration: 90,
        icon: "fa-cut"
      },
      {
        name: "Deluxe Spa Package",
        description: "Premium shampoo, conditioner, teeth brushing, and pawdicure",
        price: 85,
        duration: 120,
        icon: "fa-spa"
      },
      {
        name: "Nail Trim & Ear Cleaning",
        description: "Quick service for nail trimming and ear cleaning only",
        price: 25,
        duration: 30,
        icon: "fa-paw"
      }
    ];

    defaultServices.forEach(service => {
      this.createService(service);
    });
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Ensure isAdmin is always a boolean, defaulting to false if undefined
    const isAdmin = insertUser.isAdmin === undefined ? false : insertUser.isAdmin;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin 
    };
    this.users.set(id, user);
    return user;
  }

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    
    // Set default values for nullable or optional fields
    const status = insertAppointment.status || 'pending';
    const petNotes = insertAppointment.petNotes === undefined ? null : insertAppointment.petNotes;
    
    const appointment: Appointment = { 
      ...insertAppointment,
      id, 
      status,
      petNotes,
      createdAt: new Date() 
    };
    
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    
    if (!appointment) {
      return undefined;
    }
    
    const updatedAppointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    
    return updatedAppointment;
  }
}

export const storage = new MemStorage();
