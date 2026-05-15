# **Desain Strategis dan Spesifikasi Teknis Sistem Terintegrasi Penanganan Pengaduan Nasabah dan Mitigasi Fraud Berbasis Kecerdasan Buatan (AI)**

Transformasi digital dalam sektor perbankan dan layanan keuangan telah menciptakan lanskap yang sangat dinamis, di mana kemudahan transaksi instan harus berhadapan dengan ancaman kejahatan siber yang semakin canggih.1 Munculnya pola penipuan baru seperti *Account Takeover* (ATO), *Authorized Push Payment* (APP) fraud, dan skema pencucian uang berlapis menuntut institusi keuangan untuk meninggalkan sistem deteksi berbasis aturan statis yang kaku dan beralih ke solusi yang lebih proaktif, adaptif, dan terintegrasi.3 Laporan ini menyajikan desain komprehensif untuk sistem penanganan pengaduan nasabah dan penanggulangan fraud yang menggabungkan kecerdasan buatan (AI) dengan arsitektur teknologi modern seperti Next.js, Vercel, dan Database Neon, guna menciptakan solusi *one-stop shopping* yang memenuhi standar regulasi nasional maupun internasional.

## **Evolusi Ancaman Kejahatan Keuangan dan Kebutuhan Transformasi Sistem**

Kejahatan keuangan saat ini tidak lagi dilakukan secara terisolasi tetapi sering kali melibatkan jaringan terorganisir yang memanfaatkan teknologi untuk mengaburkan jejak transaksi.5 Berdasarkan data industri, upaya penipuan global telah meningkat sebesar 233% sejak tahun 2019, sementara sistem berbasis aturan tradisional hanya mampu mencapai tingkat akurasi sekitar 60%.3 Kelemahan utama dari sistem lama adalah ketidakmampuannya untuk mengenali pola perilaku yang kompleks dalam waktu nyata, yang sering kali menyebabkan tingginya angka *false positive* dan mengganggu pengalaman nasabah yang sah.3

Penggunaan AI dalam deteksi fraud menawarkan kemampuan untuk menganalisis volume data transaksional dan perilaku yang masif, mengenali tren anomali, dan menyesuaikan diri dengan taktik penipuan yang terus berubah dengan intervensi manusia yang minimal.1 Dengan mengadopsi teknologi *Machine Learning* (ML) dan *Deep Learning* (DL), institusi keuangan dapat menurunkan waktu investigasi hingga 70% dan meningkatkan tingkat deteksi hingga 97% pada jenis penipuan tertentu.3

| Karakteristik | Sistem Berbasis Aturan Tradisional | Sistem Berbasis AI Modern |
| :---- | :---- | :---- |
| Logika Deteksi | Pernyataan IF-THEN statis | Algoritma adaptif dan pengenalan pola 1 |
| Kecepatan | Sering kali bersifat batch/reaktif | Deteksi dan pencegahan real-time 3 |
| Akurasi | Rendah (banyak *false positive*) | Tinggi (belajar dari data historis) 6 |
| Skalabilitas | Terbatas pada aturan yang didefinisikan manual | Skalabilitas otomatis melalui data 7 |
| Penanganan Kasus | Manual dan memakan waktu | Otomatisasi alur kerja dan prioritas 8 |

## **Kerangka Regulasi dan Kepatuhan Anti-Fraud di Indonesia**

Pembangunan sistem deteksi fraud di Indonesia harus berakar pada kepatuhan terhadap Peraturan Otoritas Jasa Keuangan (POJK) Nomor 39/POJK.03/2019 tentang Penerapan Strategi Anti Fraud bagi Bank Umum.9 Regulasi ini mewajibkan setiap bank untuk memiliki strategi yang mencakup empat pilar utama: pencegahan, deteksi, investigasi (termasuk pelaporan dan sanksi), serta pemantauan, evaluasi, dan tindak lanjut.9

Sistem yang dirancang harus memfasilitasi kewajiban pelaporan bank kepada OJK, terutama jika terjadi fraud yang berdampak signifikan, yang harus dilaporkan dalam waktu maksimal tiga hari kerja setelah kejadian diketahui.9 Selain itu, tindakan administratif seperti pembekuan rekening harus mengikuti prosedur yang jelas, di mana dalam pelaporan resmi OJK, tindakan "Pemblokiran Rekening" diberikan Sandi 07\.9 Kepatuhan ini tidak hanya bersifat administratif tetapi juga operasional, di mana sistem harus mampu mendokumentasikan setiap langkah investigasi sebagai bagian dari bukti yang dapat dipertanggungjawabkan secara hukum.10

