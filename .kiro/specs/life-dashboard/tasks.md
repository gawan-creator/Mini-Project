# Implementation Plan: Life Dashboard

## Overview

Rencana implementasi ini mencakup 9 task utama untuk membangun Life Dashboard — sebuah single-page web app dengan empat komponen (Jam & Sapaan, To-Do List, Focus Timer, Quick Links) menggunakan HTML, CSS, dan Vanilla JavaScript tanpa framework atau backend. Implementasi mengikuti urutan dependensi: setup proyek → utilitas storage → modul-modul komponen → CSS → property-based tests → integrasi akhir.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1"]
    },
    {
      "wave": 2,
      "tasks": ["2"]
    },
    {
      "wave": 3,
      "tasks": ["3", "4", "5", "6", "7"]
    },
    {
      "wave": 4,
      "tasks": ["8"]
    },
    {
      "wave": 5,
      "tasks": ["9"]
    }
  ]
}
```

## Tasks

- [x] 1. Project Setup — Struktur Folder dan File Dasar
  - [x] 1.1 Buat folder `css/` dan `js/` di root proyek
  - [x] 1.2 Buat file `css/style.css` (kosong, siap diisi)
  - [x] 1.3 Buat file `js/app.js` dengan namespace global `LifeDashboard` menggunakan IIFE
  - [x] 1.4 Verifikasi `index.html` sudah merujuk ke `css/style.css` dan `js/app.js` dengan path yang benar
  - [x] 1.5 Hapus atau kosongkan `main.css` dan `main.js` di root (sudah digantikan oleh file di subfolder)
  - **Requires:** TC-1, TC-4
  - **Acceptance Criteria:** Req 5.1, Req 5.4

- [x] 2. LifeDashboard.Storage — Utilitas localStorage
  - [x] 2.1 Implementasikan `LifeDashboard.Storage.get(key, fallback)` — membaca dan mem-parse JSON dari localStorage; mengembalikan `fallback` jika key tidak ada atau terjadi parse error
  - [x] 2.2 Implementasikan `LifeDashboard.Storage.set(key, value)` — menyerialisasi value ke JSON dan menyimpannya ke localStorage; membungkus operasi dalam `try/catch` agar kegagalan (kuota penuh, mode privat) diabaikan secara diam-diam
  - [x] 2.3 Tulis unit test untuk `Storage.get` dan `Storage.set`: key tidak ada, data valid, data rusak (bukan JSON), dan localStorage tidak tersedia
  - **Requires:** TC-2
  - **Acceptance Criteria:** Req 6.1, Req 6.2, Req 6.3

- [x] 3. LifeDashboard.Clock — Jam, Tanggal, dan Sapaan Real-Time
  - [x] 3.1 Implementasikan `_formatTime(date)` — mengembalikan string "HH:MM:SS" dengan zero-padding
  - [x] 3.2 Implementasikan `_formatDate(date)` — mengembalikan string format "Senin, 14 Juli 2025" menggunakan nama hari dan bulan dalam bahasa Indonesia
  - [x] 3.3 Implementasikan `_getGreeting(hour)` — mengembalikan "Selamat Pagi" (jam 5–11), "Selamat Siang" (jam 12–17), atau "Selamat Malam" (jam 18–23 dan 0–4)
  - [x] 3.4 Implementasikan `_tick()` — memperbarui elemen DOM `#clock-time`, `#clock-date`, dan `#clock-greeting` dengan nilai terkini
  - [x] 3.5 Implementasikan `Clock.init()` — memanggil `_tick()` sekali saat inisialisasi, lalu memulai `setInterval` dengan interval 1000ms
  - [x] 3.6 Tulis unit test untuk `_formatTime`, `_formatDate`, dan `_getGreeting` dengan contoh konkret (termasuk nilai batas jam 0, 4, 5, 11, 12, 17, 18, 23)
  - **Requires:** TC-1
  - **Acceptance Criteria:** Req 1.1, Req 1.2, Req 1.3, Req 1.4, Req 1.5, Req 1.6, Req 1.7

