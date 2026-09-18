# Task Management REST API (Technical Test Backend Developer)

REST API Backend untuk sistem Task Management menggunakan AdonisJS 6, TypeScript, PostgreSQL, Lucid ORM, JWT Authentication, dan Integrasi Google Gemini AI.

---

## 📌 Project Overview
Aplikasi ini menyediakan sistem manajemen proyek dan tugas (Task Management) lengkap dengan fitur **AI Command Engine**. Melalui AI Command, pengguna dapat memberikan instruksi dalam bahasa alami (natural language) yang secara otomatis diterjemahkan oleh Gemini AI menjadi operasi basis data (`CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`) yang aman dan berada dalam satu **Atomic Database Transaction**.

---

## 🛠️ Technology Stack
- **Framework**: AdonisJS 6
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL
- **ORM / Database Layer**: Lucid ORM
- **Authentication**: JWT (JSON Web Token)
- **Validation**: VineJS (`@vinejs/vine`)
- **AI Integration**: Google Gemini API (`@google/generative-ai`)

---

## 📋 Requirements
- **Node.js**: v22.0.0 atau lebih baru (Disarankan Node v22.14.0)
- **NPM**: v10.0.0 atau lebih baru
- **PostgreSQL**: v13 atau lebih baru running di local (`127.0.0.1:5432`)
- **Google Gemini API Key**: Kunci API dari Google AI Studio

---

## 🚀 Installation & Setup

### 1. Clone / Download Repository
```bash
git clone <repository-url>
cd task-management-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. PostgreSQL Database Setup
Pastikan service PostgreSQL berjalan di local dan buat database bernama `task_management`:
```sql
CREATE DATABASE task_management;
```

### 4. Environment Configuration (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi dan sesuaikan konfigurasi pada `.env`:
```env
NODE_ENV=development
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
APP_KEY=z7X9vL2mP4qR8sW1tY3uO5iK0jN6bA4c

DB_CONNECTION=pg
PG_HOST=127.0.0.1
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=task_management

JWT_SECRET=super_secret_jwt_key_task_management_2026

GEMINI_API_KEY=your_actual_gemini_api_key
```

### 5. Run Database Migration
Eksekusi migrasi untuk membuat tabel `users`, `projects`, `tasks`, dan `audit_logs`:
```bash
node ace migration:run
```

### 6. Run Database Seeder
Isi data awal (seeders) ke database:
```bash
node ace db:seed
```

### 7. Run Development Server
Jalankan server aplikasi pada environment pengembangan:
```bash
npm run dev
```
Server REST API akan berjalan pada: **`http://localhost:3333`**

---

## 🔑 Default Accounts (Seeders Data)

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `password123` | Full Access (CRUD Project, View Tasks, AI Command) |
| **User** | `user1@example.com` | `password123` | View Projects, View Tasks, AI Command |
| **User** | `user2@example.com` | `password123` | View Projects, View Tasks, AI Command |
| **User** | `user3@example.com` | `password123` | View Projects, View Tasks, AI Command |

---

## 📡 API Endpoints

### 🔐 Authentication
- `POST /register` – Registrasi User / Admin baru. (Public)
- `POST /login` – Login untuk mendapatkan JWT Token. (Public)

### 📁 Projects API
- `POST /projects` – Membuat project baru (Hanya Admin). `created_by` diambil dari user login.
- `GET /projects` – Melihat daftar semua project (Admin & User).
- `GET /projects/:id` – Melihat detail project tertentu (Admin & User).
- `PUT /projects/:id` – Memperbarui project (Hanya Admin).
- `DELETE /projects/:id` – Menghapus project beserta relasi tugasnya (Hanya Admin).

### 📋 Tasks API
- `GET /projects/:id/tasks` – Melihat daftar tugas dalam project tertentu (Admin & User).

### 🤖 AI Command API
- `POST /ai/command` – Eksekusi instruksi bahasa alami untuk mengelola Task (Admin & User).

> **Catatan Auth Header**: Untuk endpoint yang memerlukan autentikasi, sertakan header:  
> `Authorization: Bearer <token>`

---

## 🤖 AI Command Engine & System Prompt

