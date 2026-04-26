const DELAY = 500;

export interface User {
  id: number;
  username: string;
  name: string;
}

export interface CostItem {
  name: string;
  weight: number;
  unit: 'g' | 'kg' | 'pcs' | 'sheets';
  purchasedCost: number;
  purchasedQty: number;
  purchasedUnit: 'g' | 'kg' | 'pcs' | 'sheets';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  qty: number;
  costs: CostItem[];
  marginProfit: number; // Percentage
  createdAt: string;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt'>;

const mockFetch = <T>(data: T, success = true): Promise<{ ok: boolean; json: () => Promise<T> }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve({ ok: true, json: () => Promise.resolve(data) });
      } else {
        reject(new Error("API Error"));
      }
    }, DELAY);
  });
};

const STORAGE_KEY = "presyo_products";

const getProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const api = {
  login: async (username: string, password: string): Promise<{ ok: boolean; json: () => Promise<any> }> => {
    if (username === "admin" && password === "admin") {
      const user: User = { id: 1, username: "admin", name: "Administrator" };
      localStorage.setItem("presyo_user", JSON.stringify(user));
      return mockFetch(user);
    }
    return mockFetch({ message: "Invalid credentials" }, false);
  },

  logout: () => {
    localStorage.removeItem("presyo_user");
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem("presyo_user");
    return user ? JSON.parse(user) : null;
  },

  getProducts: async (): Promise<{ ok: boolean; json: () => Promise<Product[]> }> => {
    return mockFetch(getProducts());
  },

  createProduct: async (product: ProductInput): Promise<{ ok: boolean; json: () => Promise<Product> }> => {
    const products = getProducts();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    saveProducts(products);
    return mockFetch(newProduct);
  },

  updateProduct: async (id: string, updatedData: Partial<ProductInput>): Promise<{ ok: boolean; json: () => Promise<Product | { message: string }> }> => {
    const products = getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedData };
      saveProducts(products);
      return mockFetch(products[index]);
    }
    return mockFetch({ message: "Product not found" }, false);
  },

  deleteProduct: async (id: string): Promise<{ ok: boolean; json: () => Promise<{ success: boolean }> }> => {
    const products = getProducts();
    const filtered = products.filter((p) => p.id !== id);
    saveProducts(filtered);
    return mockFetch({ success: true });
  },
};
