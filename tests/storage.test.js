/**
 * Unit tests for LifeDashboard.Storage
 *
 * Covers:
 *  1. Storage.get — key tidak ada → returns fallback
 *  2. Storage.get — data valid (valid JSON) → returns parsed value
 *  3. Storage.get — data rusak (bukan JSON valid) → returns fallback
 *  4. Storage.set — menyimpan data valid ke localStorage
 *  5. Storage.set — localStorage tidak tersedia (setItem throws) → does NOT throw, fails silently
 *
 * Run with: node tests/storage.test.js
 */

'use strict';

// ─────────────────────────────────────────────
// Mock localStorage
// ─────────────────────────────────────────────
function createMockLocalStorage() {
  var store = {};
  return {
    getItem: function (key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem: function (key, value) {
      store[key] = String(value);
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
    _store: store
  };
}

// ─────────────────────────────────────────────
// Extract Storage module logic (mirrors js/app.js)
// ─────────────────────────────────────────────
function createStorage(ls) {
  return {
    get: function (key, fallback) {
      try {
        var raw = ls.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        ls.setItem(key, JSON.stringify(value));
      } catch (e) {
        // Kegagalan diabaikan secara diam-diam
      }
    }
  };
}

// ─────────────────────────────────────────────
// Minimal test runner
// ─────────────────────────────────────────────
var passed = 0;
var failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('  ✓ ' + message);
    passed++;
  } else {
    console.error('  ✗ ' + message);
    failed++;
  }
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function describe(suiteName, fn) {
  console.log('\n' + suiteName);
  fn();
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('Storage.get — key tidak ada', function () {
  var ls = createMockLocalStorage();
  var Storage = createStorage(ls);

  assert(
    Storage.get('nonexistent_key', 'default_value') === 'default_value',
    'mengembalikan fallback string jika key tidak ada'
  );

  assert(
    Storage.get('another_missing_key', 42) === 42,
    'mengembalikan fallback number jika key tidak ada'
  );

  assert(
    deepEqual(Storage.get('missing_array_key', []), []),
    'mengembalikan fallback array kosong jika key tidak ada'
  );

  assert(
    Storage.get('missing_null_fallback', null) === null,
    'mengembalikan fallback null jika key tidak ada'
  );
});

describe('Storage.get — data valid (valid JSON)', function () {
  var ls = createMockLocalStorage();
  var Storage = createStorage(ls);

  // Simpan data valid secara langsung ke mock
  ls.setItem('test_string', JSON.stringify('hello'));
  ls.setItem('test_number', JSON.stringify(123));
  ls.setItem('test_array', JSON.stringify([1, 2, 3]));
  ls.setItem('test_object', JSON.stringify({ a: 1, b: 'two' }));
  ls.setItem('test_boolean', JSON.stringify(true));

  assert(
    Storage.get('test_string', null) === 'hello',
    'mem-parse string JSON dengan benar'
  );

  assert(
    Storage.get('test_number', null) === 123,
    'mem-parse number JSON dengan benar'
  );

  assert(
    deepEqual(Storage.get('test_array', null), [1, 2, 3]),
    'mem-parse array JSON dengan benar'
  );

  assert(
    deepEqual(Storage.get('test_object', null), { a: 1, b: 'two' }),
    'mem-parse object JSON dengan benar'
  );

  assert(
    Storage.get('test_boolean', null) === true,
    'mem-parse boolean JSON dengan benar'
  );
});

describe('Storage.get — data rusak (bukan JSON valid)', function () {
  var ls = createMockLocalStorage();
  var Storage = createStorage(ls);

  // Simpan data rusak secara langsung (bukan JSON valid)
  ls.setItem('corrupt_1', 'ini bukan json');
  ls.setItem('corrupt_2', '{key: value}');       // JSON tidak valid (key tanpa kutip)
  ls.setItem('corrupt_3', '[1, 2, 3');            // JSON terpotong
  ls.setItem('corrupt_4', 'undefined');           // bukan JSON valid
  ls.setItem('corrupt_5', '');                    // string kosong

  assert(
    Storage.get('corrupt_1', 'fallback') === 'fallback',
    'mengembalikan fallback untuk string acak bukan JSON'
  );

  assert(
    Storage.get('corrupt_2', 'fallback') === 'fallback',
    'mengembalikan fallback untuk object JSON tidak valid'
  );

  assert(
    Storage.get('corrupt_3', 'fallback') === 'fallback',
    'mengembalikan fallback untuk JSON terpotong'
  );

  assert(
    Storage.get('corrupt_4', 'fallback') === 'fallback',
    'mengembalikan fallback untuk string "undefined"'
  );

  assert(
    Storage.get('corrupt_5', 'fallback') === 'fallback',
    'mengembalikan fallback untuk string kosong'
  );
});

describe('Storage.set — menyimpan data valid ke localStorage', function () {
  var ls = createMockLocalStorage();
  var Storage = createStorage(ls);

  Storage.set('save_string', 'world');
  assert(
    ls.getItem('save_string') === JSON.stringify('world'),
    'menyimpan string sebagai JSON ke localStorage'
  );

  Storage.set('save_number', 99);
  assert(
    ls.getItem('save_number') === JSON.stringify(99),
    'menyimpan number sebagai JSON ke localStorage'
  );

  Storage.set('save_array', [10, 20, 30]);
  assert(
    ls.getItem('save_array') === JSON.stringify([10, 20, 30]),
    'menyimpan array sebagai JSON ke localStorage'
  );

  Storage.set('save_object', { x: 1, y: 2 });
  assert(
    ls.getItem('save_object') === JSON.stringify({ x: 1, y: 2 }),
    'menyimpan object sebagai JSON ke localStorage'
  );

  // Verifikasi round-trip: set lalu get mengembalikan nilai asli
  Storage.set('roundtrip_key', { name: 'test', value: [1, 2] });
  assert(
    deepEqual(Storage.get('roundtrip_key', null), { name: 'test', value: [1, 2] }),
    'round-trip set→get mengembalikan nilai asli'
  );
});

describe('Storage.set — localStorage tidak tersedia (setItem throws)', function () {
  // Buat mock localStorage yang selalu melempar error pada setItem
  var brokenLs = {
    getItem: function (key) { return null; },
    setItem: function (key, value) {
      throw new Error('QuotaExceededError: localStorage tidak tersedia');
    }
  };
  var Storage = createStorage(brokenLs);

  var threw = false;
  try {
    Storage.set('any_key', 'any_value');
  } catch (e) {
    threw = true;
  }

  assert(
    !threw,
    'tidak melempar exception ketika localStorage.setItem gagal'
  );

  // Pastikan Storage.get masih berfungsi normal (mengembalikan fallback)
  assert(
    Storage.get('any_key', 'safe_fallback') === 'safe_fallback',
    'Storage.get masih mengembalikan fallback setelah set gagal'
  );

  // Simulasi kuota penuh: beberapa set berturut-turut tidak melempar
  var allSilent = true;
  try {
    Storage.set('key1', 'val1');
    Storage.set('key2', { data: [1, 2, 3] });
    Storage.set('key3', true);
  } catch (e) {
    allSilent = false;
  }

  assert(
    allSilent,
    'beberapa panggilan Storage.set berturut-turut tidak melempar meski localStorage gagal'
  );
});

// ─────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────');
console.log('Hasil: ' + passed + ' passed, ' + failed + ' failed');
console.log('─────────────────────────────────────────────');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
