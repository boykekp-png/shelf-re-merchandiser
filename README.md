# 🛒 Shelf Re-Merchandiser

A visual retail planogram tool for planning and organizing shelf layouts. Drag and drop products onto shelves, save multiple designs, export to PDF, and manage your product catalog — all in a clean, modern interface.

## ✨ Features

- **Drag & Drop Shelf Planning** — Place products on a 12-column grid shelf by dragging from the product tray or between shelves
- **Multiple Shelves** — Add, rename, and delete shelves to build complete merchandising layouts
- **Product Management** — Full CRUD for products with categories, emoji icons, and enable/disable status
- **Overlap Protection** — Prevents products from overlapping on the same slot with a fun error sound
- **Print & PDF Export** — Print-friendly preview with the option to save as PDF
- **Design Management** — Save, load, delete designs — switch between different layouts
- **Admin Dashboard** — Manage categories, products, and users from a dedicated admin panel
- **User Authentication** — Register, login, and role-based access (admin vs regular users)
- **Clipboard Support** — Cut and paste products between shelves
- **Quantity Editing** — Adjust product quantities per shelf placement

## 🛠 Tech Stack

| Layer       | Technology                                      |
|-------------|--------------------------------------------------|
| Framework   | [Next.js 14](https://nextjs.org/) (App Router)   |
| Language    | TypeScript                                       |
| Database    | PostgreSQL via [Prisma ORM](https://www.prisma.io/) |
| Auth        | [NextAuth.js v5](https://authjs.dev/) (beta)    |
| Styling     | [Tailwind CSS](https://tailwindcss.com/)         |
| Icons       | [Lucide React](https://lucide.dev/)              |
| PDF Export  | jsPDF + html2canvas                              |
| Notifications | react-hot-toast                                |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** 9+

### Installation

```bash
# Clone the repository
git clone git@github.com:boykekp-png/shelf-re-merchandiser.git
cd shelf-re-merchandiser

# Install dependencies
npm install

# Set up environment variables
cp .env .env.local
# Edit .env.local with your own secret keys

# Set up the database
npx prisma db push

# Seed the database with demo data
npx prisma db seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🔑 Default Login Credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@example.com  | admin123  |

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/                  # Admin dashboard pages
│   │   ├── categories/         # Category CRUD
│   │   ├── products/           # Product CRUD
│   │   └── users/              # User management
│   ├── api/                    # REST API routes
│   │   ├── auth/               # NextAuth + registration
│   │   ├── categories/         # Category endpoints
│   │   ├── designs/            # Design, shelf, item endpoints
│   │   ├── products/           # Product endpoints
│   │   ├── upload/             # File upload
│   │   └── users/              # User endpoints
│   ├── login/                  # Login page
│   └── register/               # Registration page
├── components/
│   ├── design/                 # SaveDesignModal, LoadDesignModal, PrintModal
│   ├── layout/                 # Header, Toolbar
│   ├── product/                # ProductCard, ProductTray, ProductPicker, ProductEdit
│   ├── providers/              # SessionProvider
│   └── shelf/                  # Shelf, ShelfContainer
├── lib/                        # Prisma client, Auth config
├── types/                      # TypeScript type definitions
└── middleware.ts               # Next.js middleware (auth redirects)
```

## 📦 npm Scripts

| Command             | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Start development server             |
| `npm run build`     | Build for production                 |
| `npm run start`     | Start production server              |
| `npm run db:push`   | Push schema to database              |
| `npm run db:seed`   | Seed database with demo data         |
| `npm run db:reset`  | Reset + reseed database              |
| `npm run db:studio` | Open Prisma Studio GUI               |

---

# 🇮🇩 Bahasa Indonesia

**Shelf Re-Merchandiser** adalah alat planogram ritel visual untuk merencanakan dan mengatur tata letak rak toko. Seret dan lepas produk ke rak, simpan berbagai desain, ekspor ke PDF, dan kelola katalog produk — semua dalam antarmuka yang bersih dan modern.

## ✨ Fitur

- **Perencanaan Rak Drag & Drop** — Tempatkan produk di rak grid 12 kolom dengan menyeret dari baki produk atau antar rak
- **Banyak Rak** — Tambah, ganti nama, dan hapus rak untuk membuat tata letak yang lengkap
- **Manajemen Produk** — CRUD lengkap untuk produk dengan kategori, ikon emoji, dan status aktif/nonaktif
- **Pencegahan Tumpang Tindih** — Mencegah produk saling bertumpuk di slot yang sama dengan suara error yang lucu
- **Cetak & Ekspor PDF** — Pratinjau siap cetak dengan opsi simpan sebagai PDF
- **Manajemen Desain** — Simpan, muat, hapus desain — beralih antar layout berbeda
- **Dasbor Admin** — Kelola kategori, produk, dan pengguna dari panel admin khusus
- **Autentikasi Pengguna** — Daftar, login, dan akses berbasis peran (admin vs pengguna biasa)
- **Dukungan Clipboard** — Potong dan tempel produk antar rak
- **Edit Jumlah** — Sesuaikan jumlah produk per penempatan di rak

## 🛠 Teknologi yang Digunakan

| Lapisan      | Teknologi                                        |
|--------------|--------------------------------------------------|
| Framework    | [Next.js 14](https://nextjs.org/) (App Router)   |
| Bahasa       | TypeScript                                       |
| Database     | PostgreSQL via [Prisma ORM](https://www.prisma.io/) |
| Autentikasi  | [NextAuth.js v5](https://authjs.dev/) (beta)    |
| Styling      | [Tailwind CSS](https://tailwindcss.com/)         |
| Ikon         | [Lucide React](https://lucide.dev/)              |
| Ekspor PDF   | jsPDF + html2canvas                              |
| Notifikasi   | react-hot-toast                                  |

## 🚀 Cara Menjalankan

### Prasyarat

- **Node.js** 18+
- **npm** 9+

### Instalasi

```bash
# Clone repositori
git clone git@github.com:boykekp-png/shelf-re-merchandiser.git
cd shelf-re-merchandiser

# Instal dependensi
npm install

# Siapkan environment variables
cp .env .env.local
# Edit .env.local dengan secret key Anda sendiri

# Buat database
npx prisma db push

# Isi database dengan data demo
npx prisma db seed

# Jalankan server pengembangan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 🔑 Kredensial Login Default

| Peran | Email              | Kata Sandi |
|-------|--------------------|------------|
| Admin | admin@example.com  | admin123   |

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── admin/                  # Halaman dasbor admin
│   │   ├── categories/         # CRUD kategori
│   │   ├── products/           # CRUD produk
│   │   └── users/              # Manajemen pengguna
│   ├── api/                    # Rute REST API
│   │   ├── auth/               # NextAuth + registrasi
│   │   ├── categories/         # Endpoint kategori
│   │   ├── designs/            # Endpoint desain, rak, item
│   │   ├── products/           # Endpoint produk
│   │   ├── upload/             # Upload file
│   │   └── users/              # Endpoint pengguna
│   ├── login/                  # Halaman login
│   └── register/               # Halaman registrasi
├── components/
│   ├── design/                 # Modal Simpan, Muat, Cetak
│   ├── layout/                 # Header, Toolbar
│   ├── product/                # Kartu Produk, Baki Produk, Pemilih Produk, Edit Produk
│   ├── providers/              # SessionProvider
│   └── shelf/                  # Rak, Kontainer Rak
├── lib/                        # Prisma client, konfigurasi Auth
├── types/                      # Definisi tipe TypeScript
└── middleware.ts               # Middleware Next.js (pengalihan auth)
```

## 📦 Skrip npm

| Perintah            | Deskripsi                            |
|---------------------|--------------------------------------|
| `npm run dev`       | Mulai server pengembangan            |
| `npm run build`     | Build untuk produksi                 |
| `npm run start`     | Mulai server produksi                |
| `npm run db:push`   | Dorong skema ke database             |
| `npm run db:seed`   | Isi database dengan data demo        |
| `npm run db:reset`  | Reset + isi ulang database           |
| `npm run db:studio` | Buka GUI Prisma Studio               |