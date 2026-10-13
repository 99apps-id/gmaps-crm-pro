/**
 * Global Catalog - GMaps CRM Pro
 *
 * Kategori produk & jasa lintas negara (bilingual ID/EN), dirancang agar
 * hasilnya langsung berguna sebagai leads CRM (ada kontak, alamat, rating).
 *
 * Setiap kategori punya:
 * - labelId/labelEn: nama ramah non-teknis untuk UI
 * - keywordsId/keywordsEn: varian query pencarian per bahasa
 * - leadScore: bobot prioritas CRM (1-5, makin tinggi makin layak dikejar)
 */

export const UI_LANGS = ['id', 'en'];

export const CATEGORY_SECTORS = [
  {
    id: 'food_retail',
    nameId: 'Makanan, Warung & Toko Harian',
    nameEn: 'Food, Shops & Daily Retail',
    iconName: 'shopping-cart',
    categories: [
      { id: 'warung', labelId: 'Warung Makan & Warteg', labelEn: 'Food stalls & eateries', keywordsId: ['warung makan', 'warteg', 'warung nasi', 'rumah makan'], keywordsEn: ['food stall', 'eatery', 'local restaurant'], leadScore: 3 },
      { id: 'toko_kelontong', labelId: 'Toko Kelontong & Sembako', labelEn: 'Grocery & convenience stores', keywordsId: ['toko kelontong', 'toko sembako', 'warung sembako', 'grosir sembako'], keywordsEn: ['grocery store', 'convenience store', 'mini market'], leadScore: 4 },
      { id: 'minimarket', labelId: 'Minimarket & Supermarket', labelEn: 'Minimarket & supermarket', keywordsId: ['minimarket', 'supermarket', 'pasar modern'], keywordsEn: ['supermarket', 'hypermarket', 'grocery supermarket'], leadScore: 3 },
      { id: 'kafe', labelId: 'Kafe & Tempat Ngopi', labelEn: 'Cafes & coffee shops', keywordsId: ['kafe', 'coffee shop', 'tempat ngopi', 'warkop modern'], keywordsEn: ['cafe', 'coffee shop', 'espresso bar'], leadScore: 4 },
      { id: 'restoran', labelId: 'Restoran & Rumah Makan', labelEn: 'Restaurants', keywordsId: ['restoran', 'rumah makan', 'restoran keluarga'], keywordsEn: ['restaurant', 'family restaurant', 'dining'], leadScore: 4 },
      { id: 'bakery', labelId: 'Toko Roti & Kue', labelEn: 'Bakery & cake shops', keywordsId: ['toko roti', 'toko kue', 'bakery', 'pastry'], keywordsEn: ['bakery', 'cake shop', 'pastry shop'], leadScore: 3 },
      { id: 'katering', labelId: 'Katering & Nasi Kotak', labelEn: 'Catering services', keywordsId: ['katering', 'catering', 'nasi box', 'nasi kotak'], keywordsEn: ['catering service', 'event catering', 'food catering'], leadScore: 5 },
      { id: 'rumah_makan_padang', labelId: 'Rumah Makan Padang', labelEn: 'Padang restaurants', keywordsId: ['rumah makan padang', 'restoran padang', 'masakan padang', 'nasi padang'], keywordsEn: ['padang restaurant', 'padang food'], leadScore: 3 },
      { id: 'seafood', labelId: 'Seafood & Ikan Bakar', labelEn: 'Seafood restaurants', keywordsId: ['seafood', 'restoran seafood', 'ikan bakar', 'cumi saus padang'], keywordsEn: ['seafood restaurant', 'grilled fish restaurant'], leadScore: 3 },
      { id: 'mie_bakso', labelId: 'Mie Ayam & Bakso', labelEn: 'Noodle & meatball stalls', keywordsId: ['mie ayam', 'bakso', 'mie bakso', 'bakso malang'], keywordsEn: ['noodle stall', 'meatball soup'], leadScore: 3 },
      { id: 'depot_air_minum', labelId: 'Depot Air Minum Isi Ulang', labelEn: 'Refill water depots', keywordsId: ['depot air minum', 'air isi ulang', 'galon isi ulang', 'depot air biru'], keywordsEn: ['water refill station', 'drinking water depot'], leadScore: 4 }
    ]
  },
  {
    id: 'professional_services',
    nameId: 'Konsultan, Hukum & Keuangan',
    nameEn: 'Consulting, Legal & Finance',
    iconName: 'briefcase',
    categories: [
      { id: 'konsultan_pajak', labelId: 'Konsultan Pajak', labelEn: 'Tax consultant', keywordsId: ['konsultan pajak', 'jasa pajak', 'tax consultant', 'kantor konsultan pajak'], keywordsEn: ['tax consultant', 'tax advisor', 'tax consulting firm'], leadScore: 5 },
      { id: 'akuntan', labelId: 'Akuntan & Pembukuan', labelEn: 'Accountant & bookkeeping', keywordsId: ['kantor akuntan', 'jasa pembukuan', 'akuntan publik', 'jasa akuntansi'], keywordsEn: ['accounting firm', 'bookkeeping service', 'certified accountant'], leadScore: 5 },
      { id: 'kantor_hukum', labelId: 'Kantor Hukum & Pengacara', labelEn: 'Law firm & lawyer', keywordsId: ['kantor hukum', 'pengacara', 'advokat', 'law firm', 'konsultan hukum'], keywordsEn: ['law firm', 'lawyer', 'attorney office', 'legal consultant'], leadScore: 5 },
      { id: 'notaris', labelId: 'Notaris & PPAT', labelEn: 'Notary public', keywordsId: ['notaris', 'kantor notaris', 'notaris ppat', 'ppat'], keywordsEn: ['notary public', 'notary office', 'conveyancer'], leadScore: 5 },
      { id: 'agen_asuransi', labelId: 'Agen Asuransi & Keuangan', labelEn: 'Insurance & finance agents', keywordsId: ['agen asuransi', 'asuransi jiwa', 'konsultan keuangan'], keywordsEn: ['insurance agency', 'insurance agent', 'financial advisor'], leadScore: 4 }
    ]
  },
  {
    id: 'manufacturing',
    nameId: 'Pabrik, Gudang & Industri',
    nameEn: 'Factories, Warehouses & Industry',
    iconName: 'factory',
    categories: [
      { id: 'pabrik_makanan', labelId: 'Pabrik Makanan & Minuman', labelEn: 'Food & beverage factories', keywordsId: ['pabrik makanan', 'pabrik minuman', 'industri makanan'], keywordsEn: ['food factory', 'beverage plant', 'food manufacturing'], leadScore: 5 },
      { id: 'pabrik_garmen', labelId: 'Pabrik Garmen & Tekstil', labelEn: 'Garment & textile factories', keywordsId: ['pabrik garmen', 'konveksi', 'pabrik tekstil', 'garment'], keywordsEn: ['garment factory', 'textile mill', 'apparel manufacturer'], leadScore: 5 },
      { id: 'pabrik_plastik', labelId: 'Pabrik Plastik & Kemasan', labelEn: 'Plastic & packaging factories', keywordsId: ['pabrik plastik', 'pabrik kemasan', 'industri kemasan'], keywordsEn: ['plastic factory', 'packaging manufacturer'], leadScore: 5 },
      { id: 'pabrik_furniture', labelId: 'Pabrik Furniture & Kayu', labelEn: 'Furniture & wood factories', keywordsId: ['pabrik furniture', 'pabrik mebel', 'industri kayu'], keywordsEn: ['furniture factory', 'woodworking factory'], leadScore: 4 },
      { id: 'pabrik_elektronik', labelId: 'Pabrik Elektronik & Komponen', labelEn: 'Electronics factories', keywordsId: ['pabrik elektronik', 'industri elektronik'], keywordsEn: ['electronics factory', 'electronics manufacturer'], leadScore: 5 },
      { id: 'pabrik_otomotif', labelId: 'Pabrik Suku Cadang & Otomotif', labelEn: 'Auto parts factories', keywordsId: ['pabrik sparepart', 'pabrik otomotif', 'industri otomotif'], keywordsEn: ['auto parts factory', 'automotive supplier'], leadScore: 5 },
      { id: 'gudang_logistik', labelId: 'Gudang & Distribusi', labelEn: 'Warehouses & distribution', keywordsId: ['gudang', 'jasa gudang', 'distributor', 'gudang logistik'], keywordsEn: ['warehouse', 'distribution center', 'logistics warehouse'], leadScore: 4 },
      { id: 'supplier_bangunan', labelId: 'Toko Bangunan & Material', labelEn: 'Building material stores', keywordsId: ['toko bangunan', 'toko material', 'depo bangunan'], keywordsEn: ['building material store', 'hardware store'], leadScore: 4 }
    ]
  },
  {
    id: 'health_beauty',
    nameId: 'Kesehatan & Kecantikan',
    nameEn: 'Health & Beauty',
    iconName: 'activity',
    categories: [
      { id: 'klinik_umum', labelId: 'Klinik & Praktik Dokter', labelEn: 'Clinics & doctor practices', keywordsId: ['klinik', 'praktik dokter', 'klinik umum', 'klinik 24 jam'], keywordsEn: ['clinic', 'medical clinic', 'doctor office'], leadScore: 5 },
      { id: 'klinik_gigi', labelId: 'Klinik Gigi', labelEn: 'Dental clinics', keywordsId: ['klinik gigi', 'dokter gigi', 'dental clinic'], keywordsEn: ['dental clinic', 'dentist'], leadScore: 5 },
      { id: 'apotek', labelId: 'Apotek & Farmasi', labelEn: 'Pharmacy', keywordsId: ['apotek', 'apotik', 'apotek 24 jam', 'farmasi'], keywordsEn: ['pharmacy', 'drugstore'], leadScore: 4 },
      { id: 'optik', labelId: 'Optik & Kacamata', labelEn: 'Optical shops', keywordsId: ['optik', 'toko kacamata', 'optik melawai', 'periksa mata'], keywordsEn: ['optical shop', 'eyewear store', 'optician'], leadScore: 4 },
      { id: 'lab_medis', labelId: 'Laboratorium Medis', labelEn: 'Medical laboratories', keywordsId: ['laboratorium', 'lab klinik', 'lab medis', 'cek darah', 'medical check up'], keywordsEn: ['medical laboratory', 'clinical lab', 'diagnostic lab'], leadScore: 5 },
      { id: 'klinik_kecantikan', labelId: 'Klinik Kecantikan', labelEn: 'Beauty clinics', keywordsId: ['klinik kecantikan', 'beauty clinic', 'klinik estetika'], keywordsEn: ['beauty clinic', 'aesthetic clinic', 'skincare clinic'], leadScore: 5 },
      { id: 'salon_spa', labelId: 'Salon & Spa', labelEn: 'Salon & spa', keywordsId: ['salon', 'spa', 'barbershop', 'pangkas rambut'], keywordsEn: ['salon', 'spa', 'barbershop', 'hair salon'], leadScore: 4 },
      { id: 'pijat_refleksi', labelId: 'Pijat & Refleksi', labelEn: 'Massage & reflexology', keywordsId: ['pijat', 'refleksi', 'pijat refleksi', 'pijat panggilan', 'spa refleksi'], keywordsEn: ['massage', 'reflexology', 'massage spa'], leadScore: 3 },
      { id: 'gym', labelId: 'Gym & Kebugaran', labelEn: 'Gym & fitness', keywordsId: ['gym', 'fitness', 'tempat fitness', 'studio senam'], keywordsEn: ['gym', 'fitness center', 'yoga studio'], leadScore: 3 }
    ]
  },
  {
    id: 'automotive',
    nameId: 'Otomotif & Bengkel',
    nameEn: 'Automotive & Repair',
    iconName: 'truck',
    categories: [
      { id: 'bengkel_mobil', labelId: 'Bengkel Mobil', labelEn: 'Car repair shops', keywordsId: ['bengkel mobil', 'servis mobil', 'tune up mobil'], keywordsEn: ['car repair', 'auto repair shop', 'car service'], leadScore: 4 },
      { id: 'bengkel_motor', labelId: 'Bengkel Motor', labelEn: 'Motorcycle repair', keywordsId: ['bengkel motor', 'servis motor'], keywordsEn: ['motorcycle repair', 'bike service'], leadScore: 3 },
      { id: 'cuci_kendaraan', labelId: 'Cuci Mobil & Motor', labelEn: 'Car wash', keywordsId: ['cuci mobil', 'car wash', 'steam mobil motor'], keywordsEn: ['car wash', 'auto detailing'], leadScore: 3 },
      { id: 'toko_ban', labelId: 'Toko Ban & Velg', labelEn: 'Tire shops', keywordsId: ['toko ban', 'spooring balancing', 'velg mobil'], keywordsEn: ['tire shop', 'wheel alignment'], leadScore: 4 },
      { id: 'dealer', labelId: 'Dealer & Showroom', labelEn: 'Dealers & showrooms', keywordsId: ['dealer mobil', 'dealer motor', 'showroom'], keywordsEn: ['car dealer', 'motorcycle dealer'], leadScore: 4 },
      { id: 'mobil_bekas', labelId: 'Jual Beli Mobil Bekas', labelEn: 'Used car dealers', keywordsId: ['mobil bekas', 'jual beli mobil bekas', 'showroom mobil bekas', 'mobil second'], keywordsEn: ['used car dealer', 'second hand cars'], leadScore: 5 },
      { id: 'derek_towing', labelId: 'Derek & Towing', labelEn: 'Towing services', keywordsId: ['derek mobil', 'jasa towing', 'towing mobil', 'derek 24 jam'], keywordsEn: ['towing service', 'car towing', 'roadside assistance'], leadScore: 4 },
      { id: 'rental_mobil', labelId: 'Rental & Sewa Mobil', labelEn: 'Car rentals', keywordsId: ['rental mobil', 'sewa mobil', 'rental hiace', 'sewa elf'], keywordsEn: ['car rental', 'car hire'], leadScore: 4 }
    ]
  },
  {
    id: 'property',
    nameId: 'Properti & Tempat Tinggal',
    nameEn: 'Property & Living',
    iconName: 'building',
    categories: [
      { id: 'kost', labelId: 'Kost & Rumah Sewa', labelEn: 'Boarding houses & rentals', keywordsId: ['kost', 'kosan', 'kontrakan', 'sewa rumah'], keywordsEn: ['boarding house', 'room for rent', 'rental house'], leadScore: 3 },
      { id: 'apartemen', labelId: 'Apartemen Sewa', labelEn: 'Apartment rentals', keywordsId: ['sewa apartemen', 'apartemen harian', 'apartemen bulanan'], keywordsEn: ['apartment rental', 'serviced apartment'], leadScore: 3 },
      { id: 'hotel', labelId: 'Hotel & Penginapan', labelEn: 'Hotels & lodging', keywordsId: ['hotel', 'penginapan', 'homestay', 'guest house'], keywordsEn: ['hotel', 'guesthouse', 'homestay', 'inn'], leadScore: 4 },
      { id: 'agen_properti', labelId: 'Agen Properti', labelEn: 'Property agents', keywordsId: ['agen properti', 'agen rumah', 'makelar rumah'], keywordsEn: ['real estate agent', 'property agency'], leadScore: 5 }
    ]
  },
  {
    id: 'education',
    nameId: 'Kursus & Pendidikan',
    nameEn: 'Courses & Education',
    iconName: 'book',
    categories: [
      { id: 'bimbel', labelId: 'Bimbingan Belajar', labelEn: 'Tutoring centers', keywordsId: ['bimbingan belajar', 'bimbel', 'les privat'], keywordsEn: ['tutoring center', 'private tutor'], leadScore: 4 },
      { id: 'kursus_bahasa', labelId: 'Kursus Bahasa', labelEn: 'Language courses', keywordsId: ['kursus bahasa inggris', 'kursus bahasa', 'english course'], keywordsEn: ['language school', 'english course'], leadScore: 4 },
      { id: 'kursus_skill', labelId: 'Kursus Keterampilan', labelEn: 'Skill courses', keywordsId: ['kursus komputer', 'kursus menjahit', 'kursus masak', 'pelatihan kerja'], keywordsEn: ['computer course', 'vocational training', 'cooking class'], leadScore: 4 }
    ]
  },
  {
    id: 'digital_services',
    nameId: 'Jasa Digital & Kreatif',
    nameEn: 'Digital & Creative Services',
    iconName: 'laptop',
    categories: [
      { id: 'percetakan', labelId: 'Percetakan & Sablon', labelEn: 'Printing services', keywordsId: ['percetakan', 'digital printing', 'sablon', 'fotocopy'], keywordsEn: ['print shop', 'printing service'], leadScore: 4 },
      { id: 'studio_foto', labelId: 'Studio Foto & Wedding', labelEn: 'Photo studios & wedding', keywordsId: ['studio foto', 'fotografer', 'wedding organizer'], keywordsEn: ['photo studio', 'wedding photographer', 'event organizer'], leadScore: 4 },
      { id: 'jasa_iklan', labelId: 'Jasa Iklan & Digital', labelEn: 'Advertising & digital agencies', keywordsId: ['jasa iklan', 'digital marketing', 'agensi iklan'], keywordsEn: ['advertising agency', 'digital marketing agency'], leadScore: 5 }
    ]
  },
  {
    id: 'home_services',
    nameId: 'Jasa Rumah Tangga',
    nameEn: 'Home Services',
    iconName: 'hammer',
    categories: [
      { id: 'laundry', labelId: 'Laundry', labelEn: 'Laundry', keywordsId: ['laundry', 'laundry kiloan', 'dry clean'], keywordsEn: ['laundry', 'laundromat', 'dry cleaner'], leadScore: 3 },
      { id: 'servis_ac', labelId: 'Servis AC & Elektronik', labelEn: 'AC & electronics service', keywordsId: ['servis ac', 'servis elektronik', 'tukang ac'], keywordsEn: ['aircon service', 'appliance repair'], leadScore: 4 },
      { id: 'tukang', labelId: 'Tukang & Renovasi', labelEn: 'Contractors & renovation', keywordsId: ['tukang bangunan', 'jasa renovasi', 'kontraktor'], keywordsEn: ['contractor', 'renovation service', 'handyman'], leadScore: 4 },
      { id: 'ekspedisi', labelId: 'Ekspedisi & Logistik', labelEn: 'Courier & logistics', keywordsId: ['ekspedisi', 'jasa kirim', 'logistik'], keywordsEn: ['courier service', 'logistics company', 'freight'], leadScore: 4 },
      { id: 'cleaning_service', labelId: 'Cleaning Service Panggilan', labelEn: 'Home cleaning services', keywordsId: ['cleaning service', 'jasa bersih rumah', 'general cleaning', 'cuci sofa', 'cuci kasur'], keywordsEn: ['home cleaning service', 'house cleaning', 'deep cleaning'], leadScore: 4 },
      { id: 'sedot_wc', labelId: 'Sedot WC & Limbah', labelEn: 'Septic tank services', keywordsId: ['sedot wc', 'sedot tinja', 'sedot limbah', 'sedot wc murah'], keywordsEn: ['septic tank service', 'sewage service'], leadScore: 4 },
      { id: 'pest_control', labelId: 'Jasa Anti Hama & Rayap', labelEn: 'Pest control', keywordsId: ['pest control', 'anti rayap', 'jasa fogging', 'pembasmi hama'], keywordsEn: ['pest control', 'termite control', 'fumigation service'], leadScore: 4 }
    ]
  },
  {
    id: 'tech_gadget',
    nameId: 'Komputer & Gadget',
    nameEn: 'Computers & Gadgets',
    iconName: 'cpu',
    categories: [
      { id: 'toko_komputer', labelId: 'Toko Komputer & Laptop', labelEn: 'Computer stores', keywordsId: ['toko komputer', 'toko laptop', 'laptop store'], keywordsEn: ['computer store', 'laptop shop'], leadScore: 4 },
      { id: 'servis_komputer', labelId: 'Servis Komputer & HP', labelEn: 'Computer & phone repair', keywordsId: ['servis komputer', 'servis hp', 'service center'], keywordsEn: ['computer repair', 'phone repair'], leadScore: 4 },
      { id: 'toko_hp', labelId: 'Toko HP & Counter', labelEn: 'Phone shops', keywordsId: ['toko hp', 'counter hp', 'toko handphone'], keywordsEn: ['phone shop', 'mobile store'], leadScore: 3 }
    ]
  },
  {
    id: 'it_telecom',
    nameId: 'IT & Telekomunikasi',
    nameEn: 'IT & Telecommunications',
    iconName: 'cpu',
    categories: [
      { id: 'software_house', labelId: 'Perusahaan Software & Aplikasi', labelEn: 'Software companies', keywordsId: ['software house', 'perusahaan software', 'jasa pembuatan aplikasi', 'pengembang aplikasi'], keywordsEn: ['software company', 'software house', 'app development company'], leadScore: 5 },
      { id: 'web_developer', labelId: 'Jasa Web Developer & IT Konsultan', labelEn: 'Web developers & IT consultants', keywordsId: ['web developer', 'jasa pembuatan website', 'konsultan it', 'it consultant'], keywordsEn: ['web developer', 'web design agency', 'it consultant'], leadScore: 5 },
      { id: 'it_infrastructure', labelId: 'Infrastruktur IT & Jaringan', labelEn: 'IT infrastructure & networks', keywordsId: ['jasa jaringan komputer', 'instalasi server', 'it infrastructure', 'networking', 'data center'], keywordsEn: ['network installation', 'it infrastructure', 'server installation', 'data center service'], leadScore: 5 },
      { id: 'internet_provider', labelId: 'Internet & Telekomunikasi', labelEn: 'Internet & telecom providers', keywordsId: ['internet provider', 'isp', 'pasang wifi', 'telekomunikasi'], keywordsEn: ['internet provider', 'isp', 'telecom company'], leadScore: 4 },
      { id: 'cctv_security_system', labelId: 'CCTV & Sistem Keamanan', labelEn: 'CCTV & security systems', keywordsId: ['pasang cctv', 'cctv', 'sistem keamanan', 'alarm keamanan'], keywordsEn: ['cctv installation', 'security system', 'surveillance'], leadScore: 4 },
      { id: 'digital_agency', labelId: 'Agensi Digital & SEO', labelEn: 'Digital & SEO agencies', keywordsId: ['digital agency', 'jasa seo', 'social media management'], keywordsEn: ['digital agency', 'seo agency', 'social media agency'], leadScore: 5 }
    ]
  },
  {
    id: 'outsourcing_manpower',
    nameId: 'Outsourcing & Tenaga Kerja',
    nameEn: 'Outsourcing & Manpower',
    iconName: 'briefcase',
    categories: [
      { id: 'outsourcing_kebersihan', labelId: 'Outsourcing Kebersihan & Office Boy', labelEn: 'Cleaning outsourcing', keywordsId: ['outsourcing kebersihan', 'jasa cleaning service', 'jasa office boy', 'cleaning service kantor'], keywordsEn: ['cleaning service company', 'janitorial service', 'office cleaning'], leadScore: 5 },
      { id: 'outsourcing_keamanan', labelId: 'Outsourcing Keamanan & Satpam', labelEn: 'Security guard outsourcing', keywordsId: ['outsourcing satpam', 'jasa keamanan', 'jasa satpam', 'security service'], keywordsEn: ['security guard service', 'manned guarding', 'security company'], leadScore: 5 },
      { id: 'outsourcing_pabrik', labelId: 'Outsourcing Pabrik & Operator', labelEn: 'Factory labor outsourcing', keywordsId: ['outsourcing pabrik', 'jasa tenaga kerja pabrik', 'outsourcing operator produksi'], keywordsEn: ['factory staffing', 'industrial manpower', 'production labor supply'], leadScore: 5 },
      { id: 'outsourcing_migas', labelId: 'Outsourcing Oil & Gas / Tambang', labelEn: 'Oil & gas manpower', keywordsId: ['outsourcing oil and gas', 'jasa man power migas', 'outsourcing tambang'], keywordsEn: ['oil and gas manpower', 'mining manpower', 'energy staffing'], leadScore: 5 },
      { id: 'outsourcing_driver', labelId: 'Outsourcing Supir & Logistik', labelEn: 'Driver outsourcing', keywordsId: ['outsourcing supir', 'jasa supir', 'outsourcing driver'], keywordsEn: ['driver supply service', 'chauffeur service'], leadScore: 4 },
      { id: 'yayasan_penyalur', labelId: 'Penyalur Tenaga Kerja & SPG', labelEn: 'Labor suppliers', keywordsId: ['penyalur tenaga kerja', 'yayasan outsourcing', 'jasa spg', 'tenaga kerja kontrak'], keywordsEn: ['staffing agency', 'labor supplier', 'manpower agency'], leadScore: 5 }
    ]
  },
  {
    id: 'agro_marine',
    nameId: 'Perikanan, Pertanian & Perkebunan',
    nameEn: 'Fisheries, Agriculture & Plantations',
    iconName: 'leaf',
    categories: [
      { id: 'budidaya_perikanan', labelId: 'Budidaya Perikanan & Tambak', labelEn: 'Fish farms & aquaculture', keywordsId: ['budidaya ikan', 'tambak ikan', 'kolam ikan', 'budidaya lele', 'budidaya udang', 'tambak udang'], keywordsEn: ['fish farm', 'aquaculture farm', 'shrimp farm', 'fish hatchery'], leadScore: 4 },
      { id: 'kelautan', labelId: 'Kelautan & Hasil Laut', labelEn: 'Marine & seafood suppliers', keywordsId: ['hasil laut', 'nelayan', 'pelelangan ikan', 'tpi ikan', 'supplier ikan', 'distributor seafood'], keywordsEn: ['seafood supplier', 'fish market', 'fishery', 'marine product supplier'], leadScore: 4 },
      { id: 'pertanian', labelId: 'Pertanian & Agribisnis', labelEn: 'Agriculture & agribusiness', keywordsId: ['pertanian', 'agribisnis', 'hortikultura', 'lahan pertanian', 'gapoktan', 'usaha tani'], keywordsEn: ['agriculture', 'agribusiness', 'horticulture', 'crop farm'], leadScore: 4 },
      { id: 'perkebunan', labelId: 'Perkebunan & Komoditas', labelEn: 'Plantations & commodities', keywordsId: ['perkebunan', 'kebun sawit', 'kebun karet', 'kebun kopi', 'kebun teh', 'komoditas perkebunan'], keywordsEn: ['plantation', 'palm oil plantation', 'rubber plantation', 'coffee plantation'], leadScore: 5 },
      { id: 'pakan_hewan', labelId: 'Toko Pakan Hewan & Ternak', labelEn: 'Animal feed stores', keywordsId: ['toko pakan', 'pakan ternak', 'pakan ikan', 'pakan ayam', 'pakan hewan', 'toko pakan burung'], keywordsEn: ['animal feed store', 'livestock feed', 'poultry feed', 'fish feed supplier'], leadScore: 4 }
    ]
  },
  {
    id: 'sekolah_formal',
    nameId: 'Sekolah & Pesantren',
    nameEn: 'Schools & Islamic Boarding',
    iconName: 'book',
    categories: [
      { id: 'sekolah_umum', labelId: 'Sekolah Umum (SD/SMP/SMA)', labelEn: 'Public & private schools', keywordsId: ['sekolah', 'sd negeri', 'smp negeri', 'sma negeri', 'sekolah dasar', 'smu'], keywordsEn: ['school', 'elementary school', 'junior high school', 'senior high school'], leadScore: 4 },
      { id: 'sdit', labelId: 'SDIT', labelEn: 'Integrated Islamic elementary', keywordsId: ['sdit', 'sd islam terpadu', 'sekolah dasar islam terpadu'], keywordsEn: ['islamic elementary school', 'integrated islamic school'], leadScore: 4 },
      { id: 'smpit', labelId: 'SMPIT', labelEn: 'Integrated Islamic junior high', keywordsId: ['smpit', 'smp islam terpadu', 'sekolah menengah islam terpadu'], keywordsEn: ['islamic junior high school', 'integrated islamic school'], leadScore: 4 },
      { id: 'smait', labelId: 'SMAIT', labelEn: 'Integrated Islamic senior high', keywordsId: ['smait', 'sma islam terpadu', 'sekolah atas islam terpadu'], keywordsEn: ['islamic senior high school', 'integrated islamic school'], leadScore: 4 },
      { id: 'smk', labelId: 'SMK & Kejuruan', labelEn: 'Vocational schools', keywordsId: ['smk', 'sekolah menengah kejuruan', 'smk negeri', 'smk swasta'], keywordsEn: ['vocational school', 'vocational high school'], leadScore: 4 },
      { id: 'sekolah_sunnah', labelId: 'Sekolah Sunnah (Assunnah)', labelEn: 'Sunnah schools', keywordsId: ['sekolah sunnah', 'assunnah', 'as-sunnah', 'tahfidz quran', 'mahad tahfidz'], keywordsEn: ['quran memorization school', 'tahfidz school', 'sunnah school'], leadScore: 3 },
      { id: 'pesantren', labelId: 'Pesantren & Pondok', labelEn: 'Islamic boarding schools', keywordsId: ['pesantren', 'pondok pesantren', 'ponpes', 'pesantren modern'], keywordsEn: ['islamic boarding school', 'pesantren'], leadScore: 4 },
      { id: 'homeschooling', labelId: 'Homeschooling & PKBM', labelEn: 'Homeschooling', keywordsId: ['homeschooling', 'sekolah rumah', 'pkbm', 'homeschooling islam'], keywordsEn: ['homeschooling', 'home school', 'community learning center'], leadScore: 3 }
    ]
  }
];

