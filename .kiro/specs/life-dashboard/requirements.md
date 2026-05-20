# Requirements Document

## Introduction

Life Dashboard adalah sebuah halaman web *single-page* yang berfungsi sebagai pusat kendali kehidupan sehari-hari pengguna. Dasbor ini menggabungkan empat komponen utama dalam satu tampilan: jam/waktu saat ini beserta sapaan berdasarkan waktu, daftar tugas (to-do list), pengatur waktu fokus sederhana 25 menit, dan tautan cepat ke situs web favorit. Aplikasi ini berjalan sepenuhnya di sisi klien menggunakan HTML, CSS, dan Vanilla JavaScript tanpa memerlukan server backend, dengan data disimpan di `localStorage` browser.

## Glossary

- **Dasbor**: Halaman web utama yang menampilkan semua komponen Life Dashboard.
- **Komponen_Jam**: Bagian dasbor yang menampilkan waktu, tanggal saat ini secara real-time, dan pesan sapaan berdasarkan waktu.
- **Komponen_Tugas**: Bagian dasbor yang mengelola daftar tugas pengguna (to-do list).
- **Tugas**: Satu item pekerjaan yang perlu diselesaikan oleh pengguna, memiliki status aktif atau selesai.
- **Komponen_Timer**: Bagian dasbor yang menyediakan hitungan mundur fokus sederhana selama 25 menit.
- **Sesi_Fokus**: Periode kerja terjadwal dengan durasi 25 menit.
- **Komponen_Tautan**: Bagian dasbor yang menyimpan dan menampilkan tautan cepat ke situs web favorit pengguna.
- **Tautan**: Satu entri berisi nama tampilan dan URL situs web favorit.
- **LocalStorage**: Mekanisme penyimpanan data di browser pengguna yang bersifat persisten antar sesi.

---

## Technical Constraints

- **TC-1: Technology Stack** — Struktur halaman menggunakan HTML, tampilan menggunakan CSS, dan logika menggunakan Vanilla JavaScript (tanpa framework seperti React, Vue, atau sejenisnya). Tidak diperlukan server backend.
- **TC-2: Data Storage** — Semua data pengguna disimpan menggunakan browser Local Storage API. Tidak ada data yang dikirim ke server eksternal; seluruh data bersifat client-side only.
- **TC-3: Browser Compatibility** — Aplikasi harus berjalan dengan baik di browser modern (Chrome, Firefox, Edge, Safari) dan dapat digunakan sebagai standalone web app maupun browser extension.
- **TC-4: Folder Structure** — Hanya boleh ada 1 file CSS di dalam folder `css/` dan 1 file JavaScript di dalam folder `js/`. Kode harus bersih dan mudah dibaca.

---

## Non-Functional Requirements

- **NFR-1: Simplicity** — Antarmuka bersih dan minimal, mudah dipahami dan digunakan tanpa konfigurasi atau setup yang rumit.
- **NFR-2: Performance** — Waktu muat halaman cepat, interaksi UI responsif, dan tidak ada lag yang terasa saat memperbarui data.
- **NFR-3: Visual Design** — Tampilan ramah pengguna dengan hierarki visual yang jelas dan tipografi yang mudah dibaca.

---

## Requirements

### Requirement 1: Tampilan Jam, Tanggal, dan Sapaan Real-Time

**User Story:** Sebagai pengguna, saya ingin melihat jam, tanggal saat ini, dan sapaan yang sesuai dengan waktu secara real-time, agar saya selalu mengetahui waktu dan merasa disambut saat membuka dasbor.

#### Acceptance Criteria