### **Implementasi Pilar Anti-Fraud dalam Desain Aplikasi**

| Pilar Strategi | Fungsi Sistem yang Diperlukan | Referensi Regulasi |
| :---- | :---- | :---- |
| Pencegahan | Penguatan autentikasi, edukasi nasabah otomatis | POJK 39/2019 Pasal 3 9 |
| Deteksi | AI risk scoring, pemantauan anomali perilaku | POJK 39/2019 Lampiran I 9 |
| Investigasi | Dashboard Money Trail, visualisasi hubungan entitas | POJK 39/2019 Pasal 7 9 |
| Tindak Lanjut | Pembekuan otomatis (Sandi 07), koreksi laporan | POJK 39/2019 Pasal 13 9 |

## **Arsitektur Teknologi dan Infrastruktur Sistem**

Pemilihan tumpukan teknologi (*technology stack*) sangat menentukan skalabilitas dan performa sistem dalam menangani ribuan transaksi per detik. Penggunaan Next.js sebagai *frontend*, Vercel sebagai platform *deployment*, dan Neon sebagai *database* serverless memberikan fondasi yang tangguh untuk aplikasi AI-native.11

### **Frontend dan User Interface: Next.js dan Vercel**

Next.js menawarkan keunggulan dalam *Server-Side Rendering* (SSR) dan *Incremental Static Regeneration* (ISR), yang memastikan dashboard analitik dapat dimuat dengan cepat meskipun data yang diproses sangat besar. Integrasi dengan Vercel memungkinkan penerapan *Edge Functions*, yang dapat digunakan untuk menjalankan logika validasi ringan di lokasi geografis yang lebih dekat dengan pengguna, sehingga mengurangi latensi secara signifikan.11

Untuk antarmuka grafis yang kompleks, penggunaan React Flow sangat disarankan untuk membangun *rule builder* yang intuitif, sementara Cytoscape.js atau D3.js lebih cocok untuk visualisasi 'Money Trail' yang membutuhkan performa tinggi dalam merender ribuan node dan relasi.12 React Flow memungkinkan analis fraud untuk menyusun logika deteksi dengan cara menarik dan melepas (*drag-and-drop*) blok bangunan logika, yang secara otomatis diterjemahkan menjadi skrip konfigurasi di sisi backend.14

### **Backend dan Pemrosesan AI: Microservices dan LLM Chaining**

Sisi backend harus dirancang untuk menangani orkestrasi model AI. Pendekatan *Large Language Model (LLM) Chaining* dapat digunakan untuk memproses data transaksi dalam empat tahap sekuensial: pra-pemrosesan fitur, analisis pola perilaku, penilaian risiko kontekstual, dan sintesis keputusan.15 Tahapan ini memastikan bahwa setiap keputusan AI didasarkan pada konteks yang kaya, bukan sekadar angka absolut transaksi.15

Integrasi AI dalam alur kerja pengaduan nasabah memungkinkan sistem untuk melakukan *triage* otomatis. Saat nasabah mengajukan pengaduan, mesin NLP akan menganalisis teks untuk menentukan urgensi dan kategori fraud (misalnya, phishing atau skimming) sebelum meneruskannya ke tim investigasi yang relevan.16

### **Database Neon: Postgres Serverless untuk Era AI**

Database Neon dipilih karena kemampuannya dalam memisahkan penyimpanan (*storage*) dan komputasi (*compute*), yang memungkinkannya untuk melakukan *autoscale* hingga titik nol saat tidak ada aktivitas, sehingga mengoptimalkan biaya operasional.11 Fitur *branching* pada Neon sangat krusial dalam pengembangan sistem fraud; tim pengembang dapat membuat replika instan dari data produksi untuk menguji aturan AI baru tanpa mengganggu sistem yang sedang berjalan.11

Neon juga mendukung ekstensi pgvector, yang sangat penting untuk menyimpan dan mencari *embedding* vektor yang dihasilkan oleh model AI.18 Hal ini memungkinkan sistem untuk melakukan pencarian kemiripan (*similarity search*) pada pola transaksi. Misalnya, jika sebuah akun baru menunjukkan perilaku yang 95% mirip dengan akun yang sebelumnya telah diblokir karena aktivitas penipuan, sistem dapat secara otomatis menandainya sebagai risiko tinggi.19

