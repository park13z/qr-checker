# 📦 GS1-128 Barcode Scanner Web App

Web App สำหรับสแกน และแกะข้อมูล GS1-128 Barcode ด้วยกล้องมือถือ

## ✨ คุณสมบัติ

- ✅ สแกนบาร์โค้ด GS1-128 ด้วยกล้องมือถือ
- ✅ แยกข้อมูล GTIN, วันที่แพ็ก, Lot Number อัตโนมัติ
- ✅ แสดงรูปภาพและข้อมูลสินค้า
- ✅ ใช้งานง่าย ไม่ต้องลงแอป (Web-based)
- ✅ รองรับ iOS และ Android

---

## 🚀 ขั้นตอนการติดตั้ง (Deploy ฟรี)

### ตัวเลือก 1: GitHub Pages (ฉรับ ✅ แนะนำสำหรับเริ่มต้น)

#### 1️⃣ สร้าง Repository บน GitHub
- ไปที่ https://github.com/new
- ตั้งชื่อว่า `qr-checker`
- เลือก "Public"
- Click "Create repository"

#### 2️⃣ Push ไฟล์ขึ้น GitHub
```bash
# เปิด Command Prompt หรือ Terminal ในโฟลเดอร์โปรเจกต์
cd C:\Users\kr_co\QR Checker

# เริ่มต้น git
git init
git add .
git commit -m "Initial commit: GS1 Barcode Scanner"

# เชื่อมต่อกับ GitHub (แทนที่ YOUR_USERNAME ด้วยชื่อ GitHub ของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/qr-checker.git
git branch -M main
git push -u origin main
```

#### 3️⃣ เปิด GitHub Pages
- ไปที่ Settings ของ Repository
- เลือก "Pages" จาก sidebar
- ใน "Source" เลือก "main branch"
- Click "Save"
- รอ 1-2 นาที จากนั้นเว็บจะพร้อมใช้งานที่:
  ```
  https://YOUR_USERNAME.github.io/qr-checker
  ```

---

### ตัวเลือก 2: Netlify (ง่ายอีกขั้น)

#### 1️⃣ Push โปรเจกต์ขึ้น GitHub ก่อน (ตามขั้นตอนด้านบน)

#### 2️⃣ Deploy ด้วย Netlify
- ไปที่ https://netlify.com
- Click "New site from Git"
- เลือก "GitHub" และ authorize
- เลือก Repository `qr-checker`
- ใน Build settings:
  - Build command: (ปล่อยว่าง)
  - Publish directory: `.` (root)
- Click "Deploy site"
- รอสักครู่ แล้วคุณจะได้ URL เหมือน:
  ```
  https://YOUR-SITE-NAME.netlify.app
  ```

---

### ตัวเลือก 3: Firebase Hosting

#### 1️⃣ ติดตั้ง Firebase CLI
```bash
npm install -g firebase-tools
```

#### 2️⃣ เตรียม Firebase
```bash
firebase login
firebase init hosting
# ตอบคำถาม:
# - Select project: สร้างใหม่ หรือ เลือกที่มี
# - Public directory: . (root)
# - Configure single-page app: No
```

#### 3️⃣ Deploy
```bash
firebase deploy
```

ระบบจะให้ URL เหมือน: `https://YOUR-PROJECT.web.app`

---

## 📝 การเพิ่มสินค้า

### แก้ไขไฟล์ `data.js`

```javascript
const productData = {
    "10041220210340": {
        name: "ชื่อสินค้า",
        size: "ขนาด",
        image: "ที่อยู่รูปภาพ"
    },
    // เพิ่มเติม...
};
```

**ตัวอย่าง:**
```javascript
"10041220210344": {
    name: "แพ็คเกจซองใหญ่",
    size: "250 กรัม",
    image: "https://via.placeholder.com/180?text=Package"
}
```

### วิธีเพิ่มรูปภาพ

#### ตัวเลือก A: ใช้ URL จากเน็ต
```javascript
image: "https://example.com/images/product.jpg"
```

#### ตัวเลือก B: เพิ่มรูปลงโปรเจกต์
1. สร้างโฟลเดอร์ `images` ในโปรเจกต์
2. เพิ่มรูปลงไป (เช่น `package_A.jpg`)
3. แก้ไข data.js:
```javascript
image: "images/package_A.jpg"
```
4. Push ขึ้น GitHub ใหม่

---

## 🔧 การใช้งาน

1. **เปิดเว็บ** บนมือถือผ่าน URL ที่ deploy ไป
2. **อนุญาตให้ใช้กล้อง** เมื่อเบราว์เซอร์ขอ
3. **วางบาร์โค้ด** หน้ากล้อง
4. **รอสแกนอัตโนมัติ** ผลจะแสดงใน 1-2 วินาที

---

## 🎨 โครงสร้างไฟล์

```
qr-checker/
├── index.html       (หน้าหลัก)
├── style.css        (สไตล์)
├── app.js           (Logic สแกนและแยกข้อมูล)
├── data.js          (ข้อมูลสินค้า)
├── images/          (รูปสินค้า - ถ้ามี)
└── README.md        (ไฟล์นี้)
```

---

## 🐛 Troubleshooting

| ปัญหา | วิธีแก้ |
|------|--------|
| กล้องไม่เปิด | ต้องใช้ HTTPS (GitHub Pages/Netlify/Firebase ใช้ HTTPS อัตโนมัติ) |
| สแกนไม่ได้ | ตรวจสอบแสง อาจต้องให้กล้องใกล้บาร์โค้ดมากขึ้น |
| ไม่เจอสินค้า | ตรวจสอบ GTIN ใน data.js ให้ตรงกับที่สแกนได้ |
| ผลขึ้น "ไม่พบข้อมูล" | เพิ่มสินค้ากับ GTIN นั้นใน data.js |

---

## 📱 ฟีเจอร์เพิ่มเติมในอนาคต

- [ ] เก็บประวัติการสแกน
- [ ] Export รายงานเป็น Excel
- [ ] Backend ฐานข้อมูล (มี Login)
- [ ] QR Code generator สำหรับพิมพ์บาร์โค้ด

---

## 📄 License

สร้างขึ้นเพื่อใช้งานเฉพาะ

---

## ❓ คำถามเพิ่มเติม?

ติดต่อ: [ระบุข้อมูลติดต่อ]
