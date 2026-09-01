# 🚀 E-Commerce (Full-Stack)

**Backend:** NestJS | TypeORM | PostgreSQL | Swagger | JWT | Multer
**Frontend:** Next.js | Zustand | Tailwind CSS (dark/light mode)

## Ishga tushirish

```bash
# 1. PostgreSQL'ni run qiling (5433-portda, chunki 5432 lokal Postgres band)
docker-compose up -d

# 2. Backend (3001-portda, chunki 3000 Docker tomonidan band)
npm install
npm run start:dev

# 3. Frontend (yangi terminalda, 3002-portda)
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:3002
- Backend API: http://localhost:3001
- Swagger: http://localhost:3001/api

## Frontend tuzilishi

```
frontend/src/
├── app/                  # Sahifalar (App Router)
│   ├── page.tsx          # Bosh sahifa - mahsulotlar, filter, qidiruv
│   ├── products/[id]/    # Mahsulot sahifasi
│   ├── login/ register/  # Auth
│   ├── cart/             # Savat + buyurtma berish
│   ├── orders/           # Buyurtmalarim
│   └── admin/            # Admin panel (statistika, mahsulotlar, kategoriyalar, buyurtmalar)
├── components/           # Navbar, ProductCard, Pagination, ThemeToggle
├── lib/                  # api.ts (fetch wrapper), types.ts, format.ts
└── store/                # Zustand: auth-store (persist), cart-store
```

## Default Admin

Birinchi ishga tushirishda `.env` dagi ma'lumotlar bilan admin avtomatik yaratiladi:

- Email: `admin@example.com`
- Parol: `admin123`

Production'da `.env` dagi `ADMIN_PASSWORD` va `JWT_SECRET` ni albatta o'zgartiring!

## Endpoints

### Public (autentifikatsiyasiz)
| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/products` | Mahsulotlar (filter: categoryId, search, minPrice, maxPrice, page, limit) |
| GET | `/products/:id` | Bitta mahsulot |
| GET | `/categories` | Kategoriyalar |
| GET | `/categories/:id` | Bitta kategoriya |
| GET | `/uploads/:filename` | Rasmni ko'rish |

### Auth
| Method | Endpoint | Tavsif |
|---|---|---|
| POST | `/auth/register` | Ro'yxatdan o'tish |
| POST | `/auth/login` | Kirish |
| POST | `/auth/refresh` | Tokenlarni yangilash |

### Customer (JWT kerak)
| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/users/me` | Profil |
| PATCH | `/users/me` | Profilni tahrirlash |
| GET | `/cart` | Savatni ko'rish |
| POST | `/cart/add` | Mahsulot qo'shish |
| PATCH | `/cart/item/:id` | Miqdorni o'zgartirish |
| DELETE | `/cart/item/:id` | Olib tashlash |
| DELETE | `/cart/clear` | Savatni tozalash |
| POST | `/orders/create` | Buyurtma yaratish (savatdan) |
| GET | `/orders` | O'z buyurtmalari |
| GET | `/orders/:id` | Bitta buyurtma |
| PATCH | `/orders/:id/cancel` | Bekor qilish (faqat PENDING) |

### Admin (JWT + ADMIN roli)
| Method | Endpoint | Tavsif |
|---|---|---|
| POST | `/admin/categories` | Kategoriya yaratish |
| PATCH | `/admin/categories/:id` | Tahrirlash |
| DELETE | `/admin/categories/:id` | O'chirish |
| POST | `/admin/products` | Mahsulot qo'shish (multipart, image bilan) |
| PATCH | `/admin/products/:id` | Tahrirlash |
| DELETE | `/admin/products/:id` | O'chirish (soft-delete) |
| GET | `/admin/orders` | Barcha buyurtmalar |
| PATCH | `/admin/orders/:id/status` | Status o'zgartirish |
| GET | `/admin/stats` | Statistika |
| POST | `/upload` | Rasm yuklash |

## Muhim tafsilotlar

- **Attributes (JSONB)** — mahsulot yaratishda `attributes` JSON string ko'rinishida yuboriladi (multipart/form-data bo'lgani uchun), masalan: `{"type":"phone","brand":"Samsung","ram":"8GB"}`. Server tomonda validatsiya qilinib, jsonb ustunga yoziladi.
- **Stock management** — buyurtma yaratishda transaction ichida `pessimistic_write` lock bilan stock kamaytiriladi. Buyurtma bekor qilinsa stock qaytariladi.
- **Order tarixi** — `order_items` da `priceAtPurchase` va `productAttributes` nusxasi saqlanadi, keyin mahsulot o'zgarsa ham tarix buzilmaydi.
- **Rasm** — mahsulot yangilanganda eski rasm diskdan o'chiriladi. Fayl turi va hajmi (5MB) tekshiriladi.
- **Response format** — barcha javoblar `{ success: true, data: ... }` formatida (TransformInterceptor).
- **Migratsiyalar** — development'da `synchronize: true`. Production uchun: `npm run migration:generate -- src/database/migrations/Init` va `npm run migration:run`.
