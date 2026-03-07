// ===== GS1-128 Parser Class =====
class GS1Parser {
    static AI = {
        GTIN: "01",        // 14 digits
        PACK_DATE: "13",   // 6 digits (YYMMDD)
        LOT: "10"          // Variable length
    };

    /**
     * Decode GS1-128 barcode data
     * @param {string} rawText - Raw barcode text
     * @returns {Object} Parsed barcode data
     */
    static decode(rawText) {
        try {
            let cleanText = rawText.replace(/[\(\)]/g, "").trim();

            // Use Regex for more robust parsing
            const gtinMatch = cleanText.match(/01(\d{14})/);
            const dateMatch = cleanText.match(/13(\d{6})/);
            const lotMatch = cleanText.match(/10([^\d][^\d]{0,}|[^0-9]+)?/);

            if (!gtinMatch) {
                throw new Error("ไม่พบ GTIN Identifier (01)");
            }

            return {
                gtin: gtinMatch[1],
                fullDate: dateMatch ? this.formatDate(dateMatch[1]) : "ไม่ระบุ",
                lot: lotMatch && lotMatch[1] ? lotMatch[1].trim() : this.extractLotFallback(cleanText),
                raw: rawText
            };
        } catch (error) {
            throw new Error("แยกข้อมูล Barcode ล้มเหลว: " + error.message);
        }
    }

    /**
     * Format YYMMDD to YYYY-MM-DD
     */
    static formatDate(yymmdd) {
        const yy = parseInt(yymmdd.substring(0, 2));
        const year = (yy > 50 ? "19" : "20") + yymmdd.substring(0, 2);
        const month = yymmdd.substring(2, 4);
        const day = yymmdd.substring(4, 6);
        return `${year}-${month}-${day}`;
    }

    /**
     * Fallback method to extract lot number using indexOf
     */
    static extractLotFallback(cleanText) {
        const lotStart = cleanText.indexOf(this.AI.LOT);
        if (lotStart === -1) return "ไม่ระบุ";

        let nextAI = cleanText.length;
        for (let ai of ["13", "15", "17", "20"]) {
            const pos = cleanText.indexOf(ai, lotStart + 2);
            if (pos !== -1 && pos < nextAI) {
                nextAI = pos;
            }
        }

        return cleanText.substring(lotStart + 2, nextAI) || "ไม่ระบุ";
    }
}

// ===== Scanner App Class =====
class ScannerApp {
    constructor() {
        this.isScanning = false;
        this.products = { ...productData }; // Start with local data
        this.lastScannedCode = null;
        this.lastScanTime = 0;
    }

