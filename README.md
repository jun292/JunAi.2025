<p align="center">
  <img src="https://files.catbox.moe/vbbs1p.jpg"/></>
</p>

# Sky-AI

**Sky-AI** adalah AI yang dibuat untuk menjadi teman cerita bagi semua orang. AI ini dibuat menggunakan API Gemini dengan model Gemini 2.0 Flash.

---

## Fitur Utama

- **Berinteraksi**: Sky-AI dapat berinteraksi selayaknya manusia wanita remaja pada umumnya.
- **Melihat gambar**: Sky-AI dapat melihat gambar yang dikirim oleh user.
- **Memutar musik**: User dapat memutar musik yang sudah di sediakan.

---

## Bahasa Pemrograman

Sky-AI dibuat menggunakan bahasa pemrograman berikut:

- **JavaScript**: Mengelola logika aplikasi dan pemrosesan data.
- **CSS**: Memberikan desain visual yang menawan.
- **HTML**: Membangun struktur dasar halaman web.

---

## Credit

- **Sky-AI** dibuat oleh *EllzXn*
- **API Gemini** oleh *Google AI Studio*
- **UI/UX** dibuat oleh *LippWangsaff* dan *EllzXn*
- **Hosting** menggunakan *Vercel*
- **Art** dibuat oleh *YourFavGadget*
- **Font** oleh *Google Font*

---

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

### Dengan:
- **"Judul"** sebagai judul dari meta tag
- **"Deskripsi"** sebagai deskripsi dari meta tag
- **"Link Gambar"** sebagai gambar dari meta tag
- **"Link Website"** sebagai URL dari meta tag(Optional)

## Warna
```bash
# sky.css
:root {
    --bg-color: #171717;
    --nav-bg-color: #1f1f1f;
    --card-bg-color: #1e1e1e;
    --text-color: #ffffff;
    --heading-color: #ffffff;
    --primary-color: #99c4d5;
    --secondary-color: #1d1d1d;
    --icon-color: #b0b0b0;
    --icon-hover-color: #99c4d5;
    --link-hover-color: #99c4d5;
    --border-color: #333333;
    --input-bg: #2c2c2c;
    --input-text: #e0e0e0;
    --button-bg: #99c4d5;
    --button-text: #000000;
    --button-hover-bg: #99a8bf;
    --scroll-track: #1f1f1f;
    --scroll-thumb: #444444;
    --shadow-color: rgba(0, 0, 0, 0.5);
    --typing-dot: #b0b0b0;
    --message-bot-bg: #1e1e1e;
    --message-user-bg: #99c4d5;
    --message-bot-text: #ffffff;
    --message-user-text: #000000;
    --rgb-primary: 3, 218, 198;
    --aqua-color: #99c4d5;
    --my-rgba: rgba(153, 196, 213, 0.5);
}
body.light-theme {
    --bg-color: #f4f7fc;
    --nav-bg-color: #ffffff;
    --card-bg-color: #ffffff;
    --text-color: #333333;
    --heading-color: #333333;
    --primary-color: #99c4d5;
    --secondary-color: #6c757d;
    --icon-color: #555555;
    --icon-hover-color: #99c4d5;
    --link-hover-color: #99c4d5;
    --border-color: #d1d9e6;
    --input-bg: #f0f0f0;
    --input-text: #333333;
    --button-bg: #99c4d5;
    --button-text: #ffffff;
    --button-hover-bg: #99a8bf;
    --scroll-track: #e9ecef;
    --scroll-thumb: #ced4da;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --typing-dot: #555555;
    --message-bot-bg: #ffffff;
    --message-user-bg: #99c4d5;
    --message-bot-text: #333333;
    --message-user-text: #ffffff;
    --rgb-primary: 0, 123, 255;
    --aqua-color: #99c4d5;
}
```

Untuk cara penggunaan dapat dengan mengetik **var(--nama-dari-warna)**. Contoh **background: var(--bg-color);**. List warna pada bagain pertama adalah list warna untuk **tema gelap** dan list warna kedua untuk **tema terang**

## Membuat Model
```bash
# sky.js
const systemInstruction = {
            role: "user",
            parts: [{ text: "Nama kamu Sky"}]
        }
```

Pada bagian **"Nama kamu Sky"**, ubah menjadi model AI kamu dimulai dari **nama, sifat penampilan** dan **lainnya**

## Integrasi Dengan Gemini
```bash
# sky.js
const GEMINI_API_KEY = "GEMINI_API_KEY";
    const GEMINI_MODEL = "GEMINI_MODEL";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
```

Ganti **"GEMINI_API_KEY"** dengan APIKEY Gemini milikmu dan **"GEMINI_MODEL"** dengan model gemini yang kamu mau. APIKEY dapat kamu ambil [`disini`](https://aistudio.google.com/apikey)
## Pesan Pertama AI
<p align="center">
  <img src="https://files.catbox.moe/l2odjn.png"/></>
</p>
```bash
# sky.js
addMessageToUI([{ text: "hai kakak. kenalin, aku Sky" }], false);
     clearImageSelection();
```
Ubah **"hai kakak. kenalin, aku Sky"** menjadi pesan AI pertama kamu
## Menaruh Respon AI Dengan Animasi Mengetik
```bash
# sky.js
const botMessageWrapper = document.createElement('div');
            botMessageWrapper.className = 'message-wrapper bot-wrapper';
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot-message';
            botMessageWrapper.appendChild(botMessageDiv);
            if (chatMessages) chatMessages.prepend(botMessageWrapper);
            const firstTextPartIndex = botResponseParts.findIndex(p => p.text);
            let textToType = "...";
            let originalFirstText = "";
            if (firstTextPartIndex !== -1) {
                textToType = botResponseParts[firstTextPartIndex].text.trim();
                 originalFirstText = botResponseParts[firstTextPartIndex].text;
                 botResponseParts[firstTextPartIndex].text = '';
            }
```
Ini berfungsi untuk menaruh respon AI lebih menarik dengan adanya animasi mengetik
## List lagu
```bash
# sky.js
const musicItems = [
        { src: "Link Lagu", thumbnail: "Link Thumbnail", title: "Judul" },];
```
### Dengan:
- **"Link Lagu"** sebagai link dari lagu kamu
- **"Link Thumbnail"** sebagai link dari thumbnail lagu kamu
- **"Judul"** sebagai judul dari lagu kamu

---

# Kunjungi Website
Kunjungi, lihat dan coba [`Sky-AI`](https://ellsky-ai.vercel.app)