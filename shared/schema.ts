import { pgTable, text, serial, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Business schema for multi-tenant SaaS model
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  colors: text("colors").default('{"primary":"#4f46e5","secondary":"#f97316"}'),
  settings: text("settings").default('{}'),
  timezone: text("timezone").default("UTC"),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

// User schema with business relationship
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isSuperAdmin: boolean("is_super_admin").default(false).notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  businessId: true,
  username: true,
  password: true,
  isAdmin: true,
  isSuperAdmin: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
});

// Services with business relationship
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(),
  icon: text("icon").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

// Staff members
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  name: text("name").notNull(),
  title: text("title"),
  email: text("email"),
  phone: text("phone"),
  bio: text("bio"),
  imageUrl: text("image_url"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});

// Appointments with business relationship
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  serviceId: integer("service_id").notNull(),
  staffId: integer("staff_id").references(() => staff.id),
  date: text("date").notNull(),
  time: text("time").notNull(),
  petOwner: text("pet_owner").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  petName: text("pet_name").notNull(),
  petType: text("pet_type").notNull(),
  petBreed: text("pet_breed").notNull(),
  petSize: text("pet_size").notNull(),
  petNotes: text("pet_notes"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  notes: text("notes"),
});

// Subscription plans
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  interval: text("interval").default("month").notNull(), // month, year
  features: text("features").default('[]'),
  maxStaff: integer("max_staff").default(1),
  maxServices: integer("max_services").default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
});

// Business subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  planId: integer("plan_id").notNull().references(() => plans.id),
  status: text("status").default("active").notNull(), // active, canceled, past_due
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  externalId: text("external_id"), // For payment processor reference
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Appointment insert schema with validation
export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  businessId: z.number().min(1, "Business ID is required"),
  petOwner: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  petName: z.string().min(1, "Pet name is required"),
  petBreed: z.string().min(1, "Pet breed is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  serviceId: z.number().min(1, "Service selection is required"),
});

// Types
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Relations
export const businessRelations = relations(businesses, ({ many }) => ({
  users: many(users),
  services: many(services),
  staff: many(staff),
  appointments: many(appointments),
  subscriptions: many(subscriptions)
}));

export const userRelations = relations(users, ({ one }) => ({
  business: one(businesses, {
    fields: [users.businessId],
    references: [businesses.id]
  })
}));

export const serviceRelations = relations(services, ({ one, many }) => ({
  business: one(businesses, {
    fields: [services.businessId],
    references: [businesses.id]
  }),
  appointments: many(appointments)
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
  business: one(businesses, {
    fields: [staff.businessId],
    references: [businesses.id]
  }),
  appointments: many(appointments)
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
  business: one(businesses, {
    fields: [appointments.businessId],
    references: [businesses.id]
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id]
  }),
  assignedStaff: one(staff, {
    fields: [appointments.staffId],
    references: [staff.id]
  })
}));

export const planRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions)
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  business: one(businesses, {
    fields: [subscriptions.businessId],
    references: [businesses.id]
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id]
  })
}));