- [x] 4. LifeDashboard.Todo — Manajemen Daftar Tugas
  - [x] 4.1 Definisikan struktur data Task object: `{ id, text, completed, createdAt }`; gunakan `crypto.randomUUID()` dengan fallback ke `Date.now().toString() + Math.random().toString(36).slice(2)`
  - [x] 4.2 Implementasikan `_load()` — membaca array tugas dari `Storage.get('lifedash_tasks', [])` dan mengisi `_tasks`
  - [x] 4.3 Implementasikan `_save()` — menulis `_tasks` ke `Storage.set('lifedash_tasks', _tasks)`
  - [x] 4.4 Implementasikan `_addTask(text)` — validasi `text.trim()` tidak kosong; buat Task baru dengan `completed: false`; panggil `_save()` dan `_render()`
  - [x] 4.5 Implementasikan `_editTask(id, text)` — validasi `text.trim()` tidak kosong; update teks tugas yang sesuai id; panggil `_save()` dan `_render()`
  - [x] 4.6 Implementasikan `_toggleTask(id)` — balik nilai `completed` pada tugas yang sesuai id; panggil `_save()` dan `_render()`
  - [x] 4.7 Implementasikan `_deleteTask(id)` — hapus tugas dengan id tersebut dari `_tasks`; panggil `_save()` dan `_render()`
  - [x] 4.8 Implementasikan `_render()` — render ulang seluruh `<ul id="todo-list">` berdasarkan `_tasks`; tugas selesai ditampilkan dengan teks dicoret; gunakan `data-id` pada setiap `<li>`
  - [x] 4.9 Implementasikan `Todo.init()` — panggil `_load()`, `_render()`, dan pasang event listener pada input, tombol tambah (termasuk Enter), dan `<ul>` (event delegation untuk edit, toggle, delete)
  - [x] 4.10 Tulis unit test untuk `_addTask`, `_editTask`, `_toggleTask`, `_deleteTask`: penambahan valid, penolakan input kosong/whitespace, toggle bolak-balik, penghapusan permanen, dan persistensi ke localStorage
  - **Requires:** TC-1, TC-2
  - **Acceptance Criteria:** Req 2.1, Req 2.2, Req 2.3, Req 2.4, Req 2.5, Req 2.6, Req 2.7, Req 2.8, Req 2.9, Req 2.10, Req 6.1, Req 6.2

- [x] 5. LifeDashboard.Timer — Focus Timer 25 Menit
  - [x] 5.1 Inisialisasi state: `_remaining = 1500` (25 × 60 detik) dan `_intervalId = null`
  - [x] 5.2 Implementasikan `_render()` — format `_remaining` ke "MM:SS" dan update teks `#timer-display`
  - [x] 5.3 Implementasikan `_tick()` — kurangi `_remaining` sebesar 1; panggil `_render()`; jika `_remaining === 0`, hentikan interval dan panggil `_notify()`
  - [x] 5.4 Implementasikan `_start()` — mulai `setInterval` hanya jika `_intervalId === null` (cegah duplikasi)
  - [x] 5.5 Implementasikan `_stop()` — panggil `clearInterval(_intervalId)` dan set `_intervalId = null` (pause tanpa reset)
  - [x] 5.6 Implementasikan `_reset()` — panggil `_stop()`, set `_remaining = 1500`, panggil `_render()`
  - [x] 5.7 Implementasikan `_notify()` — tampilkan notifikasi kepada pengguna bahwa sesi fokus selesai (gunakan `alert()` atau elemen DOM; tidak boleh melempar error)
  - [x] 5.8 Implementasikan `Timer.init()` — panggil `_render()` dan pasang event listener pada `#timer-start-btn`, `#timer-stop-btn`, dan `#timer-reset-btn`
  - [x] 5.9 Tulis unit test untuk Timer: nilai default 25:00, start memulai countdown, stop menjeda tanpa reset, reset mengembalikan ke 25:00, `_remaining` tidak pernah negatif, notifikasi dipanggil saat mencapai 00:00
  - **Requires:** TC-1
  - **Acceptance Criteria:** Req 3.1, Req 3.2, Req 3.3, Req 3.4, Req 3.5, Req 3.6

- [x] 6. LifeDashboard.Links — Manajemen Tautan Cepat
  - [x] 6.1 Definisikan struktur data Link object: `{ id, name, url }`; gunakan `crypto.randomUUID()` dengan fallback
  - [x] 6.2 Implementasikan `_normalizeUrl(url)` — jika url tidak diawali `http://` atau `https://`, tambahkan awalan `https://`; URL yang sudah memiliki protokol tidak dimodifikasi
  - [x] 6.3 Implementasikan `_load()` — membaca array tautan dari `Storage.get('lifedash_links', [])` dan mengisi `_links`
  - [x] 6.4 Implementasikan `_save()` — menulis `_links` ke `Storage.set('lifedash_links', _links)`
  - [x] 6.5 Implementasikan `_addLink(name, url)` — validasi `name.trim()` dan `url.trim()` tidak kosong (tampilkan pesan error di `#links-error` jika gagal); normalisasi URL dengan `_normalizeUrl`; buat Link baru; panggil `_save()` dan `_render()`
  - [x] 6.6 Implementasikan `_deleteLink(id)` — hapus tautan dengan id tersebut dari `_links`; panggil `_save()` dan `_render()`
  - [x] 6.7 Implementasikan `_render()` — render ulang seluruh `<ul id="links-list">`; setiap item berupa `<a>` dengan `target="_blank"` dan `rel="noopener noreferrer"`; gunakan `data-id` pada setiap `<li>`
  - [x] 6.8 Implementasikan `Links.init()` — panggil `_load()`, `_render()`, dan pasang event listener pada tombol simpan dan `<ul>` (event delegation untuk delete)
  - [x] 6.9 Tulis unit test untuk `_addLink`, `_deleteLink`, `_normalizeUrl`: penambahan valid, penolakan nama/URL kosong, normalisasi URL tanpa protokol, URL dengan protokol tidak diubah, penghapusan permanen, dan persistensi ke localStorage
  - **Requires:** TC-1, TC-2
  - **Acceptance Criteria:** Req 4.1, Req 4.2, Req 4.3, Req 4.4, Req 4.5, Req 4.6, Req 4.7, Req 4.8, Req 4.9, Req 6.1, Req 6.2

