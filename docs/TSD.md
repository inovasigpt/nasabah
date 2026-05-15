Berikut adalah **Technical Specification Document (TSD)** untuk aplikasi penanganan pengaduan nasabah dan mitigasi fraud, dengan penekanan pada estetika visual profesional ala Bank Indonesia (bi.go.id) dan fungsionalitas teknis tingkat lanjut.

## **1\. Identitas Visual & Desain UI (Style Guide bi.go.id)**

Sesuai dengan karakteristik portal Bank Indonesia, dashboard akan mengadopsi tata letak yang bersih, hierarki informasi yang jelas, dan penggunaan warna institusional yang stabil.

### **A. Palet Warna & Tipografi**

| Elemen | Spesifikasi |
| :---- | :---- |
| **Primary Color** | Dark Blue/Indigo (\#003366) & Gold/Yellow (\#FFCC00) |
| **Secondary Color** | Light Gray (\#F4F4F4) untuk background section |
| **Typography** | Sans-serif (Inter atau Roboto) untuk keterbacaan data tinggi |
| **Status Colors** | Green (Aman), Orange (Waspada), Red (Bahaya/Fraud) |

### **B. Layout Pattern**

* **Top Bar:** Menampilkan indikator real-time (total fraud hari ini, total pengaduan terbuka) menyerupai ticker kurs di portal BI.  
* **Z-Pattern Layout:** Penempatan KPI utama di kiri atas, diikuti oleh visualisasi grafik di area tengah, dan filter di sisi kanan atau atas.  
* **Card-Based UI:** Penggunaan border halus dan *negative space* untuk memisahkan metrik risiko agar tidak terjadi *cognitive overload*.

## ---

**2\. Struktur Menu dan Halaman Utama**

Halaman dirancang untuk mendukung tiga fungsi utama: monitoring operasional, investigasi mendalam, dan konfigurasi AI.

| Menu Utama | Halaman | Fitur Utama |
| :---- | :---- | :---- |
| **Executive Dashboard** | Overview | Ringkasan KPI risiko, peta panas (heat map) wilayah fraud, dan tren pengaduan bulanan. |
| **Complaint Center** | Ticket Inbox | Daftar pengaduan nasabah dengan status triage otomatis (High, Mid, Low) berbasis NLP. |
|  | Case Detail | Riwayat percakapan, dokumen bukti, dan deteksi sentimen keluhan. |
| **Fraud Investigation** | Money Trail | **Node Graph Interactive** untuk melacak aliran dana antar rekening nasabah dan eksternal.  |
|  | Ledger Analysis | Tabel transaksi mendalam dengan fitur filter temporal dan deteksi anomali. |
| **AI Configuration** | Rule Builder | **Visual Canvas (React Flow)** untuk menyusun logika deteksi (If-Then) secara drag-and-drop. |
|  | Model Performance | Statistik akurasi AI, *backtesting* aturan baru, dan log interpretasi (Explainable AI). |
| **Security & Action** | Account Status | Daftar rekening yang dibekukan (Sandi 07\) dan riwayat pembukaan blokir manual.  |
|  | Audit Trail | Log aktivitas user (siapa melihat data apa dan melakukan tindakan apa). |

## ---

**3\. Desain Relasi Database (Neon Postgres)**

Arsitektur database menggunakan Neon Postgres yang dioptimalkan untuk data relasional (transaksi perbankan) dan data vektor (perilaku AI).

### **A. Skema Tabel Utama**

Berikut adalah struktur inti database:

1. **Users & Accounts:**  
   * Users: ID, Nama, NIK, Status Kepatuhan.  
   * Accounts: Account\_Number, User\_ID, Balance, Risk\_Score, Status (Active/Frozen/Closed).  
2. **Transactions (Append-Only Ledger):**  
   * Transactions: ID, Sender\_Acc, Recipient\_Acc, Amount, Timestamp, Channel (ATM/Mobile), Location\_IP, Metadata (Device ID).  
   * *Catatan:* Menggunakan prinsip *double-entry* untuk integritas data finansial.  
3. **Complaint Management:**  
   * Complaints: Ticket\_ID, User\_ID, Category (Phishing/Skimming/Social Engineering), Description, AI\_Priority\_Score, Status.  
4. **AI Rule Engine & Risk Scoring:**  
   * AI\_Rules: Rule\_ID, Name, Logic\_JSON (dari React Flow), Created\_By.  
   * Risk\_Scores: ID, Account\_Number, Score (0-100), Reason\_Vector (Embedding), Last\_Updated.

5. **Audit & Action Logs:**  
   * Freeze\_Logs: Log\_ID, Account\_Number, Reason\_Code (Sandi 07), Triggered\_By (System/Admin), Freeze\_Duration.

### **B. Relasi Data (ERD Concept)**

* Satu **User** dapat memiliki banyak **Accounts**.  
* Satu **Account** dapat terlibat dalam banyak **Transactions** (baik sebagai pengirim atau penerima).  
* Satu **Complaint** terhubung ke satu **User** dan dapat merujuk ke satu atau lebih **Transaction\_ID** yang disanggah.  
* **Risk\_Scores** diperbarui secara real-time berdasarkan hasil evaluasi **AI\_Rules** terhadap aliran **Transactions**.

## ---

**4\. Implementasi Teknologi Khusus**

### **A. Money Trail (Recursive CTE)**

Untuk menghasilkan grafik aliran dana di Dashboard, backend akan menggunakan query **Recursive CTE** pada database Neon. Query ini memungkinkan pelacakan hingga "N-hops" (misalnya melacak kemana uang mengalir setelah melewati 5 rekening berbeda) secara instan.

### **B. Visualisasi Graph (Cytoscape/React Flow)**

* **Money Trail:** Menggunakan Cytoscape.js atau ReGraph untuk performa render ribuan node dan edge (rekening dan transaksi) dengan tata letak otomatis yang stabil (mental map).

* **AI Rule Builder:** Menggunakan React Flow agar analis fraud dapat membuat logika deteksi tanpa coding, yang kemudian disimpan sebagai JSON di database.

### **C. Penanganan Pembekuan Otomatis (Automatic Freeze)**

Sistem akan memicu fungsi Account\_Freeze secara otomatis jika Risk\_Score \> 90\. Sesuai dengan **POJK 39/2019**, sistem akan mencatat Sandi **07** (Pemblokiran Rekening) dan secara otomatis mengirimkan notifikasi kepada nasabah melalui aplikasi.

## ---

**5\. Keamanan dan Kepatuhan**

* **SSL/TLS:** Neon mewajibkan koneksi terenkripsi untuk semua akses data.  
* **RBAC (Role-Based Access Control):** Hanya investigator senior yang memiliki hak akses untuk fitur "Unfreeze" atau mengubah Rule AI dengan tingkat risiko tinggi.

* **Explainable AI:** Setiap skor risiko tinggi yang diberikan oleh AI harus disertai dengan narasi bahasa alami (misal: *"Akun diblokir karena deteksi login dari lokasi tidak dikenal dan lonjakan transaksi 300% dalam 1 jam"*) untuk keperluan transparansi regulasi.  