| Komponen Database | Fungsi dalam Sistem Fraud | Keunggulan Neon |
| :---- | :---- | :---- |
| Tabel Relasional | Menyimpan profil nasabah dan riwayat transaksi | Transaksi ACID yang kuat dan andal 21 |
| pgvector | Menyimpan representasi numerik dari perilaku nasabah | Pencarian kemiripan yang cepat (HNSW index) 18 |
| Recursive CTE | Melacak aliran dana antar rekening | Performa tinggi untuk query hierarkis 22 |
| Database Branching | Pengujian model AI dan aturan baru secara aman | Provisioning database instan via API 11 |

## **Fitur Utama 1: Konfigurasi Rule AI untuk Deteksi Fraud**

Salah satu tantangan terbesar dalam manajemen fraud adalah kecepatan adaptasi penjahat. Sistem harus memberikan kemampuan bagi analis untuk menciptakan, menguji, dan menyebarkan aturan deteksi baru tanpa perlu melalui siklus pengembangan perangkat lunak yang panjang.23

### **Antarmuka Rule Builder Berbasis Graf**

Dengan memanfaatkan React Flow, aplikasi menyediakan kanvas visual di mana analis dapat menentukan pemicu (*triggers*), kondisi (*conditions*), dan tindakan (*actions*). Misalnya, sebuah aturan dapat dikonfigurasi untuk memicu peringatan jika "Transaksi \> Rp 10.000.000" DAN "Lokasi IP di luar Indonesia" DAN "Akun dibuat \< 30 hari yang lalu".7

Penggunaan LLM dalam fitur ini memungkinkan konversi bahasa alami menjadi kueri SQL atau logika pemrograman. Analis cukup mengetik: "Cari semua transaksi di atas rata-rata bulanan pengguna sebesar 3 standar deviasi dalam 24 jam terakhir," dan sistem akan menghasilkan logika deteksi yang sesuai secara otomatis.17

### **Strategi Backtesting dan Shadow Mode**

Sebelum aturan baru diaktifkan secara penuh, sistem harus melakukan *backtesting* terhadap data historis untuk mengevaluasi dampak potensial terhadap tingkat *false positive*.23 Aturan dapat dijalankan dalam *shadow mode*, di mana ia akan menghasilkan log deteksi tanpa benar-benar memblokir transaksi nasabah. Hal ini memungkinkan tim fraud untuk menyempurnakan ambang batas (*threshold*) agar tidak mengganggu operasional bisnis yang sah.24

## **Fitur Utama 2: Dashboard 'Money Trail' Berbasis Node Graph**

Investigasi fraud modern membutuhkan pemahaman tentang bagaimana dana bergerak melalui ekosistem perbankan. Dashboard 'Money Trail' berfungsi sebagai alat visualisasi yang memetakan hubungan antara pengirim, penerima, dan perantara dalam bentuk graf node.10

### **Visualisasi Aliran Dana dan Deteksi Fraud Ring**

Setiap node dalam graf mewakili akun nasabah, sementara garis (edge) mewakili transaksi. Ketebalan garis dapat merepresentasikan volume dana, sedangkan warna node menunjukkan skor risiko yang dihasilkan oleh AI.26

Fitur utama dashboard ini meliputi:

* **Clickable Nodes**: Saat node diklik, panel detail akan muncul menampilkan metadata akun, riwayat pengaduan, dan rincian skor risiko.26  
* **Temporal Filtering**: Slider waktu yang memungkinkan investigator untuk melihat evolusi aliran dana dari hari ke hari. Hal ini sangat berguna untuk mendeteksi teknik *layering* di mana dana dipecah ke banyak akun kecil sebelum dikumpulkan kembali.26  
* **Algoritma Pendeteksi Siklus**: Sistem secara otomatis menyoroti pola melingkar (circular transactions) yang sering digunakan untuk memanipulasi saldo atau mencuci uang.5  
* **Penyaringan Hubungan**: Investigator dapat menyaring hubungan berdasarkan kesamaan data seperti nomor telepon, alamat IP, atau alamat fisik yang sama, yang sering kali mengindikasikan adanya *fraud ring*.5

### **Analisis Jaringan dan Teori Graf**

