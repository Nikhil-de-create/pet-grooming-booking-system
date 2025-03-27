import { Service } from "@shared/schema";

// Default services - these match the services initialized in server/storage.ts
export const defaultServices: Service[] = [
  {
    id: 1,
    name: "Basic Bath & Brush",
    description: "Bath, blow dry, brush out, nail trim, ear cleaning",
    price: 45,
    duration: 60,
    icon: "fa-shower"
  },
  {
    id: 2,
    name: "Full Grooming",
    description: "Bath, blow dry, haircut, style, nail trim, ear cleaning",
    price: 65,
    duration: 90,
    icon: "fa-cut"
  },
  {
    id: 3,
    name: "Deluxe Spa Package",
    description: "Premium shampoo, conditioner, teeth brushing, and pawdicure",
    price: 85,
    duration: 120,
    icon: "fa-spa"
  },
  {
    id: 4,
    name: "Nail Trim & Ear Cleaning",
    description: "Quick service for nail trimming and ear cleaning only",
    price: 25,
    duration: 30,
    icon: "fa-paw"
  }
];

export function getServiceById(id: number): Service | undefined {
  return defaultServices.find(service => service.id === id);
}
