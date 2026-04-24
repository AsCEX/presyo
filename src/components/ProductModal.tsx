import React, { useState } from "react";
import { Product, ProductInput, CostItem } from "../api/mockApi";
import { X, Trash2 } from "lucide-react";

interface ProductModalProps {
  product?: Product;
  onSave: (product: ProductInput) => void;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onSave, onClose }) => {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [costs, setCosts] = useState<CostItem[]>(
    product ? [...product.costs] : [{ name: "", price: 0, quantity: 1 }]
  );

  const handleAddCost = () => {
    setCosts([...costs, { name: "", price: 0, quantity: 1 }]);
  };

  const handleRemoveCost = (index: number) => {
    setCosts(costs.filter((_, i) => i !== index));
  };

  const handleCostChange = (index: number, field: keyof CostItem, value: string | number) => {
    const newCosts = [...costs];
    if (field === "name") {
      newCosts[index].name = value as string;
    } else if (field === "price") {
      newCosts[index].price = parseFloat(value as string) || 0;
    } else if (field === "quantity") {
      newCosts[index].quantity = parseInt(value as string) || 0;
    }
    setCosts(newCosts);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Product name is required");
      return;
    }
    onSave({
      name,
      description,
      costs: costs.filter((c) => c.name.trim() !== ""),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
      <div className="w-full max-w-2xl rounded-lg bg-card p-6 shadow-lg outline-none flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. Custom Cabinet"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Product details..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Costs & Materials</label>
              <button
                type="button"
                onClick={handleAddCost}
                className="text-xs font-medium text-primary hover:underline"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {costs.map((item, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Item Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleCostChange(index, "name", e.target.value)}
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Price</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleCostChange(index, "price", e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleCostChange(index, "quantity", e.target.value)}
                      required
                      min="1"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCost(index)}
                    className="h-9 w-9 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
