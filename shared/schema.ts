import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(),
  icon: text("icon").notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
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
});

// Appointment insert schema with validation
export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
}).extend({
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
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
