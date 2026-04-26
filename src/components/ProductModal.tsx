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
  const [qty, setQty] = useState(product?.qty || 1);
  const [marginProfit, setMarginProfit] = useState(product?.marginProfit || 0);
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
    setQty(product?.qty || 1);
    setMarginProfit(product?.marginProfit || 0);
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
      qty,
      marginProfit,
      costs: costs.filter((c) => c.name.trim() !== ""),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full max-w-none sm:!max-w-5xl sm:h-auto sm:max-h-[90vh] flex flex-col p-0 gap-0 sm:rounded-xl sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 top-0 left-0 translate-x-0 translate-y-0 rounded-none sm:ring-1 sm:ring-foreground/10">
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b">
            <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. Custom Cabinet"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Yield Qty</label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  required
                  min="1"
                  step="1"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. 1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Margin Profit (%)</label>
                <input
                  type="number"
                  value={marginProfit}
                  onChange={(e) => setMarginProfit(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  required
                  min="0"
                  step="0.01"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. 20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Product details..."
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-6">
                  <div>
                    <span className="text-xs uppercase text-muted-foreground font-semibold">Total Cost</span>
                    <div className="text-xl font-bold">₱{costs.reduce((sum, item) => {
                      const costPerUnit = item.purchasedQty > 0 ? item.purchasedCost / item.purchasedQty : 0;
                      return sum + (costPerUnit * item.weight);
                    }, 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-muted-foreground font-semibold">Total Selling Price</span>
                    <div className="text-xl font-bold">
                      ₱{(costs.reduce((sum, item) => {
                        const costPerUnit = item.purchasedQty > 0 ? item.purchasedCost / item.purchasedQty : 0;
                        return sum + (costPerUnit * item.weight);
                      }, 0) * (1 + marginProfit / 100)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-muted-foreground font-semibold">Price per Qty</span>
                    <div className="text-xl font-bold text-primary">
                      ₱{(qty > 0 ? (costs.reduce((sum, item) => {
                        const costPerUnit = item.purchasedQty > 0 ? item.purchasedCost / item.purchasedQty : 0;
                        return sum + (costPerUnit * item.weight);
                      }, 0) * (1 + marginProfit / 100)) / qty : 0).toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleAddCost}
                  className="h-auto p-0 self-start sm:self-center"
                >
                  + Add Item
                </Button>
              </div>

              <div className="overflow-x-auto border rounded-lg pb-6">
                <table className="w-full text-sm border-collapse min-w-[800px] table-fixed">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[200px] min-w-[200px]">Item Name</th>
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[90px] min-w-[90px]">Used Qty</th>
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[80px] min-w-[80px]">Unit</th>
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[110px] min-w-[110px]">Purchase Cost</th>
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[90px] min-w-[90px]">Purchase Qty</th>
                      <th className="p-2 text-left font-medium text-muted-foreground uppercase text-[10px] w-[80px] min-w-[80px]">P. Unit</th>
                      <th className="p-2 text-right font-medium text-muted-foreground uppercase text-[10px] w-[100px] min-w-[100px]">Cost</th>
                      <th className="p-2 w-[50px] min-w-[50px]"></th>
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
                              onFocus={(e) => e.target.select()}
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
                              onFocus={(e) => e.target.select()}
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
                              onFocus={(e) => e.target.select()}
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
                              onFocus={(e) => e.target.select()}
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

          <DialogFooter className="py-4 px-8 sm:p-6 border-t flex-row justify-end gap-3 !mb-0">
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
