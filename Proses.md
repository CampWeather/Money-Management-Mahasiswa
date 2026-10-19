## Persona dan masalahnya

Persona yang saya dapat adalah Mahasiswa Kos (nomor 1). Mahasiswa kos mendapat uang bulanan tetap dari orang tua, tetapi sering kehabisan uang sebelum akhir bulan karena tidak tahu berapa yang boleh dipakai tiap hari.

Karena itu saya membuat website pencatat keuangan sederhana. Website ini menampilkan jatah harian dan memberi peringatan kalau pengeluaran hari ini sudah melebihi jatah.

## Rancangan struktur data

Semua transaksi disimpan sebagai array objek di localStorage dengan kunci `catatan-keuangan-pribadi`. Satu transaksi berbentuk seperti ini:

```js
{
  id: 1,
  keterangan: "Gacoan",
  jumlah: 30000,
  jenis: "pengeluaran",
  kategori: "makanan",
  tanggal: "2026-10-19"
}
```

- `id`: nomor unik, dibuat dari id terbesar yang ada ditambah 1.
- `keterangan`: nama atau catatan transaksi.
- `jumlah`: nominal berupa angka, bukan teks "Rp ...". Dengan begitu bisa dijumlahkan dan dibandingkan. Format Rupiah baru dibuat saat ditampilkan.
- `jenis`: "pemasukan" atau "pengeluaran".
- `kategori`: pilihan tetap (gajian, makanan, transportasi, hiburan, lainnya).
- `tanggal`: teks berformat `YYYY-MM-DD`, supaya mudah dibandingkan dan diurutkan.

## Keputusan desain

Awalnya saya membuat fitur jatah harian dengan input "uang bulanan" yang terpisah, dan rumusnya sisa uang bulanan dibagi sisa hari. Setelah dicoba, hasilnya kurang cocok dengan kebutuhan saya karena angkanya terpisah dari saldo yang sudah ada di ringkasan.

Akhirnya saya menghapus input uang bulanan dan memakai rumus yang lebih sederhana: **jatah harian = saldo saat ini ÷ sisa hari di bulan berjalan** (sisa hari sudah termasuk hari ini, hasilnya dibulatkan ke bawah). Alasannya, saldo sudah dihitung otomatis dari semua transaksi, jadi jatah selalu ikut berubah tanpa input tambahan. Peringatan muncul kalau total pengeluaran hari ini lebih besar dari jatah.

## Bug dan kendala

**1. Transaksi tidak langsung muncul (tidak realtime).**
Setelah klik tambah atau hapus, tampilan baru berubah setelah halaman di-refresh. Setelah saya periksa, di `script.js` ada `document.querySelector('#pesan')`, padahal elemen `#pesan` tidak ada di `index.html`. Hasilnya `null`, sehingga baris `pesan.textContent = ...` menyebabkan error dan `render()` tidak sempat dipanggil. Data sebenarnya sudah masuk ke localStorage, makanya muncul setelah refresh. Solusinya, saya menambahkan `<p id="pesan">` di HTML.

**2. Jatah harian tidak berfungsi dan hitungannya salah.**
Bagian Jatah Harian awalnya hanya tampilan di HTML tanpa logika di JavaScript. Setelah logikanya dibuat, hitungannya masih belum sesuai karena memakai input uang bulanan. Saya memperbaikinya dengan memakai rumus saldo ÷ sisa hari seperti di atas. Tanggal hari ini saya ambil dari waktu lokal (bukan `toISOString()`, yang memakai UTC) supaya tidak bergeser sehari.

**3. Judul "Jatah Harian" tertimpa nama bulan.**
Teks "Oktober 2026" menimpa judul panel. Penyebabnya CSS `.bulan` memakai `margin-top: -12px`, sehingga teks naik ke atas. Saya mengubahnya menjadi nilai positif.

**4. Tanggal tidak tersimpan dan hapus tanpa konfirmasi.**
Transaksi lama tampil "Tanggal tidak tersedia" karena kode awal tidak menyimpan `tanggal`. Saya menambahkan `tanggal` ke objek transaksi dan membuatnya wajib diisi. Hapus sekarang memakai `confirm()` dan daftar diurutkan dari yang terbaru.
