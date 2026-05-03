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
    if (username === "admin" && password === "618b1a07-a72d-4f68-85a7-88596bc35a08") {
      const user: User = { id: 1, username: "admin", name: "Administrator" };
      sessionStorage.setItem("presyo_user", JSON.stringify(user));
      return mockFetch(user);
    }
    return mockFetch({ message: "Invalid credentials" }, false);
  },

  webAuthnLogin: async (credentialId: string): Promise<{ ok: boolean; json: () => Promise<any> }> => {
    const storedCredential = localStorage.getItem("presyo_passkey_data");
    if (storedCredential) {
      const parsed = JSON.parse(storedCredential);
      if (parsed.id === credentialId) {
        const user: User = { id: 1, username: "admin", name: "Administrator" };
        sessionStorage.setItem("presyo_user", JSON.stringify(user));
        return mockFetch(user);
      }
    }
    return mockFetch({ message: "Invalid passkey" }, false);
  },

  registerPasskey: async (credentialData: any): Promise<{ ok: boolean; json: () => Promise<any> }> => {
    localStorage.setItem("presyo_passkey", "true");
    localStorage.setItem("presyo_passkey_data", JSON.stringify(credentialData));
    return mockFetch({ success: true });
  },

  clearPasskey: (): void => {
    localStorage.removeItem("presyo_passkey");
    localStorage.removeItem("presyo_passkey_data");
  },

  getPasskeyData: (): any => {
    const data = localStorage.getItem("presyo_passkey_data");
    return data ? JSON.parse(data) : null;
  },

  hasPasskey: (): boolean => {
    return localStorage.getItem("presyo_passkey") === "true";
  },

  logout: () => {
    sessionStorage.removeItem("presyo_user");
  },

  getCurrentUser: (): User | null => {
    const user = sessionStorage.getItem("presyo_user");
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