- [x] 7. CSS Styling dan Responsive Layout
  - [x] 7.1 Definisikan CSS Custom Properties (variabel warna, font, spacing) di `:root`
  - [x] 7.2 Tulis Reset & Base Styles (box-sizing, margin/padding default, font-family)
  - [x] 7.3 Implementasikan layout `.dashboard` sebagai CSS Grid 2×2 untuk desktop (lebar ≥ 1024px): `grid-template-columns: 1fr 1fr`, `gap: 1.5rem`, `padding: 2rem`, `max-width: 1200px`, `margin: 0 auto`
  - [x] 7.4 Tulis gaya dasar `.card` (background, border-radius, padding, box-shadow) yang berlaku untuk semua empat kartu
  - [x] 7.5 Tulis gaya spesifik komponen Clock: ukuran font besar untuk jam, font lebih kecil untuk tanggal, gaya sapaan
  - [x] 7.6 Tulis gaya spesifik komponen Todo: input row, daftar tugas, item tugas aktif vs selesai (teks dicoret), tombol edit/hapus
  - [x] 7.7 Tulis gaya spesifik komponen Timer: tampilan angka besar untuk `#timer-display`, tata letak tombol kontrol
  - [x] 7.8 Tulis gaya spesifik komponen Links: input row, daftar tautan sebagai link yang dapat diklik, pesan error
  - [x] 7.9 Tambahkan responsive breakpoint tablet (`@media (max-width: 1023px)`): ubah grid menjadi 1 kolom
  - [x] 7.10 Tambahkan responsive breakpoint mobile (`@media (max-width: 767px)`): kurangi padding dan gap
  - **Requires:** TC-1, TC-4, NFR-1, NFR-3
  - **Acceptance Criteria:** Req 5.1, Req 5.2, Req 5.3, Req 5.4

