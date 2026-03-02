export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  /**
   * Новый формат токена согласно документации DummyJSON.
   */
  accessToken: string;
  /**
   * Токен обновления сессии.
   */
  refreshToken: string;
  /**
   * Для обратной совместимости, если API вернёт старое поле.
   */
  token?: string;
}

export interface AuthSession {
  token: string;
  username: string;
  remember: boolean;
}

export interface LoginPayload {
  response: AuthResponse;
  remember: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ProductFromApi {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  vendor: string;
  sku: string;
  rating: number;
  price: number;
  isLocal?: boolean;
}

export type SortField = "name" | "vendor" | "sku" | "rating" | "price";

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

