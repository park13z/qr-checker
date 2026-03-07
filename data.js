// ===== Product Database =====
// เพิ่มข้อมูลสินค้าของคุณตรงนี้
// รูปแบบ: "GTIN": { name: "ชื่อสินค้า", size: "ขนาด", image: "ที่อยู่รูปภาพ" }

const productData = {
    "10041220210340": {
        name: "แพ็คเกจกล่อง A",
        size: "500 กรัม",
        image: "https://via.placeholder.com/180?text=Package+A+500g"
    },
    "10041220210341": {
        name: "แพ็คเกจซอง B",
        size: "100 กรัม",
        image: "https://via.placeholder.com/180?text=Package+B+100g"
    },
    "10041220210342": {
        name: "แพ็คเกจซองปลีก",
        size: "50 กรัม",
        image: "https://via.placeholder.com/180?text=Package+C+50g"
    },
    "10041220210343": {
        name: "แพ็คเกจ XL",
        size: "1000 กรัม",
        image: "https://via.placeholder.com/180?text=Package+XL+1kg"
    },
    // เพิ่มสินค้าเพิ่มเติมตรงนี้...
};

// ===== วิธีเพิ่มสินค้าใหม่ =====
/*
ขั้นตอน:
1. ตรวจสอบรหัส GTIN 14 หลักของสินค้า
2. เตรียมรูปภาพสินค้า (นะนำมาจากไฟล์ หรือ URL)
3. เพิ่มข้อมูลลงใน productData ตามรูปแบบด้านบน

ตัวอย่าง:
"10041220210344": {
    name: "สินค้าใหม่",
    size: "250 กรัม",
    image: "images/product_10041220210344.jpg"
}
*/