Penggunaan teori graf dalam investigasi memungkinkan penghitungan metrik seperti *Betweenness Centrality* untuk mengidentifikasi akun "bagman" atau pengepul dana dalam jaringan kriminal.10 Dengan mengintegrasikan visualisasi ini secara langsung dengan database Neon melalui kueri rekursif, sistem dapat menarik sub-graf transaksi yang mencurigakan dalam milidetik, bahkan untuk jaringan yang melibatkan ribuan lompatan (*hops*) transaksi.5

## **Fitur Utama 3: AI Risk Scoring Otomatis**

Sistem penilaian risiko merupakan otak dari platform ini, yang secara dinamis mengevaluasi setiap transaksi dan entitas berdasarkan ratusan fitur.7 Berbeda dengan skor statis, AI Risk Scoring belajar dari hasil investigasi manusia untuk terus meningkatkan akurasinya.

### **Komponen Penilaian Risiko**

Penilaian risiko dilakukan secara berlapis dengan menggabungkan berbagai sinyal:

1. **Profil Perilaku (Behavioral Profiling)**: AI membandingkan transaksi saat ini dengan kebiasaan belanja historis nasabah, lokasi yang sering dikunjungi, dan waktu transaksi yang biasa.7  
2. **Analisis Perangkat dan Sesi**: Mendeteksi penggunaan VPN, emulator, atau perangkat yang telah di-*root* yang sering digunakan dalam serangan siber.7  
3. **Skor Risiko Jaringan**: Menghitung seberapa dekat akun tersebut terhubung dengan entitas yang diketahui sebagai pelaku fraud atau akun bodong (*mule accounts*).4  
4. **Analisis Semantik Pengaduan**: Jika ada pengaduan yang masuk terhadap akun tersebut, teks pengaduan diproses untuk mengekstrak sentimen dan tingkat keparahan klaim.16

Matematika di balik penilaian ini sering kali menggunakan model *ensemble* seperti XGBoost atau Random Forest yang dikombinasikan dengan Neural Networks untuk menangkap hubungan non-linear antar data.1 Hasil akhirnya adalah probabilitas numerik antara 0 hingga 100, di mana ambang batas tertentu akan memicu tindakan otomatis.

| Faktor Risiko | Bobot Pengaruh (Estimasi) | Sumber Data |
| :---- | :---- | :---- |
| Anomali Lokasi | 15% | Data Geolocation IP/GPS 7 |
| Deviasi Nominal Transaksi | 25% | Statistik Historis Pengguna 15 |
| Konektivitas Jaringan Fraud | 30% | Graph Analytics/Money Trail 5 |
| Keamanan Perangkat | 20% | Device Fingerprinting 31 |
| Riwayat Pengaduan | 10% | Database Complaint Management 16 |

### **Menghindari "Black Box" AI dengan Explainable AI (XAI)**

Sesuai dengan kebutuhan regulasi, sistem tidak boleh hanya memberikan skor tanpa penjelasan. Setiap skor risiko yang dihasilkan harus disertai dengan alasan logis yang dapat dipahami manusia (misalnya: "Skor tinggi karena transaksi dilakukan dari lokasi yang tidak biasa dan ada lonjakan volume dalam 1 jam terakhir").2 Hal ini penting untuk memberikan transparansi saat bank harus memberikan penjelasan kepada nasabah yang rekeningnya dibekukan.32

## **Fitur Utama 4: Otomatisasi Pembekuan (Freeze) Rekening**

Fitur ini merupakan garis pertahanan terakhir untuk menghentikan kerugian secara *real-time*. Berdasarkan skor risiko yang dihasilkan, sistem dapat mengambil tindakan intervensi tanpa menunggu tinjauan manual jika tingkat keyakinan AI sangat tinggi.7

### **Protokol Intervensi Berjenjang**

Sistem menerapkan kebijakan yang berbeda berdasarkan skor risiko:

* **Risiko Rendah (0-30)**: Transaksi disetujui secara otomatis.  
* **Risiko Sedang (31-70)**: Sistem memicu tantangan keamanan tambahan seperti autentikasi biometrik atau verifikasi kode OTP (*Step-up Authentication*).7  
* **Risiko Tinggi (71-90)**: Transaksi ditahan untuk ditinjau secara manual oleh analis fraud dalam waktu maksimal 10 menit.4  
* **Risiko Kritis (\>90)**: Rekening dibekukan secara otomatis (*Sandi 07*), akses digital diblokir, dan nasabah segera diberitahu melalui notifikasi aplikasi dan email.9

