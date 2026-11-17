# Essence Coffee Website

Website statis Essence Coffee. Semua file berada langsung di satu folder yang sama (tanpa subfolder `assets`, `css`, atau `js`).

## Menjalankan secara lokal
Buka `index.html` di browser. Untuk pengembangan, folder ini juga bisa dibuka dengan Visual Studio Code dan dijalankan memakai ekstensi Live Server.

## Publikasi ke GitHub Pages
1. Buat repository baru di GitHub.
2. Ekstrak ZIP ini.
3. Masuk ke folder `essence-coffee`.
4. Upload **seluruh isi folder** ke root repository, sehingga `index.html` terlihat langsung di halaman utama repository.
5. Buka **Settings → Pages**.
6. Pada **Build and deployment**, pilih **Deploy from a branch**.
7. Pilih branch `main` dan folder `/(root)`, lalu klik **Save**.
8. Tunggu deployment selesai. Alamat website akan muncul di halaman GitHub Pages.

## File utama
- `index.html` — halaman website
- `styles.css` — seluruh styling
- `script.js` — interaksi website dan daftar menu
- `README.md` — panduan ini
- `.nojekyll` — konfigurasi GitHub Pages

Seluruh nama file menggunakan huruf kecil, angka, dan tanda hubung agar konsisten dan aman terhadap sistem file GitHub yang peka huruf besar/kecil.

## Sebelum dipublikasikan
Periksa nomor WhatsApp pada variabel `WA` di `script.js`, serta informasi alamat, jam operasional, harga, dan akun media sosial agar sesuai dengan data resmi.