    /**
     * Initialize the app
     */
    async init() {
        try {
            // Load data from Supabase
            await this.loadProductsFromSupabase();

            // Setup event listeners
            this.setupEventListeners();

            console.log("✅ Scanner app initialized successfully");
        } catch (error) {
            console.error("❌ Failed to initialize app:", error);
            this.showError("ไม่สามารถเริ่มแอปพลิเคชันได้");
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const btnStart = document.querySelector('[onclick="startCamera()"]');
        const btnClose = document.querySelector('[onclick="clearResult()"]');

        if (btnStart) {
            btnStart.onclick = () => this.startCamera();
        }

        if (btnClose) {
            btnClose.onclick = () => this.clearResult();
        }

        // Make functions global for HTML onclick handlers
        window.startCamera = () => this.startCamera();
        window.clearResult = () => this.clearResult();
    }

    /**
     * Load products from Supabase
     */
    async loadProductsFromSupabase() {
        try {
            const supabase = getSupabaseClient();
            if (!supabase) {
                console.warn("⚠️ Supabase not initialized, using local data only");
                return;
            }

            const { data, error } = await supabase
                .from("products")
                .select("*");

            if (error) {
                console.warn("⚠️ Supabase load failed:", error);
                return;
            }

            if (data && data.length > 0) {
                data.forEach(product => {
                    this.products[product.gtin] = {
                        name: product.name,
                        size: product.size,
                        image: product.image
                    };
                });
                console.log(`✅ Loaded ${data.length} products from Supabase`);
            }
        } catch (error) {
            console.error("❌ Error loading from Supabase:", error);
        }
    }

    /**
     * Start camera scanning
     */
    async startCamera() {
        if (this.isScanning) return;

        try {
            this.isScanning = true;
            document.getElementById("start-screen").classList.add("hidden");
            document.getElementById("reader").classList.remove("hidden");
            document.getElementById("scanner-hint").style.display = "block";

            await this.initScanner();
        } catch (error) {
            console.error("❌ Failed to start camera:", error);
            this.showError("ไม่สามารถเปิดกล้องได้");
            this.isScanning = false;
        }
    }

    /**
     * Initialize Quagga barcode scanner (supports 1D barcodes)
     */
    async initScanner() {
        return new Promise((resolve, reject) => {
            Quagga.init(
                {
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: document.querySelector("#reader"),
                        constraints: {
                            width: { min: 640 },
                            height: { min: 480 },
                            facingMode: "environment" // Rear camera
                        }
                    },
                    decoder: {
                        readers: [
                            "code_128_reader"  // Prioritize Code 128 for GS1 data
                        ],
                        workers: 2,
                        debug: false,
                        multiple: false
                    },
                    locator: {
                        halfSample: true
                    },
                    frequency: 10
                },
                (err) => {
                    if (err) {
                        console.error("Quagga init error:", err);
                        this.showError("❌ ไม่สามารถเปิดกล้องได้ (ต้อง HTTPS และอนุญาตให้ใช้กล้อง)");
                        reject(err);
                        return;
                    }

                    console.log("✅ Quagga scanner initialized");
                    Quagga.start();

                    // Set up detection event
                    Quagga.onDetected((result) => {
                        if (result && result.codeResult && result.codeResult.code) {
                            console.log(`✅ Detected [${result.codeResult.format}]:`, result.codeResult.code);
                            this.handleScan(result.codeResult.code);
                        } else {
                            console.log("⏳ Scanning... (waiting for detection)");
                        }
                    });

                    resolve();
                }
            );
        });
    }

    /**
     * Handle barcode scan
     */
    handleScan(decodedText) {
        try {
            // Prevent duplicate scans within 2 seconds
            if (this.lastScannedCode === decodedText && Date.now() - this.lastScanTime < 2000) {
                console.log("⏭️ Duplicate scan ignored:", decodedText);
                return;
            }

            this.lastScannedCode = decodedText;
            console.log("📦 Raw barcode:", decodedText);

            const info = GS1Parser.decode(decodedText);
            const product = this.products[info.gtin];

            if (!product) {
                this.showError(`❌ ไม่พบสินค้า GTIN: ${info.gtin} ในระบบ`);
                return;
            }

            this.displayResult(product, info);
            this.pauseScanning();
        } catch (error) {
            console.error("Error:", error);
            this.showError("⚠️ " + error.message);
        }
    }

    /**
     * Pause scanning for 2 seconds (duplicate prevention)
     */
    pauseScanning() {
        // Store the scanned code and time to prevent duplicate scans
        this.lastScanTime = Date.now();

        // Quagga will continue but we check for duplicates in handleScan
        setTimeout(() => {
            this.lastScannedCode = null; // Reset after 2 seconds
        }, 2000);
    }

    /**
     * Display scan result on UI
     */
    displayResult(product, info) {
        const resultDiv = document.getElementById("result");

        document.getElementById("p-name").textContent = product.name;
        document.getElementById("p-size").textContent = product.size || "ไม่ระบุ";
        document.getElementById("p-img").src = product.image;
        document.getElementById("p-date").textContent = info.fullDate;
        document.getElementById("p-lot").textContent = info.lot;
        document.getElementById("p-gtin").textContent = info.gtin;

        resultDiv.classList.remove("hidden");

        // Smooth scroll to result
        setTimeout(() => {
            resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    }

    /**
     * Clear result and reset UI
     */
    clearResult() {
        document.getElementById("result").classList.add("hidden");
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.getElementById("error-msg");
        const errorText = document.getElementById("error-text");

        errorText.textContent = message;
        errorDiv.classList.remove("hidden");

        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 5000);
    }

    /**
     * Stop scanning and cleanup
     */
    stop() {
        if (this.isScanning) {
            Quagga.stop();
            this.isScanning = false;
            console.log("✅ Scanner stopped");
        }
    }
}

// ===== Initialize App =====
let scannerApp;

document.addEventListener("DOMContentLoaded", async function() {
    // Wait for Supabase to be ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create and initialize scanner app
    scannerApp = new ScannerApp();
    await scannerApp.init();
});
