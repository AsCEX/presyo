import React, { useState, useEffect } from "react";
import { api, Product, ProductInput } from "../api/mockApi";
import { Layout } from "../components/Layout";
import { DataTable, ColumnDef } from "../components/ui/DataTable";
import { ProductModal } from "../components/ProductModal";
import { Button } from "@/components/ui/Button";

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
      className: '!p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[200px] min-w-[200px]',
      cell: (row) => <div className="font-medium">{row.name}</div>,
    },
    {
      header: "Description",
      accessorKey: "description",
      className: '!p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[200px] min-w-[200px]',
      cell: (row) => (
        <div className="max-w-[300px] truncate text-muted-foreground">
          {row.description || "N/A"}
        </div>
      ),
    },
    {
      header: "Total Cost",
      className: '!p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[200px] min-w-[200px]',
      cell: (row) => {
        const total = row.costs.reduce((sum, item) => {
          const costPerUnit = item.purchasedQty > 0 ? item.purchasedCost / item.purchasedQty : 0;
          return sum + (costPerUnit * item.weight);
        }, 0);
        return <div className="font-medium text-muted-foreground">₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
      },
    },
    {
      header: "Selling Price",
      className: '!p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[200px] min-w-[200px]',
      cell: (row) => {
        const total = row.costs.reduce((sum, item) => {
          const costPerUnit = item.purchasedQty > 0 ? item.purchasedCost / item.purchasedQty : 0;
          return sum + (costPerUnit * item.weight);
        }, 0);
        const sellingPrice = total * (1 + (row.marginProfit || 0) / 100);
        const unitPrice = row.qty > 0 ? sellingPrice / row.qty : 0;
        return (
          <div className="flex flex-col">
            <div className="font-bold">₱{unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[10px] text-muted-foreground">₱{sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Total • {row.qty} qty</div>
            <div className="text-[10px] text-primary font-medium">{row.marginProfit || 0}% Margin</div>
          </div>
        );
      },
    },
    {
      header: "Actions",
      className: '!p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[200px] min-w-[200px]',
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingProduct(row)}
            className="h-8 px-2 text-xs"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteProduct(row.id)}
            className="h-8 px-2 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Delete
          </Button>
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
          <Button
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Product
          </Button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading products...</div>
        ) : (
          <DataTable columns={columns} data={products} />
        )}
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
