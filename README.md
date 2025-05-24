<p align="center">
  <img src="https://files.catbox.moe/vbbs1p.jpg"/></>
</p>

# Sky-AI

**Sky-AI** adalah AI yang dibuat untuk menjadi teman cerita bagi semua orang. AI ini dibuat menggunakan API Gemini dengan model Gemini 2.0 Flash.

## Fitur Utama

- **Berinteraksi**: Sky-AI dapat berinteraksi selayaknya manusia wanita remaja pada umumnya.
- **Melihat gambar**: Sky-AI dapat melihat gambar yang dikirim oleh user.
- **Memutar musik**: User dapat memutar musik yang sudah di sediakan.

## Bahasa Pemrograman

Sky-AI dibuat menggunakan bahasa pemrograman berikut:

- **JavaScript**: Mengelola logika aplikasi dan pemrosesan data.
- **CSS**: Memberikan desain visual yang menawan.
- **HTML**: Membangun struktur dasar halaman web.

## Credit

- **Sky-AI** dibuat oleh *EllzXn*
- **API Gemini** oleh *Google AI Studio*
- **UI/UX** dibuat oleh *LippWangsaff* dan *EllzXn*
- **Hosting** menggunakan *Vercel*
- **Art** dibuat oleh *YourFavGadget*
- **Font** oleh *Google Font*

# Lihat Website
[`Sky-AI`](https://ellsky-ai.vercel.app)

# Dokumentasi
Menampilkan cara kerja Sky-AI

## Membuat Meta Tag
<p align="center">
  <img src="https://files.catbox.moe/6zbp6t.jpg"/></>
</p>

```bash
# index.html

<head>
  <meta property="og:title" content="Judul">
  <meta property="og:description" content="Deskripsi">
  <meta property="og:image" content="Link Gambar">
  <meta property="og:url" content="Link Website">
</head>
```

## Membuat Model
```bash
# sky.js

const systemInstruction = {
            role: "user",
            parts: [{ text: "Nama kamu Sky"}]
        }
```

## Integrasi Dengan Gemini
```bash
# sky.js

const GEMINI_API_KEY = "GEMINI_API_KEY"; // Ganti dengan API Key Anda jika diperlukan
    const GEMINI_MODEL = "GEMINI_MODEL"; // Model yang digunakan
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
```

## Pesan Pertama AI
```bash
# sky.js

addMessageToUI([{ text: "hai kakak. kenalin, aku Sky" }], false);
     clearImageSelection();
```

## List lagu
```bash
# sky.js

const musicItems = [
        { src: "Link Lagu", thumbnail: "Link Thumbnail", title: "Judul" },];
```