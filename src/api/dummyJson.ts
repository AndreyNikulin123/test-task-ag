import { AuthResponse, LoginRequest, Product, ProductFromApi } from "../types";

const BASE_URL = "/api";

const mapProduct = (api: ProductFromApi): Product => {
  const sku = `SKU-${String(api.id).padStart(4, "0")}`;

  return {
    id: api.id,
    name: api.title,
    category: api.category,
    vendor: api.brand,
    sku,
    rating: api.rating,
    price: api.price,
  };
};

const handleJsonResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String(
            (data as { message?: unknown }).message ?? "Неизвестная ошибка",
          )
        : "Ошибка при обращении к API";

    throw new Error(message);
  }

  return data as T;
};

export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username: payload.username,
      password: payload.password,
    }),
  });

  return handleJsonResponse<AuthResponse>(response);
};

interface ProductsResponse {
  products: ProductFromApi[];
}

export const fetchProducts = async (token: string): Promise<Product[]> => {
  const response = await fetch(`${BASE_URL}/auth/products?limit=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await handleJsonResponse<ProductsResponse>(response);
  return data.products.map(mapProduct);
};

export const searchProducts = async (
  token: string,
  query: string,
): Promise<Product[]> => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const response = await fetch(
    `${BASE_URL}/auth/products/search?q=${encodeURIComponent(trimmed)}&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await handleJsonResponse<ProductsResponse>(response);
  return data.products.map(mapProduct);
};
