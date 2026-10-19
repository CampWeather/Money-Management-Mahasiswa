const state = { transaksi: [], filter: 'semua' };
const form = document.querySelector('#form-transaksi');
const keterangan = document.querySelector('#keterangan');
const jumlah = document.querySelector('#jumlah');
const jenis = document.querySelector('#jenis');
const pesan = document.querySelector('#pesan');
const daftar = document.querySelector('#daftar');
const filter = document.querySelector('#filter');
const kunci = 'catatan-keuangan-pribadi';

function rupiah(nilai) {
    return `Rp ${nilai}`;
}

try {
    const tersimpan = JSON.parse(localStorage.getItem(kunci) || '[]');
    if (Array.isArray(tersimpan)) {
        state.transaksi = tersimpan.filter(item =>
            item && typeof item.id === 'number' &&
            typeof item.keterangan === 'string' &&
            typeof item.jumlah === 'number' &&
            item.jumlah > 0 && item.jumlah <= 1000000000000 &&
            (item.jenis === 'pemasukan' || item.jenis === 'pengeluaran')
        );
    }
} catch (error) {
    pesan.textContent = 'Data tersimpan tidak dapat dibaca. Kamu tetap bisa mencatat transaksi baru.';
}

function simpan(data) {
    try {
        localStorage.setItem(kunci, JSON.stringify(data.transaksi));
        return true;
    } catch (error) {
        pesan.textContent = 'Penyimpanan tidak tersedia. Catatan hanya tersimpan selama halaman ini terbuka.';
        return false;
    }
}

function render(data) {
    let masuk = 0;
    let keluar = 0;
    for (const item of data.transaksi) {
        if (item.jenis === 'pemasukan') {
            masuk += item.jumlah;
        } else {
            keluar += item.jumlah;
        }
    }
    document.querySelector('#saldo').textContent = rupiah(masuk - keluar);
    document.querySelector('#masuk').textContent = rupiah(masuk);
    document.querySelector('#keluar').textContent = rupiah(keluar);
    daftar.textContent = '';
    const hasil = data.transaksi.filter(item =>
        data.filter === 'semua' || item.jenis === data.filter 
    );
    if (hasil.length === 0) {
        const kosong = document.createElement('li');
        kosong.className = 'kosong';
        kosong.textContent = 'Belum ada transaksi untuk ditampilkan.';
        daftar.appendChild(kosong);
    }
    for (const item of hasil) {
        const baris = document.createElement('li');
        baris.className = 'transaksi';
        const detail = document.createElement('div');
        detail.className = 'detail';
        const judul = document.createElement('strong');
        judul.textContent = item.keterangan;
        const kategori = document.createElement('p');
        kategori.textContent = item.kategori || 'Tidak ada kategori';
        const tanggal = document.createElement('p');
        tanggal.textContent = item.tanggal || 'Tanggal tidak tersedia';
        detail.appendChild(judul);
        detail.appendChild(kategori);
        detail.appendChild(tanggal);
        const nominal = document.createElement('span');
        nominal.className = `nominal ${item.jenis}`;
        nominal.textContent = rupiah(item.jumlah);
        const hapus = document.createElement('button');
        hapus.type = 'button';
        hapus.className = 'hapus';
        hapus.textContent = 'Hapus';
        hapus.setAttribute('aria-label', `Hapus transaksi ${item.keterangan}`);

        hapus.addEventListener('click', () => {
            data.transaksi = data.transaksi.filter(transaksi => transaksi.id !== item.id);
            if (simpan(data)) pesan.textContent = 'Transaksi dihapus.';
            render(data);
        });
        baris.appendChild(detail);
        baris.appendChild(nominal);
        baris.appendChild(hapus);
        daftar.appendChild(baris);
    }
}

form.addEventListener('submit', event => {
    event.preventDefault();
    const nama = keterangan.value.trim();
    const nilai = Number(jumlah.value);
    if (nama === '' || !Number.isFinite(nilai) || nilai <= 0 || nilai > 1000000000000 || !Number.isInteger(nilai)) {
        pesan.textContent = 'Isi keterangan dan jumlah berupa bilangan bulat positif, maksimal Rp 1000000000000.';
        return;
    }
    let id = 1;
    for (const item of state.transaksi) {
        if (item.id >= id) id = item.id + 1;
    }
    state.transaksi.push({ id: id, keterangan: nama, jumlah: nilai, jenis: jenis.value, kategori: kategori.value });
    if (simpan(state)) pesan.textContent = 'Transaksi ditambahkan dan disimpan.';
    render(state);
    keterangan.value = '';
    jumlah.value = '';
    kategori.value = '';
    keterangan.focus();
});

filter.addEventListener('change', event => {
    state.filter = event.target.value;
    render(state);
});

render(state);