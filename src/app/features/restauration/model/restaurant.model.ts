import { Meal } from "./plat.model";

export interface Restaurant {
  id: number;
  restaurantName: string;
  address: string;
  contact: string;
  deliveryFee: number;
  meals?: Meal[];
}