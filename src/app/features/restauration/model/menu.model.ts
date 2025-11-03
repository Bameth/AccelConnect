import { Meal } from './plat.model';

export interface Menu {
  id?: number;
  restaurantId: number;
  restaurantName?: string;
  menuDate: string; // Format ISO: 'YYYY-MM-DD'
  mealIds: number[];
  meals?: Meal[];
  isActive: boolean;
}

export interface CreateMenuRequest {
  restaurantId: number;
  menuDate: string;
  mealIds: number[];
}
