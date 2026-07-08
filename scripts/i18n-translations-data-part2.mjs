const mkGlobal = (g) => g
const mkMarketing = (m) => m
const mkProduct = (p) => p

export const LOCALE_MODULES_REST_PART2 = {
  'id-ID': {
    global: mkGlobal({
      nav: {
        home: 'Beranda',
        pricing: 'Harga',
        about: 'Tentang',
        help: 'Bantuan',
        news: 'Berita',
        primary: 'Navigasi utama'
      },
      brand: { tagline: 'Starter Nuxt modern untuk situs publik' },
      seo: {
        defaultDescription:
          'Starter Nuxt 4 yang dapat digunakan ulang untuk situs marketing, halaman SEO, dan frontend SaaS ringan.'
      },
      common: {
        switchLanguage: 'Ganti bahasa',
        switchTheme: 'Ganti tema',
        readMore: 'Baca selengkapnya',
        backHome: 'Kembali ke beranda',
        error: 'Terjadi kesalahan. Silakan coba lagi.',
        loadFailed: 'Gagal memuat data. Silakan coba lagi.',
        retry: 'Coba lagi'
      },
      productNav: { workspace: 'Ruang kerja', themeTemplates: 'Template tema', pricing: 'Harga' },
      userMenu: { account: 'Akun', language: 'Bahasa', signOut: 'Keluar' },
      accountNav: { settings: 'Pengaturan akun' },
      templates: { empty: 'Template tema segera hadir.' },
      error: {
        title: 'Halaman tidak ditemukan',
        message: 'Periksa alamat atau kembali ke beranda untuk melanjutkan.',
        forbidden: 'Akses ditolak',
        unsupportedLanguage: 'Bahasa tidak didukung'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: 'Starter Nuxt modern untuk situs publik',
        lead: 'Nuxt Modern Starter menggabungkan halaman marketing, alur autentikasi, konten multibahasa, rute SEO, dan default deployment Docker/Nginx dalam satu fondasi yang rapi. Gunakan untuk meluncurkan situs SaaS, frontend produk, atau hub konten, lalu ganti konten dan integrasi backend seiring pertumbuhan produk.',
        primaryCta: 'Mulai membangun',
        secondaryCta: 'Lihat contoh harga',
        preview: { metricLabel: 'Cakupan template', metricValue: '12+ halaman' },
        stats: {
          pages: { value: '12+', label: 'Halaman dan rute konten yang dapat digunakan ulang' },
          modules: { value: '6', label: 'Modul engineering inti termasuk' },
          deploy: { value: '4', label: 'Strategi rendering hibrida per rute' }
        },
        featuresEyebrow: 'Didukung Nuxt 4',
        featuresTitle: 'Blok bangunan situs publik yang biasa, sudah terorganisir',
        featuresLead:
          'Terinspirasi hierarki Nuxt SaaS Template, halaman beranda memberi tindak lanjut hero yang lebih kuat dengan kartu fitur siap produksi.',
        features: {
          design: {
            title: 'Sistem desain terpadu',
            description:
              'Dibangun di Ant Design Vue dan token tema lokal agar mode warna, radius, bayangan, dan jarak tetap konsisten.'
          },
          i18n: {
            title: 'Routing terlokalisasi',
            description:
              'Prefiks bahasa, pengalihan, dan tautan terlokalisasi siap untuk halaman marketing dan konten.'
          },
          seo: {
            title: 'Halaman ramah SEO',
            description:
              'Beranda, harga, bantuan, dan artikel memiliki titik masuk SEO yang dapat diperluas untuk indeks publik.'
          },
          auth: {
            title: 'Alur akun',
            description:
              'Login, registrasi, dan halaman akun terhubung ke state dasar dan siap untuk backend nyata.'
          },
          content: {
            title: 'Hub konten',
            description:
              'FAQ dari config lokal bertipe; berita dan harga via Public API, dapat dipindah ke CMS atau backend nanti.'
          },
          deploy: {
            title: 'Deployment produksi',
            description:
              'Docker, Nginx, aturan SWR, dan header keamanan sudah termasuk dalam starter.'
          }
        },
        workflow: {
          eyebrow: 'Semua yang Anda butuhkan untuk rilis',
          title: 'Jalur lebih pendek dari starter ke peluncuran',
          lead: 'Tetap ringan sambil menambahkan kemampuan, konversi, dan struktur konten yang dibutuhkan frontend SaaS.',
          steps: {
            routes:
              'Gunakan ulang beranda, harga, bantuan, dan berita untuk mengorganisir informasi publik terlebih dahulu.',
            content:
              'Ganti teks i18n dan sumber konten berikutnya (harga/berita sudah memakai API dan bisa pindah ke CMS).',
            auth: 'Hubungkan sistem akun backend saat siap mengelola sesi, peran, dan aplikasi produk.'
          }
        },
        ctaEyebrow: 'Siap membangun',
        ctaTitle: 'Gunakan fondasi Nuxt ini untuk meluncurkan frontend produk yang lebih cepat.'
      },
      about: {
        eyebrow: 'Tentang kami',
        title: 'Dibangun untuk situs publik dan frontend SaaS ringan',
        lead: 'Nuxt Modern Starter adalah fondasi Nuxt 4 yang dapat digunakan ulang untuk halaman marketing, hub konten, dan permukaan produk opsional dengan autentikasi.',
        mission: {
          title: 'Misi kami',
          body: 'Kami mengorganisir kemampuan situs publik paling umum—routing i18n, SEO, halaman konten, contoh auth, dan pola deployment—menjadi titik awal yang dapat dijalankan agar tim fokus pada perbedaan produk.'
        },
        values: {
          title: 'Yang kami optimalkan',
          items: {
            focus:
              'Fokus pada skenario situs publik dengan batas modul yang jelas, bukan starter yang terlalu besar.',
            quality: 'TypeScript strict, lint, tes, dan contoh deployment sejak hari pertama.',
            openness:
              'Pisahkan lapisan publik dan produk agar konten lokal dan berbasis API dapat diganti secara bertahap.'
          }
        },
        story: {
          title: 'Latar belakang proyek',
          paragraphs: {
            origin:
              'Starter berasal dari kebutuhan berulang di situs SaaS dan frontend produk: beranda marketing, harga, bantuan, berita, masuk/daftar, plus contoh ruang kerja dan editor setelah login.',
            practice:
              'Default locale Tionghoa dengan Inggris di /en, campuran SSR/prerender/SWR untuk halaman publik, dan rute produk netral bahasa dengan CSR.',
            next: 'Jika mengevaluasi template Nuxt untuk situs publik, mulai dari quick start README lalu ganti teks, konten, dan integrasi backend.'
          }
        }
      },
      help: {
        eyebrow: 'Pusat bantuan',
        title: 'Pelajari cara menggunakan Nuxt Modern Starter',
        lead: 'Halaman ini mengumpulkan pertanyaan umum tentang setup, i18n, auth, SEO, dan deployment. Langkah quick start dan daftar sumber dari i18n; FAQ dari config lokal, dapat dipindah ke CMS atau API backend nanti.',
        faqTitle: 'FAQ',
        quickStart: {
          title: 'Berjalan dalam 30 menit',
          steps: {
            install: 'Aktifkan Corepack, lalu jalankan pnpm install.',
            dev: 'Jalankan pnpm dev dan jelajahi rute Tionghoa default serta /en Inggris.',
            explore:
              'Tinjau beranda, harga, tentang, bantuan, dan berita untuk memahami struktur situs publik.',
            extend: 'Ikuti docs/usage.md untuk menambah halaman, request, SEO, dan auth opsional.'
          }
        },
        resources: {
          title: 'Bacaan rekomendasi',
          architecture:
            'docs/architecture.md — tanggung jawab direktori, strategi rendering, modul fitur, dan alur runtime',
          usage: 'docs/usage.md — halaman, request, SEO, bahasa, ruang kerja/editor/akun, dan auth',
          conventions: 'docs/conventions.md — batas config, lapisan request, dan konvensi kode',
          deployment: 'docs/deployment.md — validasi deployment lokal, Docker, dan Nginx'
        }
      },
      news: {
        eyebrow: 'Pembaruan proyek',
        title: 'Rilis dan catatan Nuxt Modern Starter',
        lead: 'Lacak rilis starter, praktik deployment, dan panduan ekstensi. Halaman ini juga mendemonstrasikan daftar/detail berita, Article JSON-LD, dan aturan cache SWR.',
        notFound: 'Artikel berita ini tidak ditemukan'
      }
    }),
    product: mkProduct({
      auth: {
        header: { signIn: 'Masuk', signUp: 'Daftar', enterWorkspace: 'Masuk ruang kerja' },
        form: {
          username: 'Nama pengguna',
          password: 'Kata sandi',
          confirmPassword: 'Konfirmasi kata sandi'
        },
        login: {
          title: 'Masuk',
          submit: 'Masuk',
          success: 'Berhasil masuk',
          noAccount: 'Belum punya akun?'
        },
        register: {
          title: 'Daftar',
          submit: 'Daftar',
          success: 'Registrasi berhasil. Silakan masuk.',
          hasAccount: 'Sudah punya akun?'
        },
        logout: { submit: 'Keluar', success: 'Telah keluar' },
        account: {
          eyebrow: 'Halaman terlindungi',
          title: 'Akun',
          lead: 'Halaman ini dilindungi middleware auth bernama dan menampilkan profil pengguna saat ini.',
          avatar: 'Foto profil',
          sessionTitle: 'Sesi',
          profileTitle: 'Profil lanjutan',
          userId: 'ID pengguna',
          nickname: 'Nama panggilan',
          roles: 'Peran',
          permissions: 'Izin',
          none: 'Tidak ada',
          emptyProfile: 'Belum ada profil lanjutan'
        },
        validation: {
          usernameRequired: 'Masukkan nama pengguna',
          passwordRequired: 'Masukkan kata sandi',
          confirmPasswordRequired: 'Konfirmasi kata sandi',
          passwordMin: 'Kata sandi minimal 6 karakter',
          passwordMismatch: 'Kedua kata sandi tidak cocok'
        },
        errors: {
          loginFailed: 'Gagal masuk. Periksa nama pengguna atau kata sandi.',
          registerFailed: 'Registrasi gagal. Coba lagi nanti.',
          unauthorized: 'Kredensial login tidak ada atau tidak valid'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'Editor konten',
        placeholder: 'Mulai menulis konten Anda...',
        metaTitle: 'Editor',
        autosave: {
          saving: 'Menyimpan…',
          saved: 'Tersimpan otomatis · {time}',
          failed: 'Penyimpanan otomatis gagal, akan dicoba lagi saat edit berikutnya'
        },
        rename: { failed: 'Gagal mengganti nama, coba lagi' }
      },
      workspace: {
        nav: 'Ruang kerja',
        title: 'Kelola proyek PPT Anda',
        defaultTitle: 'Proyek tanpa judul',
        empty: 'Belum ada proyek. Gunakan tombol di atas untuk membuat.',
        projectNotFound: 'Proyek tidak ditemukan atau akses ditolak',
        create: 'PPT kosong baru',
        edit: 'Edit',
        delete: 'Hapus',
        deleteCancel: 'Batal',
        deleteConfirm: 'Hapus "{title}"? Tindakan ini tidak dapat dibatalkan.',
        deleteSuccess: 'Proyek dihapus',
        save: 'Simpan',
        projectName: 'Nama proyek',
        backToWorkspace: 'Kembali ke ruang kerja',
        browse: 'Lihat',
        share: 'Bagikan',
        download: 'Unduh',
        more: 'Tindakan lainnya'
      }
    })
  },

  'ms-MY': {
    global: mkGlobal({
      nav: {
        home: 'Laman Utama',
        pricing: 'Harga',
        about: 'Perihal',
        help: 'Bantuan',
        news: 'Berita',
        primary: 'Navigasi utama'
      },
      brand: { tagline: 'Starter Nuxt moden untuk laman web awam' },
      seo: {
        defaultDescription:
          'Starter Nuxt 4 boleh guna semula untuk laman pemasaran, halaman SEO, dan frontend SaaS ringan.'
      },
      common: {
        switchLanguage: 'Tukar bahasa',
        switchTheme: 'Tukar tema',
        readMore: 'Baca lagi',
        backHome: 'Kembali ke laman utama',
        error: 'Sesuatu tidak kena. Sila cuba lagi.',
        loadFailed: 'Gagal memuatkan data. Sila cuba lagi.',
        retry: 'Cuba lagi'
      },
      productNav: { workspace: 'Ruang kerja', themeTemplates: 'Templat tema', pricing: 'Harga' },
      userMenu: { account: 'Akaun', language: 'Bahasa', signOut: 'Log keluar' },
      accountNav: { settings: 'Tetapan akaun' },
      templates: { empty: 'Templat tema akan datang tidak lama lagi.' },
      error: {
        title: 'Halaman tidak dijumpai',
        message: 'Semak alamat atau kembali ke laman utama untuk meneruskan.',
        forbidden: 'Akses dinafikan',
        unsupportedLanguage: 'Bahasa tidak disokong'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: 'Starter Nuxt moden untuk laman web awam',
        lead: 'Nuxt Modern Starter menggabungkan halaman pemasaran, aliran auth, kandungan berbilang bahasa, laluan SEO, dan lalai deployment Docker/Nginx dalam satu asas yang kemas. Gunakannya untuk melancarkan laman SaaS, frontend produk, atau hab kandungan, kemudian gantikan kandungan dan integrasi backend apabila produk berkembang.',
        primaryCta: 'Mula membina',
        secondaryCta: 'Lihat contoh harga',
        preview: { metricLabel: 'Liputan templat', metricValue: '12+ halaman' },
        stats: {
          pages: { value: '12+', label: 'Halaman dan laluan kandungan boleh guna semula' },
          modules: { value: '6', label: 'Modul kejuruteraan teras disertakan' },
          deploy: { value: '4', label: 'Strategi rendering hibrid mengikut laluan' }
        },
        featuresEyebrow: 'Dikuasakan oleh Nuxt 4',
        featuresTitle: 'Blok binaan laman awam biasa, sudah tersusun',
        featuresLead:
          'Diilhamkan hierarki Nuxt SaaS Template, laman utama memberi susulan hero yang lebih kukuh dengan kad ciri siap produk.',
        features: {
          design: {
            title: 'Sistem reka bentuk bersatu',
            description:
              'Dibina atas Ant Design Vue dan token tema tempatan supaya mod warna, radius, bayang, dan jarak kekal konsisten.'
          },
          i18n: {
            title: 'Routing disetempatkan',
            description:
              'Awalan bahasa, pertukaran, dan pautan disetempatkan sedia untuk halaman pemasaran dan kandungan.'
          },
          seo: {
            title: 'Halaman mesra SEO',
            description:
              'Laman utama, harga, bantuan, dan artikel ada titik masuk SEO boleh lanjut untuk indeks awam.'
          },
          auth: {
            title: 'Aliran akaun',
            description:
              'Log masuk, pendaftaran, dan halaman akaun disambung ke state asas dan sedia untuk backend sebenar.'
          },
          content: {
            title: 'Hab kandungan',
            description:
              'FAQ dari config tempatan bertype; berita dan harga melalui Public API, boleh pindah ke CMS atau backend kemudian.'
          },
          deploy: {
            title: 'Deployment produksi',
            description:
              'Docker, Nginx, peraturan SWR, dan header keselamatan sudah termasuk dalam starter.'
          }
        },
        workflow: {
          eyebrow: 'Semua yang diperlukan untuk siar',
          title: 'Laluan lebih pendek dari starter ke pelancaran',
          lead: 'Kekal ringan sambil menambah keupayaan, penukaran, dan struktur kandungan yang diperlukan frontend SaaS.',
          steps: {
            routes:
              'Guna semula laman utama, harga, bantuan, dan berita untuk susun maklumat awam dahulu.',
            content:
              'Ganti teks i18n dan sumber kandungan seterusnya (harga/berita sudah guna API dan boleh pindah ke CMS).',
            auth: 'Sambung sistem akaun backend apabila sedia untuk sesi, peranan, dan aplikasi produk.'
          }
        },
        ctaEyebrow: 'Sedia membina',
        ctaTitle:
          'Gunakan asas Nuxt ini untuk melancarkan frontend produk yang kemas dengan lebih pantas.'
      },
      about: {
        eyebrow: 'Perihal kami',
        title: 'Dibina untuk laman awam dan frontend SaaS ringan',
        lead: 'Nuxt Modern Starter ialah asas Nuxt 4 boleh guna semula untuk halaman pemasaran, hab kandungan, dan permukaan produk pilihan dengan auth.',
        mission: {
          title: 'Misi kami',
          body: 'Kami susun keupayaan laman awam paling biasa—routing i18n, SEO, halaman kandungan, contoh auth, dan corak deployment—ke dalam titik permulaan boleh jalan supaya pasukan fokus pada perbezaan produk.'
        },
        values: {
          title: 'Apa yang kami utamakan',
          items: {
            focus:
              'Fokus senario laman awam dengan sempadan modul jelas, bukan starter terlalu besar.',
            quality: 'TypeScript strict, lint, ujian, dan contoh deployment dari hari pertama.',
            openness:
              'Asingkan lapisan awam dan produk supaya kandungan tempatan dan API boleh diganti secara beransur.'
          }
        },
        story: {
          title: 'Latar belakang projek',
          paragraphs: {
            origin:
              'Starter datang dari keperluan berulang di laman SaaS dan frontend produk: laman pemasaran, harga, bantuan, berita, log masuk/daftar, serta contoh ruang kerja dan editor selepas log masuk.',
            practice:
              'Locale lalai Cina dengan Inggeris di /en, campuran SSR/prerender/SWR untuk halaman awam, dan laluan produk neutral bahasa dengan CSR.',
            next: 'Jika menilai templat Nuxt untuk laman awam, mulakan quick start README kemudian gantikan teks, kandungan, dan integrasi backend.'
          }
        }
      },
      help: {
        eyebrow: 'Pusat bantuan',
        title: 'Ketahui cara menggunakan Nuxt Modern Starter',
        lead: 'Halaman ini kumpul soalan lazim tentang setup, i18n, auth, SEO, dan deployment. Langkah quick start dan senarai sumber dari i18n; FAQ dari config tempatan, boleh pindah ke CMS atau API backend kemudian.',
        faqTitle: 'Soalan lazim',
        quickStart: {
          title: 'Berjalan dalam 30 minit',
          steps: {
            install: 'Aktifkan Corepack, kemudian jalankan pnpm install.',
            dev: 'Jalankan pnpm dev dan layari laluan Cina lalai serta /en Inggeris.',
            explore:
              'Semak laman utama, harga, perihal, bantuan, dan berita untuk fahami struktur laman awam.',
            extend: 'Ikut docs/usage.md untuk tambah halaman, permintaan, SEO, dan auth pilihan.'
          }
        },
        resources: {
          title: 'Bacaan disyorkan',
          architecture:
            'docs/architecture.md — tanggungjawab direktori, strategi rendering, modul ciri, dan aliran runtime',
          usage:
            'docs/usage.md — halaman, permintaan, SEO, bahasa, ruang kerja/editor/akaun, dan auth',
          conventions:
            'docs/conventions.md — sempadan config, lapisan permintaan, dan konvensyen kod',
          deployment: 'docs/deployment.md — pengesahan deployment tempatan, Docker, dan Nginx'
        }
      },
      news: {
        eyebrow: 'Kemas kini projek',
        title: 'Keluaran dan nota Nuxt Modern Starter',
        lead: 'Jejaki keluaran starter, amalan deployment, dan panduan lanjutan. Halaman ini juga tunjuk senarai/detail berita, Article JSON-LD, dan peraturan cache SWR.',
        notFound: 'Artikel berita ini tidak dijumpai'
      }
    }),
    product: mkProduct({
      auth: {
        header: { signIn: 'Log masuk', signUp: 'Daftar', enterWorkspace: 'Masuk ruang kerja' },
        form: {
          username: 'Nama pengguna',
          password: 'Kata laluan',
          confirmPassword: 'Sahkan kata laluan'
        },
        login: {
          title: 'Log masuk',
          submit: 'Log masuk',
          success: 'Berjaya log masuk',
          noAccount: 'Belum ada akaun?'
        },
        register: {
          title: 'Daftar',
          submit: 'Daftar',
          success: 'Pendaftaran berjaya. Sila log masuk.',
          hasAccount: 'Sudah ada akaun?'
        },
        logout: { submit: 'Log keluar', success: 'Telah log keluar' },
        account: {
          eyebrow: 'Halaman dilindungi',
          title: 'Akaun',
          lead: 'Halaman ini dilindungi middleware auth bernama dan memaparkan profil pengguna semasa.',
          avatar: 'Foto profil',
          sessionTitle: 'Sesi',
          profileTitle: 'Profil lanjutan',
          userId: 'ID pengguna',
          nickname: 'Nama samaran',
          roles: 'Peranan',
          permissions: 'Kebenaran',
          none: 'Tiada',
          emptyProfile: 'Tiada profil lanjutan lagi'
        },
        validation: {
          usernameRequired: 'Sila masukkan nama pengguna',
          passwordRequired: 'Sila masukkan kata laluan',
          confirmPasswordRequired: 'Sila sahkan kata laluan',
          passwordMin: 'Kata laluan mesti sekurang-kurangnya 6 aksara',
          passwordMismatch: 'Kedua-dua kata laluan tidak sepadan'
        },
        errors: {
          loginFailed: 'Log masuk gagal. Semak nama pengguna atau kata laluan.',
          registerFailed: 'Pendaftaran gagal. Cuba lagi nanti.',
          unauthorized: 'Kredensial log masuk tiada atau tidak sah'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'Editor kandungan',
        placeholder: 'Mula menulis kandungan anda...',
        metaTitle: 'Editor',
        autosave: {
          saving: 'Menyimpan…',
          saved: 'Disimpan automatik · {time}',
          failed: 'Simpanan automatik gagal, akan cuba semula pada edit seterusnya'
        },
        rename: { failed: 'Gagal menamakan semula, sila cuba lagi' }
      },
      workspace: {
        nav: 'Ruang kerja',
        title: 'Urus projek PPT anda',
        defaultTitle: 'Projek tanpa tajuk',
        empty: 'Tiada projek lagi. Gunakan butang di atas untuk cipta.',
        projectNotFound: 'Projek tidak dijumpai atau akses dinafikan',
        create: 'PPT kosong baharu',
        edit: 'Edit',
        delete: 'Padam',
        deleteCancel: 'Batal',
        deleteConfirm: 'Padam "{title}"? Tindakan ini tidak boleh dibatalkan.',
        deleteSuccess: 'Projek dipadam',
        save: 'Simpan',
        projectName: 'Nama projek',
        backToWorkspace: 'Kembali ke ruang kerja',
        browse: 'Lihat',
        share: 'Kongsi',
        download: 'Muat turun',
        more: 'Tindakan lain'
      }
    })
  }
}
