import type { Category, Product, SavedDesign, DesignShelf, DesignItem, User } from '@prisma/client';

/**
 * EN: Extended types with their Prisma relations included.
 *     These compose base models with their foreign-key relationships for full-stack type safety.
 * ID: Tipe extended dengan relasi Prisma yang disertakan.
 *     Menggabungkan model dasar dengan relasi foreign-key untuk keamanan tipe full-stack.
 */

/** EN: Product with its category relation / ID: Produk beserta relasi kategorinya */
export type ProductWithCategory = Product & {
  category: Category;
};

/** EN: DesignItem with nested product + category / ID: DesignItem dengan produk + kategori bersarang */
export type DesignItemWithProduct = DesignItem & {
  product: ProductWithCategory;
};

/** EN: Shelf containing its items / ID: Rak yang berisi item-itemnya */
export type DesignShelfWithItems = DesignShelf & {
  items: DesignItemWithProduct[];
};

/** EN: Full design with shelves and optional user / ID: Desain lengkap dengan rak dan user opsional */
export type DesignWithShelves = SavedDesign & {
  shelves: DesignShelfWithItems[];
  user?: User;
};

/** EN: Category with products count / ID: Kategori dengan jumlah produk */
export type CategoryWithProducts = Category & {
  products: Product[];
  _count?: {
    products: number;
  };
};

/**
 * EN: UI State types — transient frontend state not persisted to DB.
 * ID: Tipe State UI — state frontend sementara yang tidak disimpan ke database.
 */

/** EN: Clipboard cut/copy state / ID: State clipboard potong/salin */
export type ClipboardItem = {
  itemId: string;
  productId: string;
  sourceShelfId: string;
  designItem: DesignItemWithProduct;
} | null;

/**
 * EN: API Response types — standardized envelope for all API endpoints.
 * ID: Tipe Response API — amplop standar untuk semua endpoint API.
 */

/** EN: Generic API response wrapper / ID: Pembungkus respons API generik */
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * EN: Grid validation helpers — legacy types kept for forward compatibility.
 * ID: Pembantu validasi grid — tipe legacy yang dipertahankan untuk kompatibilitas.
 */

/** EN: Single grid cell state / ID: Status satu sel grid */
export type GridCell = {
  occupied: boolean;
  itemId?: string;
};

/** EN: Shelf grid validation result / ID: Hasil validasi grid rak */
export type GridValidation = {
  isValid: boolean;
  conflicts: Array<{
    position: number;
    itemIds: string[];
  }>;
};