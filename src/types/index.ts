import type { Category, Product, SavedDesign, DesignShelf, DesignItem, User } from '@prisma/client';

// Extended types with included relations
export type ProductWithCategory = Product & {
  category: Category;
};

export type DesignItemWithProduct = DesignItem & {
  product: ProductWithCategory;
};

export type DesignShelfWithItems = DesignShelf & {
  items: DesignItemWithProduct[];
};

export type DesignWithShelves = SavedDesign & {
  shelves: DesignShelfWithItems[];
  user?: User;
};

export type CategoryWithProducts = Category & {
  products: Product[];
  _count?: {
    products: number;
  };
};

// UI State types
export type ClipboardItem = {
  itemId: string;
  productId: string;
  sourceShelfId: string;
  designItem: DesignItemWithProduct;
} | null;

// API Response types
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Shelf grid validation
export type GridCell = {
  occupied: boolean;
  itemId?: string;
};

export type GridValidation = {
  isValid: boolean;
  message?: string;
};