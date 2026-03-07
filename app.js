// ===== GS1-128 Parser =====
function decodeGS1(rawText) {
    try {
        // ลบวงเล็บออกถ้าเครื่องสแกนอ่านติดมา
        let cleanText = rawText.replace(/[\(\)]/g, "");

        // ตัดเว้นวรรค ซ้ายขวา
        cleanText = cleanText.trim();

        // ค้นหา 01 (GTIN) - ขึ้นต้นด้วย 01 เสมอในบาร์โค้ด GS1-128
        let gtinStart = cleanText.indexOf("01");
        if (gtinStart === -1) {
            throw new Error("ไม่พบ GTIN Identifier (01)");
        }

        // ดึง GTIN 14 หลัก
        let gtin = cleanText.substring(gtinStart + 2, gtinStart + 16);
        if (!gtin || gtin.length !== 14) {
            throw new Error("GTIN ไม่ถูกต้อง (ต้อง 14 หลัก)");
        }

        // ค้นหา 13 (Packaging Date) - 6 หลัก YYMMDD
        let dateStart = cleanText.indexOf("13");
        let dateRaw = "";
        let year = "", month = "", day = "";

        if (dateStart !== -1) {
            dateRaw = cleanText.substring(dateStart + 2, dateStart + 8);
            if (dateRaw && dateRaw.length === 6) {
                let yy = parseInt(dateRaw.substring(0, 2));
                year = (yy > 50 ? "19" : "20") + dateRaw.substring(0, 2);
                month = dateRaw.substring(2, 4);
                day = dateRaw.substring(4, 6);
            }
        }

        // ค้นหา 10 (Lot Number)
        let lotStart = cleanText.indexOf("10");
        let lot = "";

        if (lotStart !== -1) {
            // Lot ไปจนจบของ string หรือจนกว่าจะเจอ AI ถัดไป
            let nextAI = cleanText.length;

            // ค้นหา AI ถัดไป (13, 15, 17, 20 เป็นต้น)
            for (let ai of ["13", "15", "17", "20"]) {
                let pos = cleanText.indexOf(ai, lotStart + 2);
                if (pos !== -1 && pos < nextAI) {
                    nextAI = pos;
                }
            }

            lot = cleanText.substring(lotStart + 2, nextAI);
        }

        return {
            gtin: gtin,
            fullDate: year && month && day ? `${year}-${month}-${day}` : "ไม่ระบุ",
            lot: lot || "ไม่ระบุ",
            raw: rawText
        };
    } catch (error) {
        throw new Error("แยกข้อมูล Barcode ล้มเหลว: " + error.message);
    }
}

// ===== Load Products from Storage =====
function loadProductsFromStorage() {
    const STORAGE_KEY = "qr_checker_products";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const storedProducts = JSON.parse(stored);
            // Merge with productData (localStorage takes priority)
            productData = { ...productData, ...storedProducts };
            console.log("✅ Loaded products from localStorage:", storedProducts);
        } catch (e) {
            console.warn("⚠️ Error loading from localStorage:", e);
        }
    }
}

// ===== UI Control =====
function showError(message) {
    const errorDiv = document.getElementById("error-msg");
    const errorText = document.getElementById("error-text");
    errorText.textContent = message;
    errorDiv.classList.remove("hidden");

    setTimeout(() => {
        errorDiv.classList.add("hidden");
    }, 5000);
}

function clearResult() {
    document.getElementById("result").classList.add("hidden");
}

// ===== Scanner Setup =====
let html5QrCode;

function onScanSuccess(decodedText) {
    try {
        console.log("Raw barcode:", decodedText);

        // แกะรหัส
        const info = decodeGS1(decodedText);

        // ค้นหาข้อมูลสินค้า
        const product = productData[info.gtin];

        if (!product) {
            showError(`❌ ไม่พบสินค้า GTIN: ${info.gtin} ในระบบ`);
            return;
        }

        // แสดงผล
        displayResult(product, info);

        // หยุดสแกนชั่วคราว แล้วเริ่มใหม่หลัง 2 วินาที
        html5QrCode.pause();
        setTimeout(() => {
            html5QrCode.resume();
        }, 2000);

    } catch (error) {
        console.error("Error:", error);
        showError("⚠️ " + error.message);
    }
}

function displayResult(product, info) {
    const resultDiv = document.getElementById("result");
    document.getElementById("p-name").textContent = product.name;
    document.getElementById("p-size").textContent = product.size || "ไม่ระบุ";
    document.getElementById("p-img").src = product.image;
    document.getElementById("p-date").textContent = info.fullDate;
    document.getElementById("p-lot").textContent = info.lot;
    document.getElementById("p-gtin").textContent = info.gtin;

    resultDiv.classList.remove("hidden");

    // เลื่อนขึ้นให้เห็นผล
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
}

// ===== Initialize Scanner =====
function initScanner() {
    html5QrCode = new Html5Qrcode("reader");

    const config = {
        fps: 15,
        qrbox: { width: 280, height: 100 }
    };

    html5QrCode.start(
        { facingMode: { exact: "environment" } }, // ใช้กล้องหลังอุปกรณ์
        config,
        onScanSuccess
    ).catch(err => {
        console.error("Scanner init error:", err);
        showError("❌ ไม่สามารถเปิดกล้องได้ (ต้อง HTTPS และอนุญาตให้ใช้กล้อง)");
    });
}

// ===== On Page Load =====
document.addEventListener("DOMContentLoaded", function() {
    loadProductsFromStorage(); // Load from localStorage first
    initScanner();
});