1. THE Komponen_Jam SHALL menampilkan waktu saat ini dalam format jam:menit:detik (HH:MM:SS).
2. THE Komponen_Jam SHALL menampilkan tanggal saat ini dalam format hari, tanggal bulan tahun (contoh: Senin, 14 Juli 2025).
3. WHEN halaman dimuat, THE Komponen_Jam SHALL mulai memperbarui tampilan waktu setiap 1 detik.
4. WHILE halaman terbuka di browser, THE Komponen_Jam SHALL terus memperbarui waktu secara akurat tanpa interaksi pengguna.
5. WHEN jam lokal berada antara 05:00 dan 11:59, THE Komponen_Jam SHALL menampilkan pesan sapaan "Selamat Pagi".
6. WHEN jam lokal berada antara 12:00 dan 17:59, THE Komponen_Jam SHALL menampilkan pesan sapaan "Selamat Siang".
7. WHEN jam lokal berada antara 18:00 dan 23:59 atau antara 00:00 dan 04:59, THE Komponen_Jam SHALL menampilkan pesan sapaan "Selamat Malam".

---

### Requirement 2: Manajemen Daftar Tugas (To-Do List)

**User Story:** Sebagai pengguna, saya ingin mengelola daftar tugas harian saya, agar saya dapat melacak, mengedit, dan menyelesaikan pekerjaan yang perlu diselesaikan.

#### Acceptance Criteria

1. THE Komponen_Tugas SHALL menyediakan kolom input teks untuk memasukkan nama tugas baru.
2. WHEN pengguna memasukkan teks tugas dan menekan tombol tambah atau tombol Enter, THE Komponen_Tugas SHALL menambahkan tugas baru ke daftar dengan status aktif.
3. IF pengguna mencoba menambahkan tugas dengan input teks kosong, THEN THE Komponen_Tugas SHALL menolak penambahan dan tidak mengubah daftar tugas.
4. WHEN pengguna memilih untuk mengedit sebuah tugas, THE Komponen_Tugas SHALL memungkinkan pengguna mengubah teks tugas tersebut dan menyimpan perubahan.
5. IF pengguna menyimpan hasil edit dengan teks kosong, THEN THE Komponen_Tugas SHALL menolak perubahan dan mempertahankan teks tugas sebelumnya.
6. WHEN pengguna menandai sebuah tugas sebagai selesai, THE Komponen_Tugas SHALL mengubah tampilan tugas tersebut untuk membedakannya secara visual dari tugas aktif (contoh: teks dicoret).
7. WHEN pengguna menghapus sebuah tugas, THE Komponen_Tugas SHALL menghapus tugas tersebut dari daftar secara permanen.
8. WHEN pengguna menambah, mengedit, menyelesaikan, atau menghapus tugas, THE Komponen_Tugas SHALL menyimpan seluruh daftar tugas terbaru ke LocalStorage.
9. WHEN halaman dimuat, THE Komponen_Tugas SHALL memuat dan menampilkan daftar tugas yang tersimpan di LocalStorage.
10. IF tidak ada data tugas di LocalStorage, THEN THE Komponen_Tugas SHALL menampilkan daftar kosong tanpa pesan error.

---

### Requirement 3: Pengatur Waktu Fokus (Focus Timer)

**User Story:** Sebagai pengguna, saya ingin menggunakan timer fokus 25 menit dengan kontrol sederhana, agar saya dapat mengatur sesi kerja saya dengan mudah.

#### Acceptance Criteria

1. THE Komponen_Timer SHALL menampilkan hitungan mundur dalam format menit:detik (MM:SS).
2. THE Komponen_Timer SHALL memiliki durasi default Sesi_Fokus selama 25 menit (25:00).
3. WHEN pengguna menekan tombol mulai, THE Komponen_Timer SHALL memulai hitungan mundur dari durasi yang sedang ditampilkan.
4. WHEN pengguna menekan tombol berhenti, THE Komponen_Timer SHALL menghentikan hitungan mundur sementara tanpa mereset waktu.
5. WHEN pengguna menekan tombol reset, THE Komponen_Timer SHALL menghentikan hitungan mundur dan mengembalikan waktu ke 25:00.
6. WHEN hitungan mundur mencapai 00:00, THE Komponen_Timer SHALL menampilkan notifikasi kepada pengguna bahwa sesi fokus telah selesai.