### Quick Concept
Fitur `/ai/command` menerima prompt teks pengguna (misalnya: *"Buatkan task baru 'Fix Login Bug' di project 1 untuk user 3, lalu ubah task ID 5 jadi done"*). Prompt ini dikirim ke **Gemini API** menggunakan **System Prompt** yang sangat ketat untuk menghasilkan JSON terstruktur berisi array operasi (`CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`).

### System Prompt Engineering
```text
You are a task management command parser.
Your job is ONLY to convert the user's natural language instruction into a valid JSON object containing database operations for the Task table.
Allowed operations:
CREATE_TASK
UPDATE_TASK
DELETE_TASK
You MUST NOT modify users, projects, audit_logs, or any table other than tasks.
Never execute SQL.
Never generate SQL.
Never invent IDs.
Never invent database records.
If the user's request attempts to modify or delete a user, reject the request.
Return ONLY valid JSON using this structure:
{
  "operations": []
}
Each operation must contain the required fields.
Allowed task status:
todo
in_progress
done
Allowed priority:
low
medium
high
If the instruction is ambiguous, invalid, or attempts an unauthorized operation, return a JSON error structure instead:
{
  "error": "Error description"
}
```

### Backend Safety & Validation Mechanism
Backend **TIDAK PERNAH** langsung mempercayai output AI:
1. Output JSON dari Gemini di-parse secara aman.
2. Skema dan action divalidasi (`CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`).
3. Seluruh enum (`status`, `priority`) dan tipe data divalidasi.
4. Keberadaan record terkait di database (`project_id`, `assignee_id`, `task_id`) diperiksa secara eksplisit sebelum eksekusi.
5. Permintaan yang mencoba mengubah pengguna (`users`), proyek (`projects`), atau audit log (`audit_logs`) akan langsung ditolak dengan HTTP `400 Bad Request`.

---

## ⚡ Database Transaction & Rollback
Semua operasi basis data hasil parsing AI dalam satu request dijalankan di dalam **SATU Atomic Database Transaction** (`db.transaction`).

- **Contoh Skenario**:
  Jika pengguna meminta 3 operasi: `CREATE_TASK` + `UPDATE_TASK` + `DELETE_TASK`.
  Jika `CREATE_TASK` dan `UPDATE_TASK` berhasil, namun `DELETE_TASK` gagal (misalnya karena `task_id` tidak ditemukan), maka **seluruh transaksi di-rollback**.
- **Hasil**: Basis data kembali tepat ke kondisi semula sebelum request diproses.

---

## 📝 Audit Logging
Setiap kali endpoint `POST /ai/command` dipanggil, backend **WAJIB mencatat tepat 1 record** pada tabel `audit_logs`:
- **Berhasil (`status: success`)**:
  Menyimpan prompt asli pada `request_payload` dan hasil JSON eksekusi pada `response_payload`.
- **Gagal (`status: failed`)**:
  Menyimpan prompt asli, pesan error pada `response_payload`, dan alasan kegagalan pada `failed_reason`.

Audit log dicatat secara independen sehingga meskipun transaksi transaksi task mengalami rollback, record kegagalan audit log tetap tersimpan di basis data.

---

## 📦 Postman Collection

File `Task_Management_API.postman_collection.json` sudah disediakan di root folder project.

### Cara Import ke Postman:
1. Buka Postman app.
2. Klik tombol **Import** (di pojok kiri atas).
3. Pilih file `Task_Management_API.postman_collection.json`.
4. Collection **Task Management API** akan muncul lengkap dengan variabel `{{base_url}}` (default: `http://localhost:3333`) dan `{{token}}`.
5. Jalankan request **Login Admin** atau **Login User**; token JWT akan tersimpan secara otomatis ke dalam variabel `{{token}}`.

---

## 🔒 Security Notes
- **Password Hashing**: Semua kata sandi di-hash menggunakan algoritma bawaan AdonisJS Scrypt (`@adonisjs/core/services/hash`). Plaintext password tidak pernah disimpan.
- **JWT Protection**: Secret disimpan pada file `.env` dan tidak di-commit ke repositori Git.
- **Role Control**: Endpoint modifikasi project dilindungi oleh `RoleMiddleware` khusus admin.
- **AI Sandboxing**: AI hanya menghasilkan JSON instruksi, tanpa akses langsung ke basis data atau eksekusi SQL mentah.