/**
 * Wilayah multinegara. Struktur: country -> regions[] -> cities[].
 * subDistricts dipakai untuk memperdalam query (kecamatan/distrik).
 */
export const COUNTRIES = [
  {
    id: 'ID',
    nameId: 'Indonesia',
    nameEn: 'Indonesia',
    phoneCode: '+62',
    regions: [
      {
        regionId: 'ID-jabodetabek',
        nameId: 'Jabodetabek & Banten',
        nameEn: 'Greater Jakarta & Banten',
        cities: [
          { name: 'Jakarta Selatan', provinceId: 'DKI Jakarta', provinceEn: 'Jakarta', subDistricts: ['Tebet', 'Setiabudi', 'Mampang', 'Pancoran', 'Pasar Minggu', 'Cilandak', 'Kebayoran Baru', 'Jagakarsa'] },
          { name: 'Jakarta Pusat', provinceId: 'DKI Jakarta', provinceEn: 'Jakarta', subDistricts: ['Menteng', 'Tanah Abang', 'Senen', 'Kemayoran', 'Gambir'] },
          { name: 'Jakarta Barat', provinceId: 'DKI Jakarta', provinceEn: 'Jakarta', subDistricts: ['Grogol', 'Palmerah', 'Kebon Jeruk', 'Kembangan', 'Cengkareng'] },
          { name: 'Jakarta Timur', provinceId: 'DKI Jakarta', provinceEn: 'Jakarta', subDistricts: ['Matraman', 'Jatinegara', 'Duren Sawit', 'Kramat Jati', 'Pulo Gadung'] },
          { name: 'Jakarta Utara', provinceId: 'DKI Jakarta', provinceEn: 'Jakarta', subDistricts: ['Kelapa Gading', 'Sunter', 'Tanjung Priok', 'Pluit', 'Penjaringan'] },
          { name: 'Tangerang', provinceId: 'Banten', provinceEn: 'Banten', subDistricts: ['BSD', 'Serpong', 'Alam Sutera', 'Cikupa', 'Balaraja'] },
          { name: 'Cilegon', provinceId: 'Banten', provinceEn: 'Banten', subDistricts: ['Ciwandan', 'Citangkil', 'Pulomerak'] },
          { name: 'Serang', provinceId: 'Banten', provinceEn: 'Banten', subDistricts: ['Kasemen', 'Curug', 'Cipocok Jaya'] },
          { name: 'Bandung', provinceId: 'Jawa Barat', provinceEn: 'West Java', subDistricts: ['Coblong', 'Sukajadi', 'Dago', 'Lengkong', 'Cicendo', 'Pasteur', 'Cihampelas'] },
          { name: 'Bekasi', provinceId: 'Jawa Barat', provinceEn: 'West Java', subDistricts: ['Bekasi Barat', 'Bekasi Timur', 'Bekasi Selatan', 'Bekasi Utara', 'Bantar Gebang'] },
          { name: 'Depok', provinceId: 'Jawa Barat', provinceEn: 'West Java', subDistricts: ['Beji', 'Margonda', 'Cimanggis', 'Sawangan', 'Cinere'] },
          { name: 'Bogor', provinceId: 'Jawa Barat', provinceEn: 'West Java', subDistricts: ['Bogor Barat', 'Bogor Timur', 'Tanah Sareal', 'Cibinong', 'Gunung Putri'] },
          { name: 'Cirebon', provinceId: 'Jawa Barat', provinceEn: 'West Java', subDistricts: ['Kesambi', 'Kejaksan', 'Lemahwungkuk', 'Pekalipan'] }
        ]
      },
      {
        regionId: 'ID-jawa',
        nameId: 'Jawa Tengah & Jawa Timur',
        nameEn: 'Central Java & East Java',
        cities: [
          { name: 'Surabaya', provinceId: 'Jawa Timur', provinceEn: 'East Java', subDistricts: ['Gubeng', 'Sukolilo', 'Rungkut', 'Wonokromo', 'HR Muhammad', 'Tandes', 'Benowo'] },
          { name: 'Malang', provinceId: 'Jawa Timur', provinceEn: 'East Java', subDistricts: ['Lowokwaru', 'Klojen', 'Sukun', 'Blimbing', 'Kedungkandang'] },
          { name: 'Kediri', provinceId: 'Jawa Timur', provinceEn: 'East Java', subDistricts: ['Kota', 'Pesantren', 'Pare', 'Ngadiluwih'] },
          { name: 'Blitar', provinceId: 'Jawa Timur', provinceEn: 'East Java', subDistricts: ['Kepanjen', 'Sukorejo', 'Tulungagung'] },
          { name: 'Semarang', provinceId: 'Jawa Tengah', provinceEn: 'Central Java', subDistricts: ['Tembalang', 'Banyumanik', 'Pedurungan', 'Semarang Barat', 'Gajah Mungkur'] },
          { name: 'Solo', provinceId: 'Jawa Tengah', provinceEn: 'Central Java', subDistricts: ['Laweyan', 'Pasar Kliwon', 'Banjarsari', 'Jebres'] },
          { name: 'Yogyakarta', provinceId: 'DI Yogyakarta', provinceEn: 'Yogyakarta', subDistricts: ['Depok Sleman', 'Pogung', 'Seturan', 'Gejayan', 'Bantul', 'Umbulharjo'] },
          { name: 'Pekalongan', provinceId: 'Jawa Tengah', provinceEn: 'Central Java', subDistricts: ['Pekalongan Barat', 'Pekalongan Timur', 'Pekalongan Utara', 'Pekalongan Selatan'] },
          { name: 'Tegal', provinceId: 'Jawa Tengah', provinceEn: 'Central Java', subDistricts: ['Tegal Barat', 'Tegal Timur', 'Tegal Selatan', 'Tegal Utara'] }
        ]
      },
      {
        regionId: 'ID-sumatera',
        nameId: 'Sumatera',
        nameEn: 'Sumatra',
        cities: [
          { name: 'Medan', provinceId: 'Sumatera Utara', provinceEn: 'North Sumatra', subDistricts: ['Medan Baru', 'Padang Bulan', 'Medan Kota', 'Medan Johor', 'Polonia'] },
          { name: 'Pematang Siantar', provinceId: 'Sumatera Utara', provinceEn: 'North Sumatra', subDistricts: ['Siantar Martoba', 'Siantar Timur', 'Siantar Sitalasari'] },
          { name: 'Tebing Tinggi', provinceId: 'Sumatera Utara', provinceEn: 'North Sumatra', subDistricts: ['Padang Hulu', 'Tebing Tinggi Kota', 'Pergulaan'] },
          { name: 'Padang', provinceId: 'Sumatera Barat', provinceEn: 'West Sumatra', subDistricts: ['Padang Barat', 'Padang Timur', 'Padang Utara', 'Lubuk Kilangan'] },
          { name: 'Bukittinggi', provinceId: 'Sumatera Barat', provinceEn: 'West Sumatra', subDistricts: ['Aur Birugo Tigo Balai', 'Guguk Panjang', 'Mandiangin Koto Selayan'] },
          { name: 'Palembang', provinceId: 'Sumatera Selatan', provinceEn: 'South Sumatra', subDistricts: ['Ilir Timur I', 'Ilir Timur II', 'Sukarami', 'Seberang Ulu I', 'Bukit Kecil'] },
          { name: 'Jambi', provinceId: 'Jambi', provinceEn: 'Jambi', subDistricts: ['Jambi Selatan', 'Jambi Timur', 'Danau Sipin', 'Pasar'] },
          { name: 'Pekanbaru', provinceId: 'Riau', provinceEn: 'Riau', subDistricts: ['Rumbai', 'Tenayan Raya', 'Pekanbaru Kota', 'Marpoyan Damai'] },
          { name: 'Batam', provinceId: 'Kepulauan Riau', provinceEn: 'Riau Islands', subDistricts: ['Batam Centre', 'Nagoya', 'Sekupang', 'Tiban'] },
          { name: 'Tanjung Pinang', provinceId: 'Kepulauan Riau', provinceEn: 'Riau Islands', subDistricts: ['Tanjung Pinang Barat', 'Tanjung Pinang Timur', 'Bukit Bestari'] },
          { name: 'Bandar Lampung', provinceId: 'Lampung', provinceEn: 'Lampung', subDistricts: ['Kedaton', 'Sukarame', 'Rajabasa', 'Enggal', 'Teluk Betung'] },
          { name: 'Banda Aceh', provinceId: 'Aceh', provinceEn: 'Aceh', subDistricts: ['Kuta Alam', 'Baiturrahman', 'Syiah Kuala', 'Kuta Raja'] },
          { name: 'Pangkal Pinang', provinceId: 'Bangka Belitung', provinceEn: 'Bangka Belitung', subDistricts: ['Pangkal Pinang Kota', 'Gerunggang', 'Tukak Sadai'] }
        ]
      },
      {
        regionId: 'ID-kalimantan',
        nameId: 'Kalimantan',
        nameEn: 'Borneo',
        cities: [
          { name: 'Samarinda', provinceId: 'Kalimantan Timur', provinceEn: 'East Kalimantan', subDistricts: ['Samarinda Ulu', 'Samarinda Ilir', 'Sungai Kunjang', 'Loa Janan'] },
          { name: 'Balikpapan', provinceId: 'Kalimantan Timur', provinceEn: 'East Kalimantan', subDistricts: ['Balikpapan Barat', 'Balikpapan Tengah', 'Balikpapan Timur', 'Balikpapan Selatan'] },
          { name: 'Banjarmasin', provinceId: 'Kalimantan Selatan', provinceEn: 'South Kalimantan', subDistricts: ['Banjarmasin Tengah', 'Banjarmasin Timur', 'Banjarmasin Barat', 'Banjarmasin Selatan'] },
          { name: 'Pontianak', provinceId: 'Kalimantan Barat', provinceEn: 'West Kalimantan', subDistricts: ['Pontianak Kota', 'Pontianak Timur', 'Pontianak Barat', 'Pontianak Selatan'] }
        ]
      },
      {
        regionId: 'ID-sulawesi',
        nameId: 'Sulawesi',
        nameEn: 'Sulawesi',
        cities: [
          { name: 'Makassar', provinceId: 'Sulawesi Selatan', provinceEn: 'South Sulawesi', subDistricts: ['Panakkukang', 'Rappocini', 'Tamalanrea', 'Mamajang', 'Mariso', 'Ujung Pandang'] },
          { name: 'Manado', provinceId: 'Sulawesi Utara', provinceEn: 'North Sulawesi', subDistricts: ['Wanea', 'Malalayang', 'Sario', 'Mapanget', 'Tikala'] },
          { name: 'Palu', provinceId: 'Sulawesi Tengah', provinceEn: 'Central Sulawesi', subDistricts: ['Palu Timur', 'Palu Barat', 'Mantikulore', 'Tawaeli'] },
          { name: 'Kendari', provinceId: 'Sulawesi Tenggara', provinceEn: 'Southeast Sulawesi', subDistricts: ['Kendari Barat', 'Kendari Timur', 'Mandonga', 'Baruga'] },
          { name: 'Gorontalo', provinceId: 'Gorontalo', provinceEn: 'Gorontalo', subDistricts: ['Kota Barat', 'Kota Selatan', 'Kota Timur', 'Dungingi'] }
        ]
      },
      {
        regionId: 'ID-bali-ntt-ntb',
        nameId: 'Bali, Nusa Tenggara & Papua',
        nameEn: 'Bali, Nusa Tenggara & Papua',
        cities: [
          { name: 'Denpasar', provinceId: 'Bali', provinceEn: 'Bali', subDistricts: ['Sanur', 'Renon', 'Denpasar Barat', 'Denpasar Timur', 'Kuta'] },
          { name: 'Badung', provinceId: 'Bali', provinceEn: 'Bali', subDistricts: ['Kuta Selatan', 'Kuta Utara', 'Mengwi', 'Abiansemal'] },
          { name: 'Gianyar', provinceId: 'Bali', provinceEn: 'Bali', subDistricts: ['Gianyar Kota', 'Tampaksiring', 'Ubud'] },
          { name: 'Mataram', provinceId: 'Nusa Tenggara Barat', provinceEn: 'West Nusa Tenggara', subDistricts: ['Mataram Barat', 'Mataram Timur', 'Selaparang', 'Rekana'] },
          { name: 'Kupang', provinceId: 'Nusa Tenggara Timur', provinceEn: 'East Nusa Tenggara', subDistricts: ['Kupang Barat', 'Kupang Timur', 'Oebobo', 'Kota Lama'] },
          { name: 'Jayapura', provinceId: 'Papua', provinceEn: 'Papua', subDistricts: ['Jayapura Selatan', 'Jayapura Utara', 'Abepura', 'Sentani'] },
          { name: 'Sorong', provinceId: 'Papua Barat', provinceEn: 'West Papua', subDistricts: ['Sorong Barat', 'Sorong Timur', 'Sorong Kepulauan', 'Klayili'] }
        ]
      }
    ]
  },
  {
    id: 'MY',
    nameId: 'Malaysia',
    nameEn: 'Malaysia',
    phoneCode: '+60',
    regions: [
      {
        regionId: 'MY-klang',
        nameId: 'Kuala Lumpur & Selangor',
        nameEn: 'Kuala Lumpur & Selangor',
        cities: [
          { name: 'Kuala Lumpur', provinceId: 'Wilayah Persekutuan', provinceEn: 'Federal Territory', subDistricts: ['Bukit Bintang', 'Chow Kit', 'Setapak', 'Cheras', 'Brickfields', 'Mont Kiara'] },
          { name: 'Petaling Jaya', provinceId: 'Selangor', provinceEn: 'Selangor', subDistricts: ['Damansara', 'Kelana Jaya', 'Subang Jaya', 'Bandar Utama'] },
          { name: 'Johor Bahru', provinceId: 'Johor', provinceEn: 'Johor', subDistricts: ['Tebrau', 'Skudai', 'Taman Universiti'] },
          { name: 'George Town', provinceId: 'Pulau Pinang', provinceEn: 'Penang', subDistricts: ['Gurney', 'Bayan Lepas', 'Air Itam'] }
        ]
      }
    ]
  },
  {
    id: 'JP',
    nameId: 'Jepang',
    nameEn: 'Japan',
    phoneCode: '+81',
    regions: [
      {
        regionId: 'JP-kanto',
        nameId: 'Tokyo & Sekitarnya',
        nameEn: 'Tokyo & Surroundings',
        cities: [
          { name: 'Tokyo', provinceId: 'Tokyo', provinceEn: 'Tokyo', subDistricts: ['Shinjuku', 'Shibuya', 'Ikebukuro', 'Ueno', 'Akihabara', 'Ginza'] },
          { name: 'Osaka', provinceId: 'Osaka', provinceEn: 'Osaka', subDistricts: ['Namba', 'Umeda', 'Shinsaibashi'] },
          { name: 'Kyoto', provinceId: 'Kyoto', provinceEn: 'Kyoto', subDistricts: ['Gion', 'Kawaramachi', 'Uji'] }
        ]
      }
    ]
  },
  {
    id: 'CN',
    nameId: 'Cina',
    nameEn: 'China',
    phoneCode: '+86',
    regions: [
      {
        regionId: 'CN-coast',
        nameId: 'Kota Pesisir Utama',
        nameEn: 'Major Coastal Cities',
        cities: [
          { name: 'Shanghai', provinceId: 'Shanghai', provinceEn: 'Shanghai', subDistricts: ['Pudong', 'Huangpu', 'Xuhui'] },
          { name: 'Guangzhou', provinceId: 'Guangdong', provinceEn: 'Guangdong', subDistricts: ['Tianhe', 'Yuexiu', 'Haizhu'] },
          { name: 'Shenzhen', provinceId: 'Guangdong', provinceEn: 'Guangdong', subDistricts: ['Futian', 'Nanshan', 'Baoan'] }
        ]
      }
    ]
  },
  {
    id: 'KR',
    nameId: 'Korea Selatan',
    nameEn: 'South Korea',
    phoneCode: '+82',
    regions: [
      {
        regionId: 'KR-seoul',
        nameId: 'Seoul & Sekitarnya',
        nameEn: 'Seoul & Surroundings',
        cities: [
          { name: 'Seoul', provinceId: 'Seoul', provinceEn: 'Seoul', subDistricts: ['Gangnam', 'Hongdae', 'Myeongdong', 'Itaewon'] },
          { name: 'Busan', provinceId: 'Busan', provinceEn: 'Busan', subDistricts: ['Haeundae', 'Seomyeon'] }
        ]
      }
    ]
  },
  {
    id: 'US',
    nameId: 'Amerika Serikat',
    nameEn: 'United States',
    phoneCode: '+1',
    regions: [
      {
        regionId: 'US-metro',
        nameId: 'Kota Metro Utama',
        nameEn: 'Major Metro Cities',
        cities: [
          { name: 'New York', provinceId: 'New York', provinceEn: 'New York', subDistricts: ['Manhattan', 'Brooklyn', 'Queens'] },
          { name: 'Los Angeles', provinceId: 'California', provinceEn: 'California', subDistricts: ['Downtown LA', 'Hollywood', 'Santa Monica'] },
          { name: 'Houston', provinceId: 'Texas', provinceEn: 'Texas', subDistricts: ['Downtown', 'Katy', 'Sugar Land'] }
        ]
      }
    ]
  },
  {
    id: 'CA',
    nameId: 'Kanada',
    nameEn: 'Canada',
    phoneCode: '+1',
    regions: [
      {
        regionId: 'CA-metro',
        nameId: 'Kota Utama',
        nameEn: 'Major Cities',
        cities: [
          { name: 'Toronto', provinceId: 'Ontario', provinceEn: 'Ontario', subDistricts: ['Downtown', 'Scarborough', 'North York'] },
          { name: 'Vancouver', provinceId: 'British Columbia', provinceEn: 'British Columbia', subDistricts: ['Downtown', 'Richmond', 'Burnaby'] }
        ]
      }
    ]
  },
  {
    id: 'IT',
    nameId: 'Italia',
    nameEn: 'Italy',
    phoneCode: '+39',
    regions: [
      {
        regionId: 'IT-main',
        nameId: 'Kota Utama',
        nameEn: 'Major Cities',
        cities: [
          { name: 'Rome', provinceId: 'Lazio', provinceEn: 'Lazio', subDistricts: ['Trastevere', 'Termini', 'Prati'] },
          { name: 'Milan', provinceId: 'Lombardy', provinceEn: 'Lombardy', subDistricts: ['Duomo', 'Navigli', 'Porta Nuova'] }
        ]
      }
    ]
  },
  {
    id: 'NL',
    nameId: 'Belanda',
    nameEn: 'Netherlands',
    phoneCode: '+31',
    regions: [
      {
        regionId: 'NL-randstad',
        nameId: 'Randstad',
        nameEn: 'Randstad',
        cities: [
          { name: 'Amsterdam', provinceId: 'North Holland', provinceEn: 'North Holland', subDistricts: ['Centrum', 'De Pijp', 'Jordaan'] },
          { name: 'Rotterdam', provinceId: 'South Holland', provinceEn: 'South Holland', subDistricts: ['Centrum', 'Kralingen'] }
        ]
      }
    ]
  },
  {
    id: 'DE',
    nameId: 'Jerman',
    nameEn: 'Germany',
    phoneCode: '+49',
    regions: [
      {
        regionId: 'DE-main',
        nameId: 'Kota Utama',
        nameEn: 'Major Cities',
        cities: [
          { name: 'Berlin', provinceId: 'Berlin', provinceEn: 'Berlin', subDistricts: ['Mitte', 'Kreuzberg', 'Charlottenburg'] },
          { name: 'Munich', provinceId: 'Bavaria', provinceEn: 'Bavaria', subDistricts: ['Altstadt', 'Schwabing'] }
        ]
      }
    ]
  },
  {
    id: 'FR',
    nameId: 'Perancis',
    nameEn: 'France',
    phoneCode: '+33',
    regions: [
      {
        regionId: 'FR-main',
        nameId: 'Kota Utama',
        nameEn: 'Major Cities',
        cities: [
          { name: 'Paris', provinceId: 'Ile-de-France', provinceEn: 'Ile-de-France', subDistricts: ['Le Marais', 'Montmartre', 'Saint-Germain'] },
          { name: 'Lyon', provinceId: 'Auvergne-Rhone-Alpes', provinceEn: 'Auvergne-Rhone-Alpes', subDistricts: ['Presquile', 'Part-Dieu'] }
        ]
      }
    ]
  }
];

