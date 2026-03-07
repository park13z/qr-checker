// ===== Configuration =====
const ADMIN_PASSWORD = "tgf2026!";
const STORAGE_KEY = "qr_checker_products";

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", function() {
    loadProductsFromStorage();
    updateProductList();
    updateExportJSON();
});

// ===== Password Check =====
function checkPassword() {
    const password = document.getElementById("password-input").value;
    const errorMsg = document.getElementById("error-msg");

    if (password === ADMIN_PASSWORD) {
        // ✓ Correct
        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("admin-screen").classList.remove("hidden");
    } else {
        // ✗ Wrong
        errorMsg.textContent = "❌ รหัสผ่านไม่ถูกต้อง";
        errorMsg.classList.add("show");
        document.getElementById("password-input").value = "";

        setTimeout(() => {
            errorMsg.classList.remove("show");
        }, 3000);
    }
}

function logout() {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("admin-screen").classList.add("hidden");
    document.getElementById("password-input").value = "";
}

// ===== Product Management =====
let products = {};

function loadProductsFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            products = JSON.parse(stored);
        } catch (e) {
            console.error("Error loading products:", e);
            products = {};
        }
    }
}

function saveProductsToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function addProduct() {
    const gtin = document.getElementById("gtin").value.trim();
    const name = document.getElementById("product-name").value.trim();
    const size = document.getElementById("product-size").value.trim();
    const image = document.getElementById("product-image").value.trim();

    // Validation
    if (!gtin || !name || !size || !image) {
        alert("⚠️ กรอกข้อมูลให้ครบทั้งหมด");
        return;
    }

    if (gtin.length !== 14 || isNaN(gtin)) {
        alert("⚠️ GTIN ต้องเป็นตัวเลข 14 หลัก");
        return;
    }

    if (products[gtin]) {
        alert("⚠️ GTIN นี้มีอยู่แล้ว ให้ลบออกก่อนหรือแก้ไข");
        return;
    }

    // Add product
    products[gtin] = {
        name: name,
        size: size,
        image: image
    };

    saveProductsToStorage();
    updateProductList();
    updateExportJSON();

    // Clear form
    document.getElementById("gtin").value = "";
    document.getElementById("product-name").value = "";
    document.getElementById("product-size").value = "";
    document.getElementById("product-image").value = "";

    alert("✅ เพิ่มสินค้าสำเร็จ!");
}

function deleteProduct(gtin) {
    if (confirm(`ลบสินค้า ${products[gtin].name}?`)) {
        delete products[gtin];
        saveProductsToStorage();
        updateProductList();
        updateExportJSON();
        alert("✅ ลบสำเร็จ");
    }
}

function updateProductList() {
    const listDiv = document.getElementById("product-list");

    if (Object.keys(products).length === 0) {
        listDiv.innerHTML = '<div class="product-item-empty">ยังไม่มีสินค้า</div>';
        return;
    }

    listDiv.innerHTML = Object.entries(products)
        .map(([gtin, product]) => `
            <div class="product-item">
                <div class="product-info">
                    <strong>${product.name}</strong>
                    <small>GTIN: ${gtin} | ขนาด: ${product.size}</small>
                    <small>รูป: ${product.image.substring(0, 50)}...</small>
                </div>
                <button class="btn-delete" onclick="deleteProduct('${gtin}')">🗑️ ลบ</button>
            </div>
        `)
        .join("");
}

function updateExportJSON() {
    const json = `const productData = ${JSON.stringify(products, null, 4)};`;
    document.getElementById("json-export").value = json;
}

function copyToClipboard() {
    const textarea = document.getElementById("json-export");
    textarea.select();
    document.execCommand("copy");

    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = "✅ Copied!";

    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}
