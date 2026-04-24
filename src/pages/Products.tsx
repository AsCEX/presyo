import React, { useState, useEffect } from "react";
import { api, Product, ProductInput } from "../api/mockApi";
import { Layout } from "../components/Layout";
import { DataTable, ColumnDef } from "../components/ui/DataTable";
import { ProductModal } from "../components/ProductModal";

export const Products: React.FC = () => {
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

  const columns: ColumnDef<Product>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (row) => <div className="font-medium">{row.name}</div>,
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (row) => (
        <div className="max-w-[300px] truncate text-muted-foreground">
          {row.description || "N/A"}
        </div>
      ),
    },
    {
      header: "Created At",
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "Total Cost",
      cell: (row) => {
        const total = row.costs.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return <div className="font-bold">₱{total.toLocaleString()}</div>;
      },
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => setEditingProduct(row)}
            className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteProduct(row.id)}
            className="rounded-md border border-destructive/20 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Products" activePath="products">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Product Catalog</h2>
            <p className="text-muted-foreground">Manage your products and their costs here.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            + Add Product
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading products...</div>
        ) : (
          <DataTable columns={columns} data={products} />
        )}
      </div>

      {isAddModalOpen && (
        <ProductModal
          onSave={handleCreateProduct}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onSave={handleUpdateProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </Layout>
  );
};
