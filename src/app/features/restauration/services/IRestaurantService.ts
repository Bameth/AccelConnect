import { Observable } from 'rxjs';
import { Restaurant } from '../model/restaurant.model';

export interface IRestaurantService {
  getRestaurants(): Observable<Restaurant[]>;
  createRestaurant(restaurant: Restaurant): Observable<Restaurant>;
  addMealToRestaurant(restaurantId: number, mealId: number): Observable<Restaurant>;
  getRestaurantWithMeals(restaurantId: number): Observable<Restaurant>;
}
