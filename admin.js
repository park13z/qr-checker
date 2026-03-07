// ===== Configuration =====
const ADMIN_PASSWORD = "tgf2026!";

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", function() {
    // Wait for Supabase to be ready
    setTimeout(() => {
        loadProductsFromSupabase();
        setupFileInput();
    }, 500);
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

// ===== Image Upload =====
let uploadedImageUrl = "";

function setupFileInput() {
    const fileInput = document.getElementById("product-image-file");
    const uploadSection = document.querySelector(".image-upload-section");

    // Click to upload
    uploadSection.addEventListener("click", () => {
        fileInput.click();
    });

    // Drag and drop
    uploadSection.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadSection.style.borderColor = "#764ba2";
    });

    uploadSection.addEventListener("dragleave", () => {
        uploadSection.style.borderColor = "#667eea";
    });

    uploadSection.addEventListener("drop", (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleImageUpload({ target: fileInput });
        }
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert("⚠️ ขนาดรูปต้องไม่เกิน 2MB");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const base64 = e.target.result;
        uploadedImageUrl = base64;

        // Show preview
        const previewBox = document.getElementById("image-preview-box");
        const previewImg = document.getElementById("image-preview");
        previewImg.src = base64;
        previewBox.classList.remove("hidden");

        // Hide URL input
        document.getElementById("product-image-url").style.display = "none";
    };

    reader.readAsDataURL(file);
}

function clearImage() {
    uploadedImageUrl = "";
    document.getElementById("product-image-file").value = "";
    document.getElementById("image-preview-box").classList.add("hidden");
    document.getElementById("product-image-url").style.display = "block";
    document.getElementById("product-image-url").value = "";
}

// ===== Product Management =====
let products = {};

async function loadProductsFromSupabase() {
    try {
        const supabaseClient = getSupabaseClient();
        const { data, error } = await supabaseClient
            .from("products")
            .select("*");

        if (error) throw error;

        products = {};

        if (data && data.length > 0) {
            data.forEach(product => {
                products[product.gtin] = {
                    name: product.name,
                    size: product.size,
                    image: product.image
                };
            });
            console.log(`✅ Loaded ${data.length} products from Supabase:`, Object.keys(products));
            console.log("📦 Products detail:", products);
        } else {
            console.warn("⚠️ No products found in Supabase (empty database)");
        }

        updateProductList();
    } catch (error) {
        console.error("❌ Error loading from Supabase:", error);
        alert("⚠️ ไม่สามารถเชื่อมต่อฐานข้อมูล");
    }
}

async function saveProductToSupabase(gtin, name, size, image) {
    try {
        const supabaseClient = getSupabaseClient();

        // Use UPSERT (insert or update)
        const { data, error } = await supabaseClient
            .from("products")
            .upsert(
                { gtin, name, size, image },
                { onConflict: "gtin" }
            );

        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }

        console.log("✅ Saved to Supabase:", gtin);
        console.log("📦 Data saved:", data);
    } catch (error) {
        console.error("❌ Error saving to Supabase:", error);
        alert("⚠️ ไม่สามารถบันทึกข้อมูล: " + error.message);
    }
}

async function addProduct() {
    const gtin = document.getElementById("gtin").value.trim();
    const name = document.getElementById("product-name").value.trim();
    const size = document.getElementById("product-size").value.trim();

    // Get image from uploaded file or URL input
    let image = uploadedImageUrl || document.getElementById("product-image-url").value.trim();

    // Validation
    if (!gtin || !name || !size || !image) {
        alert("⚠️ กรอกข้อมูลให้ครบทั้งหมด");
        return;
    }

    if (gtin.length !== 14 || isNaN(gtin)) {
        alert("⚠️ GTIN ต้องเป็นตัวเลข 14 หลัก");
        return;
    }

    // Save to Supabase
    await saveProductToSupabase(gtin, name, size, image);

    // Add to local products
    products[gtin] = {
        name: name,
        size: size,
        image: image
    };

    updateProductList();

    // Clear form
    document.getElementById("gtin").value = "";
    document.getElementById("product-name").value = "";
    document.getElementById("product-size").value = "";
    document.getElementById("product-image-url").value = "";
    document.getElementById("product-image-file").value = "";
    clearImage();

    // Show sync message
    showSyncMessage();

    alert("✅ เพิ่มสินค้าสำเร็จ!");
}

async function deleteProduct(gtin) {
    if (confirm(`ลบสินค้า ${products[gtin].name}?`)) {
        try {
            const supabaseClient = getSupabaseClient();
            const { error } = await supabaseClient
                .from("products")
                .delete()
                .eq("gtin", gtin);

            if (error) throw error;

            delete products[gtin];
            updateProductList();
            alert("✅ ลบสำเร็จ");
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("⚠️ ไม่สามารถลบสินค้า: " + error.message);
        }
    }
}

function updateProductList() {
    const listDiv = document.getElementById("product-list");
    const productCount = Object.keys(products).length;

    console.log(`📋 Updating product list - Total: ${productCount} items`);

    if (productCount === 0) {
        console.warn("⚠️ No products to display");
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

function showSyncMessage() {
    const syncMsg = document.getElementById("sync-message");
    syncMsg.classList.remove("hidden");

    // Auto hide after 5 seconds
    setTimeout(() => {
        syncMsg.classList.add("hidden");
    }, 5000);
}