---

### Requirement 4: Manajemen Tautan Cepat

**User Story:** Sebagai pengguna, saya ingin menyimpan dan mengakses tautan ke situs web favorit saya dengan cepat, agar saya tidak perlu mengetik atau mencari URL setiap kali ingin mengunjungi situs tersebut.

#### Acceptance Criteria

1. THE Komponen_Tautan SHALL menyediakan form input untuk memasukkan nama tampilan dan URL sebuah Tautan baru.
2. WHEN pengguna mengisi nama dan URL lalu menekan tombol simpan, THE Komponen_Tautan SHALL menambahkan Tautan baru ke daftar tautan.
3. IF pengguna mencoba menyimpan Tautan dengan nama atau URL yang kosong, THEN THE Komponen_Tautan SHALL menolak penyimpanan dan menampilkan pesan bahwa kedua kolom wajib diisi.
4. IF pengguna memasukkan URL yang tidak diawali dengan `http://` atau `https://`, THEN THE Komponen_Tautan SHALL menambahkan awalan `https://` secara otomatis sebelum menyimpan.
5. WHEN pengguna mengklik sebuah Tautan, THE Komponen_Tautan SHALL membuka URL tersebut di tab browser baru.
6. WHEN pengguna menghapus sebuah Tautan, THE Komponen_Tautan SHALL menghapus Tautan tersebut dari daftar secara permanen.
7. WHEN pengguna menambah atau menghapus Tautan, THE Komponen_Tautan SHALL menyimpan seluruh daftar Tautan terbaru ke LocalStorage.
8. WHEN halaman dimuat, THE Komponen_Tautan SHALL memuat dan menampilkan daftar Tautan yang tersimpan di LocalStorage.
9. IF tidak ada data Tautan di LocalStorage, THEN THE Komponen_Tautan SHALL menampilkan daftar kosong tanpa pesan error.

---

### Requirement 5: Tampilan dan Tata Letak Dasbor

**User Story:** Sebagai pengguna, saya ingin semua komponen ditampilkan dalam satu halaman yang rapi dan mudah digunakan, agar saya dapat mengakses semua fitur tanpa harus berpindah halaman.

#### Acceptance Criteria

1. THE Dasbor SHALL menampilkan keempat komponen (Komponen_Jam, Komponen_Tugas, Komponen_Timer, Komponen_Tautan) dalam satu halaman tanpa perpindahan halaman.
2. THE Dasbor SHALL menggunakan tata letak responsif yang dapat menyesuaikan tampilan pada layar desktop (lebar ≥ 1024px), tablet (lebar 768px–1023px), dan ponsel (lebar < 768px).
3. THE Dasbor SHALL mempertahankan keterbacaan dan kegunaan semua komponen pada semua ukuran layar yang didukung.
4. WHEN halaman pertama kali dimuat, THE Dasbor SHALL menampilkan semua komponen dalam keadaan siap digunakan tanpa memerlukan konfigurasi awal dari pengguna.

---

### Requirement 6: Persistensi Data Antar Sesi

**User Story:** Sebagai pengguna, saya ingin data saya tersimpan secara otomatis, agar daftar tugas dan tautan favorit saya tidak hilang ketika saya menutup atau me-refresh browser.

#### Acceptance Criteria

1. THE Dasbor SHALL menyimpan data Komponen_Tugas dan Komponen_Tautan ke LocalStorage setiap kali terjadi perubahan data.
2. WHEN halaman dimuat ulang atau dibuka kembali, THE Dasbor SHALL memulihkan data Komponen_Tugas dan Komponen_Tautan dari LocalStorage.
3. IF data di LocalStorage rusak atau tidak dapat diurai (parse error), THEN THE Dasbor SHALL mengabaikan data yang rusak tersebut dan memulai dengan data kosong tanpa menampilkan pesan error teknis kepada pengguna.