- [x] 8. Property-Based Tests menggunakan fast-check
  - [x] 8.1 Setup environment pengujian: buat file `js/app.test.js` (Node.js + jsdom) atau `tests/pbt.html` (browser); instal/muat `fast-check` via CDN atau npm; ekspor fungsi-fungsi murni dari `app.js` agar dapat diuji secara terisolasi
  - [x] 8.2 Tulis PBT **Property 1** — `_formatTime`: untuk semua `Date` valid, output harus cocok dengan regex `/^\d{2}:\d{2}:\d{2}$/` dan setiap segmen harus dalam rentang valid (jam 0–23, menit 0–59, detik 0–59)
    - **Validates: Requirements 1.1**
  - [x] 8.3 Tulis PBT **Property 2** — `_formatDate`: untuk semua `Date` valid, output harus mengandung nama hari Indonesia, angka tanggal, nama bulan Indonesia, dan tahun 4 digit
    - **Validates: Requirements 1.2**
  - [x] 8.4 Tulis PBT **Property 3** — `_getGreeting`: untuk semua integer 0–23, output harus tepat salah satu dari tiga sapaan; jam 5–11 → "Selamat Pagi", jam 12–17 → "Selamat Siang", jam 0–4 dan 18–23 → "Selamat Malam"
    - **Validates: Requirements 1.5, 1.6, 1.7**
  - [x] 8.5 Tulis PBT **Property 4** — `_addTask` valid: untuk semua daftar tugas awal dan string non-whitespace, setelah `_addTask` panjang daftar bertambah tepat 1 dan tugas baru memiliki `completed: false`
    - **Validates: Requirements 2.2**
  - [x] 8.6 Tulis PBT **Property 5** — input whitespace-only ditolak: untuk semua string yang hanya berisi whitespace, `_addTask` dan `_editTask` tidak mengubah daftar tugas
    - **Validates: Requirements 2.3, 2.5**
  - [x] 8.7 Tulis PBT **Property 6** — `_toggleTask`: untuk semua tugas yang ada, `_toggleTask` membalik nilai `completed`; properti lain (id, text, createdAt) tidak berubah
    - **Validates: Requirements 2.6**
  - [x] 8.8 Tulis PBT **Property 7** — `_deleteTask` permanen: untuk semua daftar tugas dengan ≥1 item, setelah `_deleteTask` daftar tidak mengandung id tersebut dan panjang berkurang tepat 1
    - **Validates: Requirements 2.7**
  - [x] 8.9 Tulis PBT **Property 8** — round-trip persistensi tugas: setelah setiap mutasi, `JSON.parse(localStorage.getItem('lifedash_tasks'))` identik dengan `_tasks`; setelah `_load()` pada state kosong, array dipulihkan dengan benar
    - **Validates: Requirements 2.8, 2.9, 6.1, 6.2**
  - [x] 8.10 Tulis PBT **Property 9** — `_addLink` valid: untuk semua pasangan nama dan URL non-kosong, setelah `_addLink` panjang daftar bertambah tepat 1 dan tautan baru memiliki nama dan URL yang sesuai
    - **Validates: Requirements 4.2**
  - [x] 8.11 Tulis PBT **Property 10** — validasi input tautan kosong: untuk semua kombinasi di mana nama atau URL kosong, `_addLink` ditolak dan daftar tidak berubah
    - **Validates: Requirements 4.3**
  - [x] 8.12 Tulis PBT **Property 11** — `_normalizeUrl`: untuk semua string yang tidak diawali `http://` atau `https://`, output diawali `https://`; URL dengan protokol tidak dimodifikasi
    - **Validates: Requirements 4.4**
  - [x] 8.13 Tulis PBT **Property 12** — `_deleteLink` permanen: untuk semua daftar tautan dengan ≥1 item, setelah `_deleteLink` daftar tidak mengandung id tersebut dan panjang berkurang tepat 1
    - **Validates: Requirements 4.6**
  - [x] 8.14 Tulis PBT **Property 13** — round-trip persistensi tautan: setelah setiap mutasi, `JSON.parse(localStorage.getItem('lifedash_links'))` identik dengan `_links`; setelah `_load()` pada state kosong, array dipulihkan dengan benar
    - **Validates: Requirements 4.7, 4.8, 6.1, 6.2**
  - [x] 8.15 Tulis PBT **Property 14** — ketahanan data localStorage rusak: untuk semua string bukan JSON valid, `Storage.get(key, fallback)` tidak melempar exception dan mengembalikan `fallback`
    - **Validates: Requirements 6.3**
  - **Requires:** Task 2, Task 3, Task 4, Task 5, Task 6
  - **Acceptance Criteria:** Semua 14 Correctness Properties dari design.md

- [x] 9. Integrasi dan Final Wiring
  - [x] 9.1 Tambahkan blok inisialisasi di akhir `app.js` yang memanggil `LifeDashboard.Clock.init()`, `LifeDashboard.Todo.init()`, `LifeDashboard.Timer.init()`, dan `LifeDashboard.Links.init()` setelah DOM siap (`DOMContentLoaded` atau di akhir `<body>`)
  - [x] 9.2 Verifikasi semua empat komponen tampil dan berfungsi secara bersamaan di `index.html` tanpa konflik
  - [x] 9.3 Verifikasi data tugas dan tautan bertahan setelah refresh halaman (buka, tambah data, refresh, data masih ada)
  - [x] 9.4 Verifikasi tampilan responsif: buka di lebar desktop (≥1024px) → grid 2×2; perkecil ke tablet (<1024px) → 1 kolom; perkecil ke mobile (<768px) → padding lebih kecil
  - [x] 9.5 Verifikasi tidak ada error di browser console saat halaman dimuat pertama kali dengan localStorage kosong
  - [x] 9.6 Pastikan hanya ada 1 file di `css/` dan 1 file di `js/` sesuai TC-4
  - **Requires:** Task 1, Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8
  - **Acceptance Criteria:** Req 5.1, Req 5.2, Req 5.3, Req 5.4, Req 6.1, Req 6.2, Req 6.3, TC-4

## Notes

- Task 3, 4, 5, 6, dan 7 dapat dikerjakan secara paralel setelah Task 2 selesai karena masing-masing modul bersifat independen.
- Task 8 (PBT) memerlukan fungsi-fungsi murni dari modul Clock, Todo, dan Links sudah diimplementasikan. Pertimbangkan untuk mengekstrak fungsi-fungsi murni (`_formatTime`, `_formatDate`, `_getGreeting`, `_normalizeUrl`) agar dapat diuji tanpa DOM.
- Karena proyek tidak menggunakan build system, PBT dapat dijalankan via Node.js + jsdom (direkomendasikan untuk CI) atau via file HTML terpisah di browser.
- Setiap property test dikonfigurasi dengan minimum 100 iterasi (`numRuns: 100`) sesuai design.md.
- Jangan gunakan `main.css` atau `main.js` di root — semua kode harus berada di `css/style.css` dan `js/app.js` sesuai TC-4.
