# AI-LOG

## Debug 1: Transaksi tidak langsung update (tidak realtime)
- Prompt: "Saat tambah/hapus transaksi, tampilan tidak berubah sampai halaman di-refresh. Cari penyebabnya di script.js dan index.html, lalu perbaiki."
- Dipakai: penambahan elemen `<p id="pesan">` di index.html. Penyebabnya `document.querySelector('#pesan')` bernilai null, sehingga `pesan.textContent = ...` melempar TypeError sebelum `render(state)` dipanggil. Data sudah masuk localStorage, jadi baru terlihat setelah refresh.
- Diubah: pembuatan `tampilPesan()` sebagai satu fungsi untuk semua pesan, dan `render()` dipecah menjadi `hitungRingkasan()`, `renderDaftar()`, `renderJatah()`.

## Debug 2: Kelengkapan W1-W3 (tanggal tidak tersimpan, tanpa konfirmasi hapus, urutan daftar)
- Prompt: "Cek form dan daftar transaksi terhadap requirement W1-W3: tanggal, konfirmasi hapus, transaksi terbaru di atas, format Rupiah."
- Dipakai: `tanggal` ikut disimpan di objek transaksi dan divalidasi wajib; `confirm()` sebelum hapus; `sort()` berdasarkan tanggal lalu id (terbaru di atas); `toLocaleString('id-ID')` untuk format Rupiah.
- Diubah: kolom kategori tidak lagi dikosongkan setelah submit (sebelumnya `kategori.value = ''` membuat select kosong); variabel lokal `kategori`/`tanggal` di render diganti nama agar tidak bentrok dengan variabel form.

## Debug 3: Jatah harian belum berfungsi (fitur khas Mahasiswa Kos)
- Prompt: "Buat fitur jatah harian untuk persona Mahasiswa Kos: jatah = sisa uang / sisa hari di bulan berjalan, dengan peringatan jika pengeluaran hari ini melebihi jatah, memakai data transaksi yang sama."
- Dipakai: `hitungJatah()` dan `renderJatah()`. Sisa hari = jumlah hari bulan ini - tanggal hari ini + 1, hasil dibulatkan ke bawah dengan `Math.floor`; tanggal hari ini diambil dari waktu lokal, bukan `toISOString()` yang memakai UTC.
- Diubah: versi awal AI memakai input "uang bulanan" terpisah, tetapi logikanya tidak sesuai kebutuhan. Saya hapus input itu dan jatah langsung dihitung dari saldo saat ini dibagi sisa hari bulan ini, serta deskripsi tambahan dihapus agar tampilan sederhana.

## Debug 4: Judul "Jatah Harian" dan nama bulan bertumpuk
- Prompt: "Teks 'Oktober 2026' menimpa judul 'Jatah Harian' di panel jatah harian. Cari CSS penyebabnya."
- Dipakai: override `.Transaksi-bulanan .bulan { margin-top: 4px }`.
- Diubah: `.bulan` aslinya memakai `margin-top: -12px` sehingga naik menimpa judul; nilainya saya ganti menjadi positif.
