import React, { useState, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  ImagePlus,
  Sparkles,
  Tag,
  Layers,
  X,
  Check,
  Star,
  Sparkles as NewArrivalIcon,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/store/api/productApi";
import { toast } from "sonner";
import { usePageRefresh } from "@/hooks/usePageRefresh";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { normalizeWhitespace } from "@/lib/validation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  stock: number;
  image: string;
  description: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  highlights?: string[];
  specifications?: { label: string; value: string }[];
  questions?: { question: string; answer: string }[];
  bankOffers?: string[];
  inTheBox?: string[];
  soldLastMonth?: number;
  deliveryInfo?: {
    standard: string;
    standardDays: string;
    express: string;
    expressDays: string;
    expressPrice: number;
  };
  sellerInfo?: {
    name: string;
    rating: number;
    ratingPercentage: string;
  };
  returnPolicy?: {
    days: number;
    description: string;
  };
  warranty?: {
    duration: string;
    description: string;
  };
  paymentMethods?: string[];
}

const normalizeStringList = (items: string[] = []) =>
  items.map((item) => normalizeWhitespace(item)).filter(Boolean);

const normalizeProductPayload = (product: Partial<Product>) => {
  const next: Record<string, unknown> = {};

  if (product.name !== undefined) next.name = normalizeWhitespace(product.name);
  if (product.category !== undefined) next.category = normalizeWhitespace(product.category);
  if (product.description !== undefined) next.description = normalizeWhitespace(product.description);
  if (product.price !== undefined) next.price = Number(product.price);
  if (product.originalPrice !== undefined) next.originalPrice = Number(product.originalPrice);
  if (product.stock !== undefined) next.stock = Number(product.stock);
  if (product.rating !== undefined) next.rating = Number(product.rating);
  if (product.numReviews !== undefined) next.numReviews = Number(product.numReviews);
  if (product.isFeatured !== undefined) next.isFeatured = product.isFeatured;
  if (product.isNewArrival !== undefined) next.isNewArrival = product.isNewArrival;
  if (product.isTrending !== undefined) next.isTrending = product.isTrending;
  if (product.highlights !== undefined) next.highlights = normalizeStringList(product.highlights);
  if (product.bankOffers !== undefined) next.bankOffers = normalizeStringList(product.bankOffers);
  if (product.inTheBox !== undefined) next.inTheBox = normalizeStringList(product.inTheBox);
  if (product.paymentMethods !== undefined) next.paymentMethods = normalizeStringList(product.paymentMethods);
  if (product.soldLastMonth !== undefined) next.soldLastMonth = Number(product.soldLastMonth);

  if (product.specifications !== undefined) {
    next.specifications = product.specifications
      .map((spec) => ({
        label: normalizeWhitespace(spec.label),
        value: normalizeWhitespace(spec.value),
      }))
      .filter((spec) => spec.label && spec.value);
  }

  if (product.questions !== undefined) {
    next.questions = product.questions
      .map((item) => ({
        question: normalizeWhitespace(item.question),
        answer: normalizeWhitespace(item.answer),
      }))
      .filter((item) => item.question && item.answer);
  }

  if (product.deliveryInfo !== undefined) {
    next.deliveryInfo = {
      ...(product.deliveryInfo || {}),
      standard: normalizeWhitespace(product.deliveryInfo?.standard || ""),
      standardDays: normalizeWhitespace(product.deliveryInfo?.standardDays || ""),
      express: normalizeWhitespace(product.deliveryInfo?.express || ""),
      expressDays: normalizeWhitespace(product.deliveryInfo?.expressDays || ""),
      expressPrice: Number(product.deliveryInfo?.expressPrice || 0),
    };
  }

  if (product.sellerInfo !== undefined) {
    next.sellerInfo = {
      ...(product.sellerInfo || {}),
      name: normalizeWhitespace(product.sellerInfo?.name || ""),
      rating: Number(product.sellerInfo?.rating || 0),
      ratingPercentage: normalizeWhitespace(product.sellerInfo?.ratingPercentage || ""),
    };
  }

  if (product.returnPolicy !== undefined) {
    next.returnPolicy = {
      ...(product.returnPolicy || {}),
      days: Number(product.returnPolicy?.days || 0),
      description: normalizeWhitespace(product.returnPolicy?.description || ""),
    };
  }

  if (product.warranty !== undefined) {
    next.warranty = {
      ...(product.warranty || {}),
      duration: normalizeWhitespace(product.warranty?.duration || ""),
      description: normalizeWhitespace(product.warranty?.description || ""),
    };
  }

  return next;
};