### **Aspek Hukum dan Perlindungan Nasabah**

Dalam mengimplementasikan pembekuan otomatis, sistem harus mempertimbangkan perlindungan hak nasabah sebagaimana diatur oleh OJK dan BI.34 Pembekuan harus didasarkan pada bukti awal yang kuat yang diyakini sebagai kejadian fraud.9 Sistem harus menyediakan mekanisme keberatan yang mudah diakses oleh nasabah melalui aplikasi, di mana mereka dapat mengunggah bukti identitas dan klarifikasi transaksi untuk membuka kembali akun yang dibekukan secara sah.33

Tabel berikut merangkum logika intervensi otomatis:

| Ambang Skor | Status Akun | Tindakan Sistem | Pemberitahuan Nasabah |
| :---- | :---- | :---- | :---- |
| \> 90 | Frozen | Blokir semua debit dan penarikan | Notifikasi instan via SMS/App 33 |
| 71-90 | Restricted | Batasi limit harian transaksi | Peringatan aktivitas mencurigakan |
| 50-70 | Flagged | Butuh verifikasi biometrik | Permintaan verifikasi tambahan |
| \< 50 | Normal | Tidak ada batasan | Laporan rutin bulanan |

## **Integrasi Menjadi Solusi 'One-Stop Shopping'**

Untuk menjadikan aplikasi ini solusi yang komprehensif, integrasi antar modul harus berjalan mulus. Pengaduan nasabah tidak boleh dipandang hanya sebagai tiket layanan pelanggan, tetapi sebagai data input kritis bagi mesin deteksi fraud.

### **Alur Kerja Terintegrasi (End-to-End Workflow)**

1. **Pelaporan Nasabah**: Nasabah melaporkan transaksi yang tidak dikenal melalui Next.js frontend.  
2. **Analisis Instan**: AI segera melakukan *scoring* terhadap transaksi tersebut dan mengaitkannya dengan akun penerima di database Neon.  
3. **Visualisasi Otomatis**: Sistem secara otomatis menghasilkan graf 'Money Trail' untuk akun penerima hingga 3-4 lompatan ke depan untuk melihat apakah dana tersebut segera dipindahkan lagi.10  
4. **Tindakan Preventif**: Jika akun penerima menunjukkan pola 'mule account', sistem segera membekukan dana yang masih tersisa di akun tersebut untuk mencegah kerugian lebih lanjut.4  
5. **Umpan Balik AI**: Hasil investigasi manual oleh analis digunakan untuk melatih kembali (*retrain*) model AI secara berkala, memastikan sistem semakin cerdas seiring bertambahnya data.7

## **Keamanan Data dan Manajemen Akses SaaS**

Mengingat sensitivitas data keuangan, keamanan platform harus mengikuti prinsip *Zero Trust*.36 Manajemen akses harus menggunakan kontrol berbasis peran (*Role-Based Access Control* / RBAC), di mana akses ke fitur pembekuan rekening hanya diberikan kepada personel dengan otorisasi tingkat tinggi.28

### **Strategi Keamanan SaaS 2025-2026**

* **Enkripsi End-to-End**: Semua data transaksi dan PII (*Personally Identifiable Information*) harus dienkripsi baik saat transit maupun saat disimpan di Neon.36  
* **Audit Logging**: Setiap tindakan yang diambil oleh sistem otomatis atau analis manusia (misalnya, melihat graf money trail atau mengubah aturan AI) harus dicatat secara permanen dalam log audit yang tidak dapat diubah (*immutable*).8  
* **Keamanan Integrasi API**: Menggunakan OAuth 2.0 dan token JWT yang berumur pendek untuk komunikasi antara frontend Next.js dan backend API.36  
* **SSPM (SaaS Security Posture Management)**: Pemantauan otomatis terhadap konfigurasi salah pada infrastruktur Vercel dan Neon untuk mencegah kebocoran data.37

## **Kesimpulan dan Rekomendasi Strategis**

Desain aplikasi yang mengintegrasikan penanganan pengaduan nasabah dengan deteksi fraud berbasis AI merupakan langkah krusial bagi institusi keuangan untuk tetap kompetitif dan aman di era digital. Dengan memanfaatkan arsitektur modern Next.js dan Neon, bank dapat membangun sistem yang tidak hanya cepat dan akurat, tetapi juga efisien secara biaya dan operasional.

