<div align="center">
  <img src="frontend/public/vite.svg" width="80" alt="E-Presensi Logo" />
  <h1>E-Presensi</h1>
  <p><b>Sistem Presensi Digital Modern</b></p>
  <p>
    <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
    <img src="https://img.shields.io/badge/Node.js-20-green?logo=node.js" />
    <img src="https://img.shields.io/badge/Fastify-Backend-purple?logo=fastify" />
    <img src="https://img.shields.io/badge/TypeScript-Frontend-blue?logo=typescript" />
    <img src="https://img.shields.io/badge/TailwindCSS-Modern%20UI-9cf?logo=tailwindcss" />
  </p>
</div>

---

## Deskripsi

E-Presensi adalah aplikasi presensi digital modern yang memudahkan pengelolaan kegiatan, absensi, dan tanda tangan elektronik secara efisien dan aman. Dibangun dengan teknologi terbaru, aplikasi ini mendukung tema gelap/terang, PDF export, statistik dashboard, dan desain UI/UX profesional.

## Fitur Utama

- **Manajemen Kegiatan**: Buat, edit, hapus, dan kelola berbagai kegiatan.
- **Presensi Digital**: Absensi peserta dengan tanda tangan elektronik.
- **Export PDF**: Cetak daftar presensi dan tanda tangan ke PDF.
- **Statistik Dashboard**: Lihat rekap kegiatan dan total presensi.
- **Autentikasi Aman**: Login/register dengan email/username, validasi PIN.
- **Tema Gelap/Terang**: UI responsif dan modern dengan glass morphism.
- **Notifikasi Interaktif**: Feedback real-time dengan animasi dan progress bar.
- **Mobile Friendly**: Desain responsif untuk semua perangkat.

## Teknologi

- **Frontend**: React + TypeScript, TailwindCSS, HeroUI, Tabler Icons
- **Backend**: Node.js, Fastify, Sequelize ORM
- **Database**: PostgreSQL/MySQL (konfigurasi di `backend/configs/database.js`)
- **PDF Export**: Server-side dengan wkhtmltopdf

## Instalasi

### 1. Clone Repository
```bash
# Clone project
$ git clone https://github.com/yourusername/e-presensi.git
$ cd e-presensi
```

### 2. Setup Backend
```bash
$ cd backend
$ npm install
# Konfigurasi database di configs/database.js
$ npm run migrate   # Jalankan migrasi database
$ npm run seed      # (Opsional) Seed data awal
$ npm start         # Jalankan server backend
```

### 3. Setup Frontend
```bash
$ cd ../frontend
$ npm install
$ npm run dev       # Jalankan server frontend
```

### 4. Akses Aplikasi
- Buka browser ke `http://localhost:5173` untuk frontend
- Backend berjalan di `http://localhost:8000`

## Struktur Project

```
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── models
│   │   ├── services
│   │   ├── helpers
│   │   ├── middleware
│   │   └── app.js
│   ├── configs
│   └── database
│       ├── migrations
│       └── seeders
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── layouts
│   │   ├── hooks
│   │   ├── config
│   │   └── styles
│   └── public
└── README.md
```

## Konfigurasi & Environment
- Ubah konfigurasi database di `backend/configs/database.js`
- Environment variable dapat ditambahkan sesuai kebutuhan

## Kontribusi

1. Fork repository
2. Buat branch fitur: `git checkout -b fitur-anda`
3. Commit perubahan
4. Pull request ke branch utama

## Lisensi

MIT License

---

> Dibuat dengan ❤️ oleh tim E-Presensi