const validateProductPayload = (product: Partial<Product>) => {
  const name = normalizeWhitespace(product.name || "");
  const category = normalizeWhitespace(product.category || "");
  const price = Number(product.price);
  const stock = Number(product.stock);

  if (!name) return "Product name is required";
  if (!category) return "Category is required";
  if (!Number.isFinite(price) || price <= 0) return "Sale price must be greater than 0";
  if (!Number.isFinite(stock) || stock < 0) return "Stock cannot be negative";
  if (product.originalPrice !== undefined && Number(product.originalPrice) < 0) return "MRP cannot be negative";
  if (product.rating !== undefined) {
    const rating = Number(product.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) return "Rating must be between 0 and 5";
  }
  return null;
};

// ─── Step Indicator ────────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }: { currentStep: 1 | 2 }) => (
  <div className="flex items-center gap-0 mb-8">
    {[
      { n: 1, label: "Core Details" },
      { n: 2, label: "Rich Content" },
    ].map(({ n, label }, idx) => {
      const done = currentStep > n;
      const active = currentStep === n;
      return (
        <React.Fragment key={n}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {done ? <Check className="w-4 h-4" /> : n}
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
          {idx === 0 && (
            <div className="flex-1 mx-3 h-px bg-border relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-500"
                style={{ width: currentStep === 2 ? "100%" : "0%" }}
              />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div>
      <p className="font-semibold text-sm text-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ─── Dynamic List Field ─────────────────────────────────────────────────────────
const DynamicList = ({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel: string;
}) => (
  <div className="space-y-2">
    {items.map((item, i) => (
      <div key={i} className="flex gap-2 group">
        <Input
          value={item}
          placeholder={placeholder}
          onChange={(e) => {
            const next = [...items];
            next[i] = e.target.value;
            onChange(next);
          }}
          className="rounded-xl text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
          onClick={() => onChange(items.filter((_, idx) => idx !== i))}
        >
          <X className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...items, ""])}
      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
    >
      <Plus className="w-3.5 h-3.5" />
      {addLabel}
    </button>
  </div>
);

// ─── Product Form (2-step) ──────────────────────────────────────────────────────
const ProductForm = ({
  product,
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
  mode,
  isLoading = false,
}: {
  product: Partial<Product>;
  onChange: (p: Partial<Product>) => void;
  onSubmit: (e: React.FormEvent, file: File | null) => void;
  submitLabel: string;
  onCancel: () => void;
  mode: "create" | "edit";
  isLoading?: boolean;
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create" && !selectedFile) {
      toast.error("Please select a product image");
      return;
    }
    setStep(2);
  };

  return (
    <form onSubmit={(e) => onSubmit(e, selectedFile)} className="flex flex-col">
      <StepIndicator currentStep={step} />

      {/* ── STEP 1: Core Details ── */}
      <div className={cn("space-y-6 transition-all", step !== 1 && "hidden")}>

        {/* Image Upload */}
        <div>
          <SectionHeader icon={ImagePlus} title="Product Image" subtitle="Upload a high-quality product photo" />
          <label className="block cursor-pointer">
            <input type="file" name="productImage" accept="image/*" className="sr-only" onChange={handleFileChange} />
            <div
              className={cn(
                "relative rounded-2xl border-2 border-dashed transition-colors overflow-hidden",
                imagePreview || product.image
                  ? "border-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              {imagePreview || product.image ? (
                <div className="flex items-center gap-4 p-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border shrink-0">
                    <img
                      src={imagePreview || product.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Image selected</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <ImagePlus className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Drop an image or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Core Fields */}
        <div>
          <SectionHeader icon={Package} title="Basic Information" />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Name</Label>
              <Input
                required
                placeholder="Amul Gold Full Cream Milk 1L"
                value={product.name || ""}
                onChange={(e) => onChange({ ...product, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</Label>
              <Input
                required
                placeholder="Dairy, Snacks, Personal Care"
                value={product.category || ""}
                onChange={(e) => onChange({ ...product, category: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</Label>
              <Input
                type="number"
                required
                placeholder="25"
                value={product.stock || ""}
                onChange={(e) => onChange({ ...product, stock: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <SectionHeader icon={Tag} title="Pricing" subtitle="Set the sale price and original MRP" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sale Price (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                <Input
                  type="number"
                  required
                  placeholder="499"
                  value={product.price || ""}
                  onChange={(e) => onChange({ ...product, price: Number(e.target.value) })}
                  className="pl-7 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">MRP (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                <Input
                  type="number"
                  placeholder="599"
                  value={product.originalPrice || ""}
                  onChange={(e) => onChange({ ...product, originalPrice: Number(e.target.value) })}
                  className="pl-7 rounded-xl"
                />
              </div>
            </div>
            {product.price && product.originalPrice && product.originalPrice > product.price && (
              <div className="col-span-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <span className="text-green-700 dark:text-green-400 text-sm font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% discount applied
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Flags */}
        <div>
          <SectionHeader icon={Sparkles} title="Product Labels" subtitle="Tag this product for better visibility" />
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "isFeatured", label: "Featured", desc: "Shown in featured section", Icon: Star },
              { key: "isNewArrival", label: "New Arrival", desc: "Recently added", Icon: NewArrivalIcon },
              { key: "isTrending", label: "Trending", desc: "Popular right now", Icon: Flame },
            ].map(({ key, label, desc, Icon }) => {
              const isChecked = product[key as keyof Product] as boolean;
              return (
                <label
                  key={key}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl border-2 p-3 cursor-pointer transition-all",
                    isChecked
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/80 hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isChecked || false}
                      onCheckedChange={(checked) => onChange({ ...product, [key]: Boolean(checked) })}
                    />
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground pl-6">{desc}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
            Cancel
          </Button>
          <Button type="button" onClick={(e) => handleNext(e as any)} className="rounded-xl gap-2">
            Next: Rich Content <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── STEP 2: Rich Content ── */}
      <div className={cn("space-y-6 transition-all", step !== 2 && "hidden")}>

        {/* Highlights */}
        <div>
          <SectionHeader icon={Sparkles} title="Highlights" subtitle="Key selling points shown prominently" />
          <DynamicList
            items={product.highlights || []}
            onChange={(v) => onChange({ ...product, highlights: v })}
            placeholder="Rich taste and creamy texture"
            addLabel="Add highlight"
          />
        </div>

        {/* Specs */}
        <div className="border-t pt-5">
          <SectionHeader icon={Layers} title="Specifications" subtitle="Technical details in label/value pairs" />
          <div className="space-y-2">
            {(product.specifications || []).map((s, i) => (
              <div key={i} className="flex gap-2 group">
                <Input
                  placeholder="Label, e.g. Weight"
                  value={s.label}
                  onChange={(e) => {
                    const n = [...(product.specifications || [])];
                    n[i] = { ...n[i], label: e.target.value };
                    onChange({ ...product, specifications: n });
                  }}
                  className="rounded-xl text-sm w-2/5"
                />
                <Input
                  placeholder="Value, e.g. 1 litre"
                  value={s.value}
                  onChange={(e) => {
                    const n = [...(product.specifications || [])];
                    n[i] = { ...n[i], value: e.target.value };
                    onChange({ ...product, specifications: n });
                  }}
                  className="rounded-xl text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                  onClick={() =>
                    onChange({ ...product, specifications: (product.specifications || []).filter((_, idx) => idx !== i) })
                  }
                >
                  <X className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onChange({ ...product, specifications: [...(product.specifications || []), { label: "", value: "" }] })
              }
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add specification
            </button>
          </div>
        </div>

        {/* Q&A */}
        <div className="border-t pt-5">
          <SectionHeader icon={Package} title="Customer Q&A" subtitle="Common questions and answers" />
          <div className="space-y-3">
            {(product.questions || []).map((q, i) => (
              <div key={i} className="rounded-xl border bg-muted/20 p-3 space-y-2 group relative">
                <Input
                  placeholder="Is this item delivered chilled?"
                  value={q.question}
                  onChange={(e) => {
                    const n = [...(product.questions || [])];
                    n[i] = { ...n[i], question: e.target.value };
                    onChange({ ...product, questions: n });
                  }}
                  className="rounded-lg text-sm bg-background"
                />
                <Textarea
                  placeholder="Yes, dairy items are packed and delivered with care."
                  rows={2}
                  value={q.answer}
                  onChange={(e) => {
                    const n = [...(product.questions || [])];
                    n[i] = { ...n[i], answer: e.target.value };
                    onChange({ ...product, questions: n });
                  }}
                  className="rounded-lg text-sm bg-background resize-none"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() =>
                    onChange({ ...product, questions: (product.questions || []).filter((_, idx) => idx !== i) })
                  }
                >
                  <X className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onChange({ ...product, questions: [...(product.questions || []), { question: "", answer: "" }] })
              }
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Q&amp;A
            </button>
          </div>
        </div>

        {/* Bank Offers */}
        <div className="border-t pt-5">
          <SectionHeader icon={Tag} title="Bank Offers" subtitle="Discount codes or EMI offers" />
          <DynamicList
            items={product.bankOffers || []}
            onChange={(v) => onChange({ ...product, bankOffers: v })}
            placeholder="10% instant discount on HDFC cards"
            addLabel="Add bank offer"
          />
        </div>

        {/* In The Box */}
        <div className="border-t pt-5">
          <SectionHeader icon={Package} title="What's in the Box" subtitle="Items included with the product" />
          <DynamicList
            items={product.inTheBox || []}
            onChange={(v) => onChange({ ...product, inTheBox: v })}
            placeholder="1 x 1L milk pack"
            addLabel="Add box item"
          />
        </div>

        {/* Delivery & Seller Settings */}
        <div className="border-t pt-5">
          <SectionHeader icon={Package} title="Delivery & Seller Info" subtitle="Configure delivery options and seller details" />
          <div className="space-y-4">
            {/* Sold Last Month */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Units Sold Last Month</Label>
              <Input
                type="number"
                placeholder="350"
                value={(product as any).soldLastMonth || ""}
                onChange={(e) => onChange({ ...product, soldLastMonth: Number(e.target.value) })}
                className="rounded-xl mt-1"
              />
            </div>

            {/* Standard Delivery */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Type</Label>
                <Input
                  placeholder="Free delivery"
                  value={(product as any).deliveryInfo?.standard || ""}
                  onChange={(e) => onChange({ ...product, deliveryInfo: { ...(product as any).deliveryInfo, standard: e.target.value } })}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimated Days</Label>
                <Input
                  placeholder="30-45 minutes"
                  value={(product as any).deliveryInfo?.standardDays || ""}
                  onChange={(e) => onChange({ ...product, deliveryInfo: { ...(product as any).deliveryInfo, standardDays: e.target.value } })}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            {/* Seller Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seller Name</Label>
                <Input
                  placeholder="MaurMart Fresh"
                  value={(product as any).sellerInfo?.name || ""}
                  onChange={(e) => onChange({ ...product, sellerInfo: { ...(product as any).sellerInfo, name: e.target.value } })}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seller Rating (0-5)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="4.7"
                  value={(product as any).sellerInfo?.rating || ""}
                  onChange={(e) => onChange({ ...product, sellerInfo: { ...(product as any).sellerInfo, rating: Number(e.target.value) } })}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            {/* Return Policy */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Return Days</Label>
                <Input
                  type="number"
                  placeholder="7"
                  value={(product as any).returnPolicy?.days || ""}
                  onChange={(e) => onChange({ ...product, returnPolicy: { ...(product as any).returnPolicy, days: Number(e.target.value) } })}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Return Description</Label>
                <Input
                  placeholder="Easy returns on damaged or incorrect items"
                  value={(product as any).returnPolicy?.description || ""}
                  onChange={(e) => onChange({ ...product, returnPolicy: { ...(product as any).returnPolicy, description: e.target.value } })}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            {/* Warranty */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Warranty Duration</Label>
                <Input
                  placeholder="Best before 2 days"
                  value={(product as any).warranty?.duration || ""}
                  onChange={(e) => onChange({ ...product, warranty: { ...(product as any).warranty, duration: e.target.value } })}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Warranty Description</Label>
                <Input
                  placeholder="Storage and freshness guidance included"
                  value={(product as any).warranty?.description || ""}
                  onChange={(e) => onChange({ ...product, warranty: { ...(product as any).warranty, description: e.target.value } })}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Methods</Label>
              <DynamicList
                items={(product as any).paymentMethods || []}
                onChange={(v) => onChange({ ...product, paymentMethods: v })}
                placeholder="UPI, Cards, Wallets"
                addLabel="Add payment method"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border-t pt-5">
          <SectionHeader icon={Layers} title="Description" subtitle="Full product description shown on the product page" />
          <Textarea
            rows={5}
            placeholder="Describe the product, quality, usage, pack size, and any key buying details."
            value={product.description || ""}
            onChange={(e) => onChange({ ...product, description: e.target.value })}
            className="rounded-xl resize-none text-sm"
          />
        </div>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-xl gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl gap-2 shadow-lg shadow-primary/20">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> {submitLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const AdminProducts = () => {
  const productsQuery = useGetProductsQuery({});
  const { data: productsResponse, isLoading } = productsQuery;
  const products = (productsResponse?.data || productsResponse || []) as Product[];
  const [deleteProduct] = useDeleteProductMutation();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "price_high" | "price_low" | "stock_high" | "stock_low">("newest");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await productsQuery.refetch();
    } catch (error) {
      console.error("❌ Error refreshing products:", error);
    }
  }, [productsQuery]);

  // Listen for page refresh events
  usePageRefresh({
    page: "products",
    onRefresh: handleRefresh,
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Product deleted successfully");
        await handleRefresh();
      } catch {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleCreate = async (e: React.FormEvent, file: File | null) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!file) { toast.error("Please select a product image"); return; }
      const payload = normalizeProductPayload(currentProduct);
      const validationError = validateProductPayload(payload as Partial<Product>);
      if (validationError) {
        toast.error(validationError);
        return;
      }
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (Array.isArray(value)) formData.append(key, JSON.stringify(value));
        else if (typeof value === "object" && value !== null) formData.append(key, JSON.stringify(value));
        else formData.append(key, String(value));
      });
      formData.append("image", file);
      await createProduct(formData).unwrap();
      await handleRefresh();
      toast.success("Product created successfully");
      setIsAddDialogOpen(false);
      setCurrentProduct({});
    } catch (error: any) {
      console.error("❌ Error creating product:", error);
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || "Failed to create product";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent, file: File | null) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = normalizeProductPayload(currentProduct);
      const validationError = validateProductPayload(payload as Partial<Product>);
      if (validationError) {
        toast.error(validationError);
        return;
      }
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key !== "_id" && key !== "image") {
          if (Array.isArray(value)) formData.append(key, JSON.stringify(value));
          else if (typeof value === "object" && value !== null) formData.append(key, JSON.stringify(value));
          else formData.append(key, String(value));
        }
      });
      if (file) formData.append("image", file);
      await updateProduct({ id: currentProduct._id!, formData }).unwrap();
      toast.success("Product updated successfully");
      setIsEditDialogOpen(false);
      setCurrentProduct({});
    } catch (error: any) {
      console.error("❌ Error updating product:", error);
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || "Failed to update product";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = [...products]
    .filter(
      (p: Product) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p: Product) => {
      if (stockFilter === "in_stock") return p.stock > 10;
      if (stockFilter === "low_stock") return p.stock > 0 && p.stock <= 10;
      if (stockFilter === "out_of_stock") return p.stock <= 0;
      return true;
    })
    .sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price_high":
          return b.price - a.price;
        case "price_low":
          return a.price - b.price;
        case "stock_high":
          return b.stock - a.stock;
        case "stock_low":
          return a.stock - b.stock;
        default:
          return 0;
      }
    });

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your store's inventory and details.</p>
        </div>
        <Button
          className="rounded-xl gap-2 shadow-lg shadow-primary/20"
          onClick={() => { setCurrentProduct({}); setIsAddDialogOpen(true); }}
        >
          <Plus className="h-4 w-4" /> Add New Product
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2"><Filter className="h-4 w-4" /> Filter</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Stock</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={stockFilter} onValueChange={(value) => setStockFilter(value as typeof stockFilter)}>
                  <DropdownMenuRadioItem value="all">All stock</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="in_stock">In stock</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="low_stock">Low stock</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="out_of_stock">Out of stock</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2"><ArrowUpDown className="h-4 w-4" /> Sort</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort Products</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <DropdownMenuRadioItem value="newest">Default order</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name">Name A-Z</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price_high">Price high-low</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price_low">Price low-high</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="stock_high">Stock high-low</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="stock_low">Stock low-high</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:hidden">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">No products found.</div>
          ) : filteredProducts.map((product: Product) => (
            <div key={product._id} className="rounded-2xl border bg-slate-50/70 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border bg-white shrink-0">
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm line-clamp-2">{product.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{product.category}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setCurrentProduct(product); setIsEditDialogOpen(true); }}>Edit Product</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(product._id)}>Copy Product ID</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(product._id)}>Delete Product</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-semibold">₹{product.price.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stock</p>
                      <p className="font-medium">{product.stock} units</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading products...</td></tr>
              ) : filteredProducts?.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products found.</td></tr>
              ) : filteredProducts?.map((product: Product) => (
                <tr key={product._id} className="group hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border bg-muted">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{product._id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-sm">₹{product.price.toLocaleString("en-IN")}</p>
                    {product.originalPrice > product.price && (
                      <p className="text-[10px] text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-orange-500" : "bg-red-500"}`} />
                      <span className="text-sm font-medium">{product.stock} in stock</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                        onClick={() => { setCurrentProduct(product); setIsEditDialogOpen(true); }}
                      >
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleDelete(product._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setCurrentProduct(product); setIsEditDialogOpen(true); }}>
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(product._id)}>
                            Copy Product ID
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const { _id, ...rest } = product;
                            setCurrentProduct({ ...rest, name: `${product.name} Copy` });
                            setIsAddDialogOpen(true);
                          }}>
                            Duplicate Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setCurrentProduct({}); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details across two steps to create a complete product listing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProductForm
              key={isAddDialogOpen ? "add-open" : "add-closed"}
              product={currentProduct}
              onChange={setCurrentProduct}
              onSubmit={handleCreate}
              submitLabel="Create Product"
              onCancel={() => setIsAddDialogOpen(false)}
              mode="create"
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setCurrentProduct({}); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for {currentProduct.name || "the selected product"}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProductForm
              key={currentProduct._id}
              product={currentProduct}
              onChange={setCurrentProduct}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
              onCancel={() => setIsEditDialogOpen(false)}
              mode="edit"
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminProducts;