/** Kompatibilitas mundur: REGION_CLUSTERS ala GMST (flatten Indonesia). */
export const REGION_CLUSTERS = COUNTRIES.find((c) => c.id === 'ID')?.regions.map((r) => ({
  region: r.nameId,
  cities: r.cities.map((c) => ({ name: c.name, province: c.provinceId, subDistricts: c.subDistricts }))
})) || [];

export function cityMeta(cityName) {
  const needle = String(cityName || '').toLowerCase();
  for (const country of COUNTRIES) {
    for (const region of country.regions) {
      for (const city of region.cities) {
        if (city.name.toLowerCase() === needle) {
          return { country: country.id, region: region.nameId, city: city.name, province: city.provinceId, subDistricts: city.subDistricts || [] };
        }
      }
    }
  }
  return null;
}

export function keywordsForCategory(catId, lang = 'id') {
  for (const sector of CATEGORY_SECTORS) {
    const hit = sector.categories.find((c) => c.id === catId);
    if (hit) return lang === 'en' ? hit.keywordsEn : hit.keywordsId;
  }
  return [];
}

export function labelForCategory(catId, lang = 'id') {
  for (const sector of CATEGORY_SECTORS) {
    const hit = sector.categories.find((c) => c.id === catId);
    if (hit) return lang === 'en' ? hit.labelEn : hit.labelId;
  }
  return catId;
}
