const state = { transaksi: [], filter: 'semua' };
const form = document.querySelector('#form-transaksi');
const keterangan = document.querySelector('#keterangan');
const jumlah = document.querySelector('#jumlah');
const inputTanggal = document.querySelector('#tanggal');
const jenis = document.querySelector('#jenis');
const inputKategori = document.querySelector('#kategori');
const pesan = document.querySelector('#pesan');
const daftar = document.querySelector('#daftar');
const filter = document.querySelector('#filter');
const kunci = 'catatan-keuangan-pribadi';
const BATAS = 1000000000000;

function rupiah(nilai) {
    return `Rp ${nilai.toLocaleString('id-ID')}`;
}

function tampilPesan(teks, error) {
    pesan.textContent = teks;
    pesan.className = error ? 'pesan error' : 'pesan';
}

function tanggalHariIni() {
    const d = new Date();
    const bulan = String(d.getMonth() + 1).padStart(2, '0');
    const hari = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${bulan}-${hari}`;
}

function muatData() {
    try {
        const tersimpan = JSON.parse(localStorage.getItem(kunci) || '[]');
        if (Array.isArray(tersimpan)) {
            state.transaksi = tersimpan.filter(item =>
                item && typeof item.id === 'number' &&
                typeof item.keterangan === 'string' &&
                typeof item.jumlah === 'number' &&
                item.jumlah > 0 && item.jumlah <= BATAS &&
                (item.jenis === 'pemasukan' || item.jenis === 'pengeluaran')
            );
        }
    } catch (error) {
        tampilPesan('Data tersimpan tidak dapat dibaca. Kamu tetap bisa mencatat transaksi baru.', true);
    }
}

function simpanData(data) {
    try {
        localStorage.setItem(kunci, JSON.stringify(data.transaksi));
        return true;
    } catch (error) {
        tampilPesan('Penyimpanan tidak tersedia. Catatan hanya tersimpan selama halaman ini terbuka.', true);
        return false;
    }
}

function hitungRingkasan(data) {
    let masuk = 0;
    let keluar = 0;
    for (const item of data.transaksi) {
        if (item.jenis === 'pemasukan') {
            masuk += item.jumlah;
        } else {
            keluar += item.jumlah;
        }
    }
    return { masuk, keluar, saldo: masuk - keluar };
}

function hitungJatah(data) {
    const sekarang = new Date();
    const hariDalamBulan = new Date(sekarang.getFullYear(), sekarang.getMonth() + 1, 0).getDate();
    const sisaHari = hariDalamBulan - sekarang.getDate() + 1;
    const hariIni = tanggalHariIni();
    let keluarHariIni = 0;
    for (const item of data.transaksi) {
        if (item.jenis === 'pengeluaran' && item.tanggal === hariIni) {
            keluarHariIni += item.jumlah;
        }
    }
    const saldo = hitungRingkasan(data).saldo;
    const jatah = saldo > 0 ? Math.floor(saldo / sisaHari) : 0;
    return { jatah, keluarHariIni };
}

function renderJatah(data) {
    const namaBulan = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const status = document.querySelector('#status-jatah-baru');
    const h = hitungJatah(data);
    document.querySelector('#nama-bulan').textContent = namaBulan;
    document.querySelector('#nilai-jatah-baru').textContent = rupiah(h.jatah);
    if (h.keluarHariIni > h.jatah) {
        status.textContent = `Awas! Pengeluaran hari ini melebihi jatah sebesar ${rupiah(h.keluarHariIni - h.jatah)}.`;
        status.className = 'peringatan bahaya';
    } else {
        status.textContent = 'Pengeluaran sehat';
        status.className = 'peringatan';
    }
}

function renderDaftar(data) {
    daftar.textContent = '';
    const hasil = data.transaksi
        .filter(item => data.filter === 'semua' || item.jenis === data.filter)
        .sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || '') || b.id - a.id);
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
        const labelKategori = document.createElement('p');
        labelKategori.textContent = item.kategori || 'Tidak ada kategori';
        const labelTanggal = document.createElement('p');
        labelTanggal.textContent = item.tanggal || 'Tanggal tidak tersedia';
        detail.appendChild(judul);
        detail.appendChild(labelKategori);
        detail.appendChild(labelTanggal);
        const nominal = document.createElement('span');
        nominal.className = `nominal ${item.jenis}`;
        nominal.textContent = rupiah(item.jumlah);
        const hapus = document.createElement('button');
        hapus.type = 'button';
        hapus.className = 'hapus';
        hapus.textContent = 'Hapus';
        hapus.setAttribute('aria-label', `Hapus transaksi ${item.keterangan}`);
        hapus.addEventListener('click', () => {
            if (!confirm(`Hapus transaksi "${item.keterangan}"?`)) return;
            data.transaksi = data.transaksi.filter(transaksi => transaksi.id !== item.id);
            if (simpanData(data)) tampilPesan('Transaksi dihapus.', false);
            render(data);
        });
        baris.appendChild(detail);
        baris.appendChild(nominal);
        baris.appendChild(hapus);
        daftar.appendChild(baris);
    }
}

function render(data) {
    const r = hitungRingkasan(data);
    document.querySelector('#saldo').textContent = rupiah(r.saldo);
    document.querySelector('#masuk').textContent = rupiah(r.masuk);
    document.querySelector('#keluar').textContent = rupiah(r.keluar);
    renderDaftar(data);
    renderJatah(data);
}

form.addEventListener('submit', event => {
    event.preventDefault();
    const nama = keterangan.value.trim();
    const nilai = Number(jumlah.value);
    if (nama === '' || inputTanggal.value === '' || !Number.isFinite(nilai) || nilai <= 0 || nilai > BATAS || !Number.isInteger(nilai)) {
        tampilPesan('Isi keterangan, tanggal, dan jumlah berupa bilangan bulat positif, maksimal Rp 1.000.000.000.000.', true);
        return;
    }
    let id = 1;
    for (const item of state.transaksi) {
        if (item.id >= id) id = item.id + 1;
    }
    state.transaksi.push({
        id: id,
        keterangan: nama,
        jumlah: nilai,
        jenis: jenis.value,
        kategori: inputKategori.value,
        tanggal: inputTanggal.value
    });
    if (simpanData(state)) tampilPesan('Transaksi ditambahkan dan disimpan.', false);
    render(state);
    keterangan.value = '';
    jumlah.value = '';
    keterangan.focus();
});

filter.addEventListener('change', event => {
    state.filter = event.target.value;
    render(state);
});

muatData();
inputTanggal.value = tanggalHariIni();
render(state);