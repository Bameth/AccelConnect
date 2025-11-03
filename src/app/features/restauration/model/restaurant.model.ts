import { Meal } from "./plat.model";

export interface Restaurant {
  id: number;
  restaurant_name: string;
  address: string;
  contact: string;
  meal?: Meal[];
}
