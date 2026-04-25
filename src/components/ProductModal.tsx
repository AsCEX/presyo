import React, { useState } from "react";
import { Product, ProductInput, CostItem } from "../api/mockApi";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent, DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSave: (product: ProductInput) => void;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ open, onOpenChange, product, onSave, onClose }) => {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [costs, setCosts] = useState<CostItem[]>(
    product ? [...product.costs] : [{ 
      name: "", 
      weight: 0, 
      unit: "g", 
      purchasedCost: 0, 
      purchasedQty: 0, 
      purchasedUnit: "g" 
    }]
  );

  // Reset state when product changes (e.g. from undefined to a product or vice versa)
  React.useEffect(() => {
    setName(product?.name || "");
    setDescription(product?.description || "");
    setCosts(product ? [...product.costs] : [{ 
      name: "", 
      weight: 0, 
      unit: "g", 
      purchasedCost: 0, 
      purchasedQty: 0, 
      purchasedUnit: "g" 
    }]);
  }, [product]);

  const handleAddCost = () => {
    setCosts([...costs, { 
      name: "", 
      weight: 0, 
      unit: "g", 
      purchasedCost: 0, 
      purchasedQty: 0, 
      purchasedUnit: "g" 
    }]);
  };

  const handleRemoveCost = (index: number) => {
    setCosts(costs.filter((_, i) => i !== index));
  };

  const handleCostChange = (index: number, field: keyof CostItem, value: string | number) => {
    const newCosts = [...costs];
    if (field === "name") {
      newCosts[index].name = value as string;
    } else if (field === "weight") {
      newCosts[index].weight = parseFloat(value as string) || 0;
    } else if (field === "unit") {
      newCosts[index].unit = value as any;
    } else if (field === "purchasedCost") {
      newCosts[index].purchasedCost = parseFloat(value as string) || 0;
    } else if (field === "purchasedQty") {
      newCosts[index].purchasedQty = parseFloat(value as string) || 0;
    } else if (field === "purchasedUnit") {
      newCosts[index].purchasedUnit = value as any;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Costs & Materials</label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleAddCost}
                  className="h-auto p-0"
                >
                  + Add Item
                </Button>
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[200px]">Item Name</th>
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[100px]">Used Qty</th>
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[100px]">Unit</th>
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[120px]">Purchase Cost</th>
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[100px]">Purchase Qty</th>
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[100px]">P. Unit</th>
                      <th className="p-2 text-right font-medium text-muted-foreground uppercase text-[10px] w-[100px]">Cost</th>
                      <th className="p-2 w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {costs.map((item, index) => {
                      const costPerUnit = item.purchasedQty > 0 ? item.purchasedCost / item.purchasedQty : 0;
                      const ingredientsCost = costPerUnit * item.weight;

                      return (
                        <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleCostChange(index, "name", e.target.value)}
                              required
                              className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              placeholder="e.g. Flour"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.weight}
                              onChange={(e) => handleCostChange(index, "weight", e.target.value)}
                              required
                              min="0"
                              step="0.01"
                              className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.unit}
                              onChange={(e) => handleCostChange(index, "unit", e.target.value)}
                              className="h-8 w-full rounded-md border border-input bg-background px-1 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                              <option value="pcs">pcs</option>
                              <option value="sheets">sheets</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.purchasedCost}
                              onChange={(e) => handleCostChange(index, "purchasedCost", e.target.value)}
                              required
                              min="0"
                              step="0.01"
                              className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.purchasedQty}
                              onChange={(e) => handleCostChange(index, "purchasedQty", e.target.value)}
                              required
                              min="0"
                              step="0.01"
                              className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.purchasedUnit}
                              onChange={(e) => handleCostChange(index, "purchasedUnit", e.target.value)}
                              className="h-8 w-full rounded-md border border-input bg-background px-1 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                              <option value="pcs">pcs</option>
                              <option value="sheets">sheets</option>
                            </select>
                          </td>
                          <td className="p-2 text-right">
                            <span className="text-xs font-mono font-bold text-primary">
                              ₱{ingredientsCost.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCost(index)}
                              className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 border-t flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
