/**
 * Life Dashboard — js/app.js
 *
 * Namespace global: LifeDashboard
 * Pola arsitektur: IIFE + Module Pattern (objek literal)
 * Tidak menggunakan ES Modules agar dapat berjalan tanpa HTTP server.
 */

var LifeDashboard = (function () {
  'use strict';

  // ─────────────────────────────────────────────
  // Storage — utilitas baca/tulis localStorage
  // ─────────────────────────────────────────────
  var Storage = {
    /**
     * Membaca dan mem-parse nilai JSON dari localStorage.
     * @param {string} key
     * @param {*} fallback - nilai default jika key tidak ada atau parse error
     * @returns {*} nilai yang di-parse, atau fallback
     */
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },

    /**
     * Menyerialisasi value ke JSON dan menyimpannya ke localStorage.
     * Kegagalan (kuota penuh, mode privat) diabaikan secara diam-diam.
     * @param {string} key
     * @param {*} value
     */
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // Kegagalan (kuota penuh, mode privat) diabaikan secara diam-diam
      }
    }
  };

  // ─────────────────────────────────────────────
  // Clock — modul jam, tanggal, dan sapaan
  // ─────────────────────────────────────────────
  var Clock = {
    /**
     * Memulai interval 1 detik dan melakukan render pertama kali.
     */
    init: function () {
      var self = this;
      self._tick();
      setInterval(function () {
        self._tick();
      }, 1000);
    },

    /** Dipanggil setiap detik: update DOM jam, tanggal, sapaan. */
    _tick: function () {
      var now = new Date();
      document.getElementById('clock-time').textContent     = this._formatTime(now);
      document.getElementById('clock-date').textContent     = this._formatDate(now);
      document.getElementById('clock-greeting').textContent = this._getGreeting(now.getHours());
    },

    /**
     * @param {number} hour - integer 0–23
     * @returns {string} sapaan sesuai rentang jam
     */
    _getGreeting: function (hour) {
      if (hour >= 5 && hour <= 11) {
        return 'Selamat Pagi';
      } else if (hour >= 12 && hour <= 17) {
        return 'Selamat Siang';
      } else {
        return 'Selamat Malam';
      }
    },

    /**
     * @param {Date} date
     * @returns {string} format "HH:MM:SS"
     */
    _formatTime: function (date) {
      var hh = String(date.getHours()).padStart(2, '0');
      var mm = String(date.getMinutes()).padStart(2, '0');
      var ss = String(date.getSeconds()).padStart(2, '0');
      return hh + ':' + mm + ':' + ss;
    },

    /**
     * @param {Date} date
     * @returns {string} format "Senin, 14 Juli 2025"
     */
    _formatDate: function (date) {
      var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      var months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      var dayName   = days[date.getDay()];
      var dateNum   = date.getDate();
      var monthName = months[date.getMonth()];
      var year      = date.getFullYear();
      return dayName + ', ' + dateNum + ' ' + monthName + ' ' + year;
    }
  };

  // ─────────────────────────────────────────────
  // Todo — modul manajemen daftar tugas
  // ─────────────────────────────────────────────

  /**
   * @typedef {Object} Task
   * @property {string}  id        - Unique identifier
   * @property {string}  text      - Task description (non-empty, non-whitespace-only)
   * @property {boolean} completed - false = active, true = done
   * @property {number}  createdAt - Unix timestamp (ms) when task was created
   */

  var Todo = {
    /** @type {Array<Task>} */
    _tasks: [],

    /**
     * Menghasilkan ID unik menggunakan crypto.randomUUID() jika tersedia,
     * dengan fallback ke kombinasi Date.now() dan Math.random().
     * @returns {string} ID unik
     */
    _generateId: function () {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      return Date.now().toString() + Math.random().toString(36).slice(2);
    },

    /**
     * Memuat data dari localStorage, melakukan render, dan memasang event listener.
     */
    init: function () {
      var self = this;

      // 1. Muat tugas dari localStorage dan render
      self._load();
      self._render();

      // 2. Referensi elemen DOM
      var input  = document.getElementById('todo-input');
      var addBtn = document.getElementById('todo-add-btn');
      var list   = document.getElementById('todo-list');

      // 3. Tombol "Tambah" — klik
      addBtn.addEventListener('click', function () {
        self._addTask(input.value);
        input.value = '';
      });

      // 4. Input — tekan Enter
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          self._addTask(input.value);
          input.value = '';
        }
      });

      // 5. Event delegation pada <ul> untuk toggle, edit, delete
      list.addEventListener('click', function (event) {
        var actionEl = event.target.closest('[data-action]');
        var itemEl   = event.target.closest('[data-id]');
        if (!actionEl || !itemEl) return;

        var action = actionEl.getAttribute('data-action');
        var id     = itemEl.getAttribute('data-id');

        if (action === 'toggle') {
          self._toggleTask(id);
        } else if (action === 'edit') {
          var newText = window.prompt('Edit tugas:', itemEl.querySelector('.todo__item-text').textContent);
          if (newText !== null) {
            self._editTask(id, newText);
          }
        } else if (action === 'delete') {
          self._deleteTask(id);
        }
      });
    },

    /** Membaca array tugas dari Storage dan mengisi _tasks. */
    _load: function () {
      this._tasks = Storage.get('lifedash_tasks', []);
    },

    /** Menulis _tasks ke Storage. */
    _save: function () {
      Storage.set('lifedash_tasks', this._tasks);
    },

    /** Render ulang seluruh <ul id="todo-list"> berdasarkan _tasks. */
    _render: function () {
      var list = document.getElementById('todo-list');
      if (!list) return;

      // Hapus semua anak elemen yang ada
      list.innerHTML = '';

      // Buat elemen <li> untuk setiap tugas
      for (var i = 0; i < this._tasks.length; i++) {
        var task = this._tasks[i];

        // <li data-id="...">
        var li = document.createElement('li');
        li.setAttribute('data-id', task.id);
        li.className = 'todo__item';

        // Checkbox toggle
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('data-action', 'toggle');
        checkbox.setAttribute('aria-label', task.completed ? 'Tandai belum selesai' : 'Tandai selesai');

        // <span> teks tugas — dicoret jika selesai
        var span = document.createElement('span');
        span.className = 'todo__item-text';
        span.textContent = task.text;
        if (task.completed) {
          span.classList.add('todo__item--done');
          span.style.textDecoration = 'line-through';
        }

        // Tombol edit
        var editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.setAttribute('data-action', 'edit');
        editBtn.className = 'todo__btn todo__btn--edit';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('aria-label', 'Edit tugas');

        // Tombol hapus
        var deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.setAttribute('data-action', 'delete');
        deleteBtn.className = 'todo__btn todo__btn--delete';
        deleteBtn.textContent = 'Hapus';
        deleteBtn.setAttribute('aria-label', 'Hapus tugas');

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        list.appendChild(li);
      }
    },

    /**
     * Validasi & tambah task baru → _save() → _render().
     * @param {string} text
     */
    _addTask: function (text) {
      if (text.trim().length === 0) return;
      var newTask = {
        id:        this._generateId(),
        text:      text.trim(),
        completed: false,
        createdAt: Date.now()
      };
      this._tasks.push(newTask);
      this._save();
      this._render();
    },

    /**
     * Validasi & update teks tugas → _save() → _render().
     * @param {string} id
     * @param {string} text
     */
    _editTask: function (id, text) {
      if (text.trim().length === 0) return;
      for (var i = 0; i < this._tasks.length; i++) {
        if (this._tasks[i].id === id) {
          this._tasks[i].text = text.trim();
          break;
        }
      }
      this._save();
      this._render();
    },

    /**
     * Toggle status completed → _save() → _render().
     * @param {string} id
     */
    _toggleTask: function (id) {
      for (var i = 0; i < this._tasks.length; i++) {
        if (this._tasks[i].id === id) {
          this._tasks[i].completed = !this._tasks[i].completed;
          break;
        }
      }
      this._save();
      this._render();
    },

    /**
     * Hapus tugas dengan id tersebut → _save() → _render().
     * @param {string} id
     */
    _deleteTask: function (id) {
      this._tasks = this._tasks.filter(function (task) {
        return task.id !== id;
      });
      this._save();
      this._render();
    }
  };

  // ─────────────────────────────────────────────
  // Timer — modul focus timer 25 menit
  // ─────────────────────────────────────────────
  var Timer = {
    /** @type {number} detik tersisa (default 25 × 60 = 1500) */
    _remaining: 1500,

    /** @type {number|null} ID dari setInterval, null jika tidak berjalan */
    _intervalId: null,

    /**
     * Melakukan render awal dan memasang event listener tombol.
     */
    init: function () {
      // Implementasi lengkap akan ditambahkan di Task 5
    },

    /** Mulai interval jika belum berjalan. */
    _start: function () {
      // Implementasi lengkap akan ditambahkan di Task 5
    },

    /** Hentikan interval (pause tanpa reset). */
    _stop: function () {
      // Implementasi lengkap akan ditambahkan di Task 5
    },

    /** Hentikan interval dan kembalikan _remaining ke 1500. */
    _reset: function () {
      // Implementasi lengkap akan ditambahkan di Task 5
    },

    /** Kurangi _remaining, render, cek selesai. */
    _tick: function () {
      // Implementasi lengkap akan ditambahkan di Task 5
    },

    /** Update teks #timer-display. */
    _render: function () {
      // Implementasi lengkap akan ditambahkan di Task 5
    },

    /** Tampilkan notifikasi sesi selesai. */
    _notify: function () {
      // Implementasi lengkap akan ditambahkan di Task 5
    }
  };

  // ─────────────────────────────────────────────
  // Links — modul manajemen tautan cepat
  // ─────────────────────────────────────────────
  var Links = {
    /** @type {Array<{id: string, name: string, url: string}>} */
    _links: [],

    /**
     * Memuat data dari localStorage, melakukan render, dan memasang event listener.
     */
    init: function () {
      // Implementasi lengkap akan ditambahkan di Task 6
    },

    /** Membaca array tautan dari Storage dan mengisi _links. */
    _load: function () {
      // Implementasi lengkap akan ditambahkan di Task 6
    },

    /** Menulis _links ke Storage. */
    _save: function () {
      // Implementasi lengkap akan ditambahkan di Task 6
    },

    /** Render ulang seluruh <ul id="links-list">. */
    _render: function () {
      // Implementasi lengkap akan ditambahkan di Task 6
    },

    /**
     * Validasi, normalisasi URL → _save() → _render().
     * @param {string} name
     * @param {string} url
     */
    _addLink: function (name, url) {
      // Implementasi lengkap akan ditambahkan di Task 6
    },

    /**
     * Hapus tautan dengan id tersebut → _save() → _render().
     * @param {string} id
     */
    _deleteLink: function (id) {
      // Implementasi lengkap akan ditambahkan di Task 6
    },

    /**
     * Tambah "https://" jika URL tidak memiliki protokol.
     * @param {string} url
     * @returns {string}
     */
    _normalizeUrl: function (url) {
      // Implementasi lengkap akan ditambahkan di Task 6
    }
  };

  // ─────────────────────────────────────────────
  // Public API — ekspor namespace LifeDashboard
  // ─────────────────────────────────────────────
  return {
    Storage: Storage,
    Clock:   Clock,
    Todo:    Todo,
    Timer:   Timer,
    Links:   Links
  };

}());
