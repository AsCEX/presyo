import React, { useState, useEffect } from "react";
import { api, Product, ProductInput } from "../api/mockApi";
import { Layout } from "../components/Layout";
import { ProductModal } from "../components/ProductModal";

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    const res = await api.getProducts();
    const data = await res.json();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (data: ProductInput) => {
    await api.createProduct(data);
    setIsAddModalOpen(false);
    loadProducts();
  };

  const handleUpdateProduct = async (data: ProductInput) => {
    if (editingProduct) {
      await api.updateProduct(editingProduct.id, data);
      setEditingProduct(null);
      loadProducts();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await api.deleteProduct(id);
      loadProducts();
    }
  };

  return (
    <Layout title="Dashboard" activePath="dashboard">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">Here's an overview of your costing projects.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            + Add Product
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">No products yet. Add your first one!</p>
            </div>
          ) : (
            products.map((product) => {
              const totalCost = product.costs.reduce((sum, item) => {
                const costPerUnit = item.purchasedQty > 0 ? item.purchasedCost / item.purchasedQty : 0;
                return sum + (costPerUnit * item.weight);
              }, 0);
              return (
                <div
                  key={product.id}
                  className="group relative rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold leading-none tracking-tight">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.description || "No description"}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-bold">₱{totalCost.toLocaleString()}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-md border border-destructive/20 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ProductModal
        open={isAddModalOpen || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }
        }}
        product={editingProduct || undefined}
        onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
      />
    </Layout>
  );
};