Rekomendasi utama untuk implementasi meliputi:

* **Fokus pada Explainability**: Pastikan setiap keputusan AI dapat dijelaskan untuk memenuhi standar audit OJK.  
* **Iterasi Aturan Secara Cepat**: Gunakan fitur branching Neon untuk menguji aturan baru setiap kali ada pola fraud baru yang muncul di pasar.  
* **Sentrisitas Nasabah**: Meskipun keamanan adalah prioritas, mekanisme untuk memulihkan akses bagi nasabah yang terkena dampak salah deteksi harus dibuat seefisien mungkin guna menjaga kepercayaan publik.  
* **Kolaborasi Data**: Pertimbangkan untuk berpartisipasi dalam pertukaran data intelijen fraud lintas industri untuk memperkaya profil risiko jaringan pada dashboard Money Trail.

Dengan mengikuti spesifikasi teknis dan fungsional ini, platform yang dibangun akan menjadi solusi tangguh yang mampu melindungi aset nasabah sekaligus meminimalkan risiko kerugian finansial bagi institusi perbankan.

#### **Works cited**

1. AI in Financial Fraud Detection Managerial Implications and Limitations, accessed May 14, 2026, [https://acr-journal.com/article/ai-in-financial-fraud-detection-managerial-implications-and-limitations-1929/](https://acr-journal.com/article/ai-in-financial-fraud-detection-managerial-implications-and-limitations-1929/)  
2. A systematic review and future directions for AI-driven detection of fraud patterns in SACCO transactions \- PMC, accessed May 14, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC12901501/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12901501/)  
3. (PDF) AI in Financial Services: Revolutionizing Fraud Detection and Risk Management, accessed May 14, 2026, [https://www.researchgate.net/publication/389556946\_AI\_in\_Financial\_Services\_Revolutionizing\_Fraud\_Detection\_and\_Risk\_Management](https://www.researchgate.net/publication/389556946_AI_in_Financial_Services_Revolutionizing_Fraud_Detection_and_Risk_Management)  
4. Fraud Analytics in Banking: Use Cases, Methods & AI, accessed May 14, 2026, [https://www.latentview.com/blog/fraud-analytics-in-banking/](https://www.latentview.com/blog/fraud-analytics-in-banking/)  
5. Fighting Financial Fraud with Graph Technology \- Neo4j, accessed May 14, 2026, [https://neo4j.com/blog/fraud-detection/fighting-financial-fraud-with-graph-technology/](https://neo4j.com/blog/fraud-detection/fighting-financial-fraud-with-graph-technology/)  
6. SAS Fraud Management & Fraud Detection Software, accessed May 14, 2026, [https://www.sas.com/en\_ae/software/fraud-management.html](https://www.sas.com/en_ae/software/fraud-management.html)  
7. Fraud Detection Architecture With Real-Time Intelligence \- Microsoft Fabric, accessed May 14, 2026, [https://learn.microsoft.com/en-us/fabric/real-time-intelligence/architectures/fraud-detection](https://learn.microsoft.com/en-us/fabric/real-time-intelligence/architectures/fraud-detection)  
8. How to Build a Simple, Modular, and AI-Powered Fraud Detection Workflow \- Orkes, accessed May 14, 2026, [https://orkes.io/blog/how-to-build-a-fraud-detection-management-workflow/](https://orkes.io/blog/how-to-build-a-fraud-detection-management-workflow/)  
9. \- 1 \- SALINAN PERATURAN OTORITAS JASA KEUANGAN ... \- OJK, accessed May 14, 2026, [https://www.ojk.go.id/id/regulasi/Documents/Pages/Penerapan-Strategi-Anti-Fraud-Bagi-Bank-Umum/pojk%2039-2019.pdf](https://www.ojk.go.id/id/regulasi/Documents/Pages/Penerapan-Strategi-Anti-Fraud-Bagi-Bank-Umum/pojk%2039-2019.pdf)  
10. Fund Trail Analysis Explained | AI-Powered Financial Intelligence \- Innefu Labs, accessed May 14, 2026, [https://innefu.com/fund-trail-analysis-a-practical-guide-for-financial-intelligence-agencies/](https://innefu.com/fund-trail-analysis-a-practical-guide-for-financial-intelligence-agencies/)  
11. Postgres for AI — Neon, accessed May 14, 2026, [https://neon.com/ai](https://neon.com/ai)  
12. React Flow vs Cytoscape: Choose the Right Graph Engine \- First AI Movers Radar, accessed May 14, 2026, [https://radar.firstaimovers.com/react-flow-vs-cytoscape-graph-engine-choice](https://radar.firstaimovers.com/react-flow-vs-cytoscape-graph-engine-choice)  
13. The Best Libraries and Methods to Render Large Force-Directed Graphs on the Web, accessed May 14, 2026, [https://weber-stephen.medium.com/the-best-libraries-and-methods-to-render-large-network-graphs-on-the-web-d122ece2f4dc](https://weber-stephen.medium.com/the-best-libraries-and-methods-to-render-large-network-graphs-on-the-web-d122ece2f4dc)  
14. React Workflow Editor SDK — Build & Embed Custom Workflow UIs, accessed May 14, 2026, [https://www.workflowbuilder.io/for-developers](https://www.workflowbuilder.io/for-developers)  
15. Using LLM Chaining for Enhanced Fraud Detection in Credit Card ..., accessed May 14, 2026, [https://ijsred.com/volume8/issue4/IJSRED-V8I4P176.pdf](https://ijsred.com/volume8/issue4/IJSRED-V8I4P176.pdf)  
16. AI in customer complaint management: Use cases, benefits and ..., accessed May 14, 2026, [https://www.leewayhertz.com/ai-in-complaint-management/](https://www.leewayhertz.com/ai-in-complaint-management/)  
17. AI Financial transaction system : Analyze, Detect Fraud, and Unlock Data Insights Using Natural language with LLM integration with Springboot Java and Angular App. \- Medium, accessed May 14, 2026, [https://medium.com/@wesky/ai-financial-transaction-system-analyze-detect-fraud-and-unlock-data-insights-using-natural-f6b98c552478](https://medium.com/@wesky/ai-financial-transaction-system-analyze-detect-fraud-and-unlock-data-insights-using-natural-f6b98c552478)  
18. The pgvector extension \- Neon Docs, accessed May 14, 2026, [https://neon.com/docs/extensions/pgvector](https://neon.com/docs/extensions/pgvector)  
19. PostgreSQL vector search guide: Everything you need to know about pgvector \- Northflank, accessed May 14, 2026, [https://northflank.com/blog/postgresql-vector-search-guide-with-pgvector](https://northflank.com/blog/postgresql-vector-search-guide-with-pgvector)  
20. Building Intelligent Search with AI Embeddings, Neon, and pgvector \- Neon Guides, accessed May 14, 2026, [https://neon.com/guides/ai-embeddings-postgres-search](https://neon.com/guides/ai-embeddings-postgres-search)  
21. PostgreSQL Tutorial \- Neon, accessed May 14, 2026, [https://neon.com/postgresql/tutorial](https://neon.com/postgresql/tutorial)  
22. PostgreSQL Recursive Query \- Neon, accessed May 14, 2026, [https://neon.com/postgresql/tutorial/recursive-query](https://neon.com/postgresql/tutorial/recursive-query)  
23. Fraud Rules vs. Workflows: Why Rules Alone Have a Ceiling \- Sardine AI, accessed May 14, 2026, [https://www.sardine.ai/blog/fraud-rules-vs-workflows](https://www.sardine.ai/blog/fraud-rules-vs-workflows)  
24. Combining Rules-based and AI Models to Combat Financial Fraud \- Databricks, accessed May 14, 2026, [https://www.databricks.com/blog/2021/01/19/combining-rules-based-and-ai-models-to-combat-financial-fraud.html](https://www.databricks.com/blog/2021/01/19/combining-rules-based-and-ai-models-to-combat-financial-fraud.html)  
25. Text-to-SQL LLM : A Practical Guide \- PuppyGraph, accessed May 14, 2026, [https://www.puppygraph.com/blog/text-to-sql-llm](https://www.puppygraph.com/blog/text-to-sql-llm)  
26. Visualizing First-party Bank Fraud \- yFiles, accessed May 14, 2026, [https://www.yfiles.com/resources/how-to/visualizing-first-party-bank-fraud](https://www.yfiles.com/resources/how-to/visualizing-first-party-bank-fraud)  
27. 15 Best Graph Visualization Tools for Your Neo4j Graph Database, accessed May 14, 2026, [https://neo4j.com/blog/graph-visualization/neo4j-graph-visualization-tools/](https://neo4j.com/blog/graph-visualization/neo4j-graph-visualization-tools/)  
28. What is SaaS Fraud Management? Features & Benefits \- PayPro Global, accessed May 14, 2026, [https://payproglobal.com/answers/what-is-saas-fraud-management/](https://payproglobal.com/answers/what-is-saas-fraud-management/)  
29. AI's impact on banking: use cases for credit scoring and fraud detection, accessed May 14, 2026, [https://www.bankingsupervision.europa.eu/press/supervisory-newsletters/newsletter/2025/html/ssm.nl251120\_1.en.html](https://www.bankingsupervision.europa.eu/press/supervisory-newsletters/newsletter/2025/html/ssm.nl251120_1.en.html)  
30. Build a Real-Time Fraud Detection Model with Natural Language in Snowflake ML, accessed May 14, 2026, [https://www.snowflake.com/en/developers/guides/build-real-time-fraud-detection-model-with-natural-language-in-snowflake-ml/](https://www.snowflake.com/en/developers/guides/build-real-time-fraud-detection-model-with-natural-language-in-snowflake-ml/)  
31. Four essential SaaS features you need in fraud detection software \- Mastercard, accessed May 14, 2026, [https://www.mastercard.com/global/en/news-and-trends/Insights/2024/four-essential-saas-features-you-need-in-fraud-detection-software.html](https://www.mastercard.com/global/en/news-and-trends/Insights/2024/four-essential-saas-features-you-need-in-fraud-detection-software.html)  
32. OJK to Revise Bank Account Regulations Amid Public Outcry Over Dormant Account Freezes \- Investortrust.id, accessed May 14, 2026, [https://investortrust.id/financial/74603/ojk-to-revise-bank-account-regulations-amid-public-outcry-over-dormant-account-freezes](https://investortrust.id/financial/74603/ojk-to-revise-bank-account-regulations-amid-public-outcry-over-dormant-account-freezes)  
33. New OJK Regulations on Managing Dormant Accounts \- News En.tempo.co, accessed May 14, 2026, [https://en.tempo.co/read/2067415/new-ojk-regulations-on-managing-dormant-accounts](https://en.tempo.co/read/2067415/new-ojk-regulations-on-managing-dormant-accounts)  
34. Perlindungan Hukum Terhadap Nasabah Atas Fraud Pada Transaksi Bank Digital \- Lembaga Penelitian dan Pendidikan (LPP) Mandala, accessed May 14, 2026, [https://ejournal.mandalanursa.org/index.php/JISIP/article/download/4428/3299](https://ejournal.mandalanursa.org/index.php/JISIP/article/download/4428/3299)  
35. Apakah OJK Punya Hak Memblokir Rekening? Simak Penjelasan Terbaru dan Solusinya, accessed May 14, 2026, [https://www.seva.id/blog/apakah-ojk-punya-hak-memblokir-rekening-simak-penjelasan-terbaru-dan-solusinya-kg](https://www.seva.id/blog/apakah-ojk-punya-hak-memblokir-rekening-simak-penjelasan-terbaru-dan-solusinya-kg)  
36. 7 SaaS Security Best Practices for 2025 \- Jit.io, accessed May 14, 2026, [https://www.jit.io/resources/app-security/7-saas-security-best-practices-for-2025](https://www.jit.io/resources/app-security/7-saas-security-best-practices-for-2025)  
37. SaaS Security Best Practices and Strategies for 2025, accessed May 14, 2026, [https://www.valencesecurity.com/resources/blogs/saas-security-best-practices-and-strategies-for-2025](https://www.valencesecurity.com/resources/blogs/saas-security-best-practices-and-strategies-for-2025)  
38. SaaS Security: The Challenge and 7 Critical Best Practices \- Cynet, accessed May 14, 2026, [https://www.cynet.com/security-foundations/cybersecurity/saas-security-the-challenge-and-7-critical-best-practices/](https://www.cynet.com/security-foundations/cybersecurity/saas-security-the-challenge-and-7-critical-best-practices/)  
39. How to master SaaS compliance in 2025: Essential checklist & guide \- Scrut, accessed May 14, 2026, [https://www.scrut.io/post/saas-compliance](https://www.scrut.io/post/saas-compliance)