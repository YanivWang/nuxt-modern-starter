const mkGlobal = (g) => g
const mkMarketing = (m) => m
const mkProduct = (p) => p

export const LOCALE_MODULES_REST_PART4 = {
  'ru-RU': {
    global: mkGlobal({
      nav: {
        home: 'Главная',
        pricing: 'Цены',
        about: 'О нас',
        help: 'Помощь',
        news: 'Новости',
        primary: 'Основная навигация'
      },
      brand: { tagline: 'Современный Nuxt starter для публичных сайтов' },
      seo: {
        defaultDescription:
          'Переиспользуемый Nuxt 4 starter для маркетинговых сайтов, SEO-страниц и лёгких SaaS-фронтендов.'
      },
      common: {
        switchLanguage: 'Сменить язык',
        switchTheme: 'Сменить тему',
        readMore: 'Читать далее',
        backHome: 'На главную',
        error: 'Что-то пошло не так. Попробуйте снова.',
        loadFailed: 'Не удалось загрузить данные. Попробуйте снова.',
        retry: 'Повторить'
      },
      productNav: { workspace: 'Рабочая область', themeTemplates: 'Шаблоны тем', pricing: 'Цены' },
      userMenu: { account: 'Аккаунт', language: 'Язык', signOut: 'Выйти' },
      accountNav: { settings: 'Настройки аккаунта' },
      templates: { empty: 'Шаблоны тем скоро появятся.' },
      error: {
        title: 'Страница не найдена',
        message: 'Проверьте адрес или вернитесь на главную.',
        forbidden: 'Доступ запрещён',
        unsupportedLanguage: 'Неподдерживаемый язык'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: 'Современный Nuxt starter для публичных сайтов',
        lead: 'Nuxt Modern Starter объединяет маркетинговые страницы, auth-потоки, мультиязычный контент, SEO-маршруты и настройки деплоя Docker/Nginx в одной чистой основе. Используйте его для запуска SaaS-сайта, продуктового фронтенда или контент-хаба и заменяйте контент и backend-интеграции по мере роста продукта.',
        primaryCta: 'Начать разработку',
        secondaryCta: 'Посмотреть пример цен',
        preview: { metricLabel: 'Покрытие шаблонов', metricValue: '12+ страниц' },
        stats: {
          pages: { value: '12+', label: 'Переиспользуемые страницы и контент-маршруты' },
          modules: { value: '6', label: 'Включённые базовые инженерные модули' },
          deploy: { value: '4', label: 'Гибридные стратегии рендеринга по маршрутам' }
        },
        featuresEyebrow: 'На базе Nuxt 4',
        featuresTitle: 'Обычные блоки публичного сайта — уже организованы',
        featuresLead:
          'По мотивам иерархии Nuxt SaaS Template главная страница даёт более сильное продолжение hero с production-ready карточками функций.',
        features: {
          design: {
            title: 'Единая дизайн-система',
            description:
              'На Ant Design Vue и локальных theme token — единообразие цветового режима, скруглений, теней и отступов.'
          },
          i18n: {
            title: 'Локализованная маршрутизация',
            description:
              'Префиксы языка, переключение и локализованные ссылки готовы для маркетинга и контента.'
          },
          seo: {
            title: 'SEO-дружественные страницы',
            description:
              'Главная, цены, помощь и статьи имеют расширяемые SEO-точки входа для публичной индексации.'
          },
          auth: {
            title: 'Потоки аккаунта',
            description:
              'Вход, регистрация и страницы аккаунта подключены к базовому состоянию и готовы к реальному backend.'
          },
          content: {
            title: 'Контент-хаб',
            description:
              'FAQ из typed local config; новости и цены через Public API, позже можно перенести в CMS или backend.'
          },
          deploy: {
            title: 'Production-деплой',
            description: 'Docker, Nginx, SWR route rules и security headers уже включены в starter.'
          }
        },
        workflow: {
          eyebrow: 'Всё для релиза',
          title: 'Короче путь от starter к запуску',
          lead: 'Остаётся лёгким, добавляя возможности, конверсию и структуру контента, нужные SaaS-фронтенду.',
          steps: {
            routes:
              'Сначала используйте главную, цены, помощь и новости для организации публичной информации.',
            content:
              'Затем замените i18n-тексты и источники контента (цены/новости уже через API, можно перенести в CMS).',
            auth: 'Подключите backend-аккаунты, когда будете готовы связать сессии, роли и продуктовое приложение.'
          }
        },
        ctaEyebrow: 'Готовы строить',
        ctaTitle:
          'Используйте эту Nuxt-основу, чтобы быстрее запустить отполированный продуктовый фронтенд.'
      },
      about: {
        eyebrow: 'О нас',
        title: 'Создан для публичных сайтов и лёгких SaaS-фронтендов',
        lead: 'Nuxt Modern Starter — переиспользуемая Nuxt 4 основа для маркетинговых страниц, контент-хабов и опциональных auth-ready продуктовых поверхностей.',
        mission: {
          title: 'Наша миссия',
          body: 'Мы организуем самые распространённые возможности публичных сайтов — i18n-маршрутизацию, SEO, контент-страницы, auth-примеры и паттерны деплоя — в запускаемую отправную точку, чтобы команды фокусировались на продуктовых отличиях.'
        },
        values: {
          title: 'На что мы ориентируемся',
          items: {
            focus: 'Фокус на публичных сайтах с чёткими границами модулей, без раздутого starter.',
            quality: 'TypeScript strict, lint, тесты и примеры деплоя с первого дня.',
            openness:
              'Разделение публичного и продуктового слоёв для постепенной замены локального и API-контента.'
          }
        },
        story: {
          title: 'История проекта',
          paragraphs: {
            origin:
              'Starter родился из повторяющихся потребностей SaaS-сайтов и продуктовых фронтендов: маркетинговая главная, цены, помощь, новости, вход/регистрация и примеры workspace и редактора после входа.',
            practice:
              'По умолчанию китайский как основной locale с английским под /en, SSR/prerender/SWR для публичных страниц и языконейтральные продуктовые маршруты с CSR.',
            next: 'Если вы оцениваете Nuxt-шаблон для публичного сайта, начните с README quick start и замените тексты, контент и backend-интеграции.'
          }
        }
      },
      help: {
        eyebrow: 'Центр помощи',
        title: 'Как использовать Nuxt Modern Starter',
        lead: 'Здесь собраны частые вопросы о настройке, i18n, auth, SEO и деплое. Шаги быстрого старта и ресурсы из i18n; FAQ из local config, позже можно перенести в CMS или backend API.',
        faqTitle: 'FAQ',
        quickStart: {
          title: 'Запуск за 30 минут',
          steps: {
            install: 'Включите Corepack и выполните pnpm install.',
            dev: 'Запустите pnpm dev и просмотрите маршруты по умолчанию на китайском и /en на английском.',
            explore:
              'Изучите главную, цены, о нас, помощь и новости, чтобы понять структуру публичного сайта.',
            extend:
              'Следуйте docs/usage.md для добавления страниц, запросов, SEO и опционального auth.'
          }
        },
        resources: {
          title: 'Рекомендуемое чтение',
          architecture:
            'docs/architecture.md — ответственность директорий, стратегия рендеринга, модули и runtime-поток',
          usage: 'docs/usage.md — страницы, запросы, SEO, языки, workspace/редактор/аккаунт и auth',
          conventions: 'docs/conventions.md — границы config, слои запросов и соглашения по коду',
          deployment: 'docs/deployment.md — проверка локального, Docker и Nginx деплоя'
        }
      },
      news: {
        eyebrow: 'Обновления проекта',
        title: 'Релизы и заметки Nuxt Modern Starter',
        lead: 'Следите за релизами starter, практиками деплоя и рекомендациями по расширению. Эти страницы также демонстрируют список/детали новостей, Article JSON-LD и правила SWR-кэша.',
        notFound: 'Эта новость не найдена'
      }
    }),
    product: mkProduct({
      auth: {
        header: {
          signIn: 'Войти',
          signUp: 'Регистрация',
          enterWorkspace: 'Перейти в рабочую область'
        },
        form: {
          username: 'Имя пользователя',
          password: 'Пароль',
          confirmPassword: 'Подтвердите пароль'
        },
        login: {
          title: 'Вход',
          submit: 'Войти',
          success: 'Вход выполнен успешно',
          noAccount: 'Ещё нет аккаунта?'
        },
        register: {
          title: 'Регистрация',
          submit: 'Зарегистрироваться',
          success: 'Регистрация успешна. Войдите в систему.',
          hasAccount: 'Уже есть аккаунт?'
        },
        logout: { submit: 'Выйти', success: 'Вы вышли из системы' },
        account: {
          eyebrow: 'Защищённая страница',
          title: 'Аккаунт',
          lead: 'Эта страница защищена named auth middleware и показывает текущий профиль пользователя.',
          avatar: 'Фото профиля',
          sessionTitle: 'Сессия',
          profileTitle: 'Расширенный профиль',
          userId: 'ID пользователя',
          nickname: 'Никнейм',
          roles: 'Роли',
          permissions: 'Разрешения',
          none: 'Нет',
          emptyProfile: 'Расширенный профиль пока отсутствует'
        },
        validation: {
          usernameRequired: 'Введите имя пользователя',
          passwordRequired: 'Введите пароль',
          confirmPasswordRequired: 'Подтвердите пароль',
          passwordMin: 'Пароль должен содержать не менее 6 символов',
          passwordMismatch: 'Пароли не совпадают'
        },
        errors: {
          loginFailed: 'Ошибка входа. Проверьте имя пользователя или пароль.',
          registerFailed: 'Ошибка регистрации. Попробуйте позже.',
          unauthorized: 'Отсутствуют или недействительны учётные данные'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'Редактор контента',
        placeholder: 'Начните писать контент...',
        metaTitle: 'Редактор',
        autosave: {
          saving: 'Сохранение…',
          saved: 'Автосохранено · {time}',
          failed: 'Автосохранение не удалось, повтор при следующем редактировании'
        },
        rename: { failed: 'Не удалось переименовать, попробуйте снова' }
      },
      workspace: {
        nav: 'Рабочая область',
        title: 'Управление PPT-проектами',
        defaultTitle: 'Проект без названия',
        empty: 'Проектов пока нет. Используйте кнопку выше для создания.',
        projectNotFound: 'Проект не найден или доступ запрещён',
        create: 'Новый пустой PPT',
        edit: 'Редактировать',
        delete: 'Удалить',
        deleteCancel: 'Отмена',
        deleteConfirm: 'Удалить «{title}»? Это действие необратимо.',
        deleteSuccess: 'Проект удалён',
        save: 'Сохранить',
        projectName: 'Название проекта',
        backToWorkspace: 'В рабочую область',
        browse: 'Просмотр',
        share: 'Поделиться',
        download: 'Скачать',
        more: 'Другие действия'
      }
    })
  },

  'th-TH': {
    global: mkGlobal({
      nav: {
        home: 'หน้าแรก',
        pricing: 'ราคา',
        about: 'เกี่ยวกับเรา',
        help: 'ความช่วยเหลือ',
        news: 'ข่าว',
        primary: 'การนำทางหลัก'
      },
      brand: { tagline: 'Nuxt starter สมัยใหม่สำหรับเว็บไซต์สาธารณะ' },
      seo: {
        defaultDescription:
          'Nuxt 4 starter ที่ใช้ซ้ำได้สำหรับเว็บไซต์การตลาด หน้า SEO และ frontend SaaS แบบเบา'
      },
      common: {
        switchLanguage: 'เปลี่ยนภาษา',
        switchTheme: 'เปลี่ยนธีม',
        readMore: 'อ่านเพิ่มเติม',
        backHome: 'กลับหน้าแรก',
        error: 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง',
        loadFailed: 'โหลดข้อมูลไม่สำเร็จ โปรดลองอีกครั้ง',
        retry: 'ลองอีกครั้ง'
      },
      productNav: { workspace: 'พื้นที่ทำงาน', themeTemplates: 'เทมเพลตธีม', pricing: 'ราคา' },
      userMenu: { account: 'บัญชี', language: 'ภาษา', signOut: 'ออกจากระบบ' },
      accountNav: { settings: 'การตั้งค่าบัญชี' },
      templates: { empty: 'เทมเพลตธีมจะมาเร็ว ๆ นี้' },
      error: {
        title: 'ไม่พบหน้า',
        message: 'ตรวจสอบที่อยู่หรือกลับหน้าแรกเพื่อดำเนินการต่อ',
        forbidden: 'ปฏิเสธการเข้าถึง',
        unsupportedLanguage: 'ภาษาไม่รองรับ'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: 'Nuxt starter สมัยใหม่สำหรับเว็บไซต์สาธารณะ',
        lead: 'Nuxt Modern Starter รวมหน้าการตลาด auth flow เนื้อหาหลายภาษา SEO route และค่าเริ่มต้นการ deploy Docker/Nginx ไว้ในฐานที่เรียบง่าย ใช้เปิดตัวเว็บ SaaS frontend ผลิตภัณฑ์ หรือ content hub แล้วค่อย ๆ แทนที่เนื้อหาและการเชื่อมต่อ backend ตามการเติบโตของผลิตภัณฑ์',
        primaryCta: 'เริ่มสร้าง',
        secondaryCta: 'ดูตัวอย่างราคา',
        preview: { metricLabel: 'ความครอบคลุมเทมเพลต', metricValue: '12+ หน้า' },
        stats: {
          pages: { value: '12+', label: 'หน้าและ route เนื้อหาที่ใช้ซ้ำได้' },
          modules: { value: '6', label: 'โมดูลวิศวกรรมหลักที่รวมไว้' },
          deploy: { value: '4', label: 'กลยุทธ์ hybrid rendering ตาม route' }
        },
        featuresEyebrow: 'ขับเคลื่อนด้วย Nuxt 4',
        featuresTitle: 'บล็อกสร้างเว็บสาธารณะทั่วไป จัดระเบียบไว้แล้ว',
        featuresLead:
          'อิงลำดับชั้นของ Nuxt SaaS Template หน้าแรกต่อเนื่องจาก hero ด้วยการ์ดฟีเจอร์ที่พร้อมใช้งานจริง',
        features: {
          design: {
            title: 'ระบบดีไซน์แบบรวมศูนย์',
            description:
              'สร้างบน Ant Design Vue และ theme token ในเครื่อง ให้โหมดสี มุมโค้ง เงา และระยะห่างสอดคล้องกัน'
          },
          i18n: {
            title: 'Localized routing',
            description: 'prefix ภาษา การสลับ และลิงก์แปลภาษาพร้อมใช้สำหรับหน้าการตลาดและเนื้อหา'
          },
          seo: {
            title: 'หน้าเป็นมิตรกับ SEO',
            description:
              'หน้าแรก ราคา ความช่วยเหลือ และบทความมีจุดเข้า SEO ที่ขยายได้สำหรับการ index สาธารณะ'
          },
          auth: {
            title: 'ขั้นตอนบัญชี',
            description:
              'หน้า login สมัคร และบัญชีเชื่อมกับ state พื้นฐานและพร้อมเชื่อม backend จริง'
          },
          content: {
            title: 'ศูนย์เนื้อหา',
            description:
              'FAQ จาก typed local config ข่าวและราคาผ่าน Public API ย้ายไป CMS หรือ backend ได้ภายหลัง'
          },
          deploy: {
            title: 'Production deployment',
            description: 'Docker Nginx SWR route rules และ security headers อยู่ใน starter แล้ว'
          }
        },
        workflow: {
          eyebrow: 'ครบทุกอย่างที่ต้องใช้ปล่อย',
          title: 'เส้นทางสั้นลงจาก starter สู่ launch',
          lead: 'ยังคงเบา แต่เพิ่มความสามารถ conversion และโครงสร้างเนื้อหาที่ frontend SaaS ต้องการ',
          steps: {
            routes: 'ใช้หน้าแรก ราคา ความช่วยเหลือ และข่าวจัดระเบียบข้อมูลสาธารณะก่อน',
            content: 'แทนที่ข้อความ i18n และแหล่งเนื้อหา (ราคา/ข่าวใช้ API แล้ว ย้าย CMS ได้)',
            auth: 'เชื่อมระบบบัญชี backend เมื่อพร้อมจัดการ session บทบาท และแอปผลิตภัณฑ์'
          }
        },
        ctaEyebrow: 'พร้อมสร้าง',
        ctaTitle: 'ใช้ฐาน Nuxt นี้เปิดตัว frontend ผลิตภัณฑ์ที่สมบูรณ์ได้เร็วขึ้น'
      },
      about: {
        eyebrow: 'เกี่ยวกับเรา',
        title: 'สร้างมาเพื่อเว็บสาธารณะและ frontend SaaS แบบเบา',
        lead: 'Nuxt Modern Starter เป็นฐาน Nuxt 4 ที่ใช้ซ้ำได้สำหรับหน้าการตลาด content hub และพื้นที่ผลิตภัณฑ์ที่รองรับ auth แบบเลือกได้',
        mission: {
          title: 'พันธกิจของเรา',
          body: 'เราจัดความสามารถทั่วไปของเว็บสาธารณะ—i18n routing SEO หน้าเนื้อหา ตัวอย่าง auth และรูปแบบ deploy—เป็นจุดเริ่มต้นที่รันได้ เพื่อให้ทีมโฟกัสความต่างของผลิตภัณฑ์'
        },
        values: {
          title: 'สิ่งที่เราให้ความสำคัญ',
          items: {
            focus: 'โฟกัสสถานการณ์เว็บสาธารณะ มีขอบเขตโมดูลชัดเจน ไม่ทำ starter ใหญ่เกินไป',
            quality: 'TypeScript strict lint ทดสอบ และตัวอย่าง deploy ตั้งแต่วันแรก',
            openness: 'แยกชั้นสาธารณะและผลิตภัณฑ์ เพื่อแทนที่เนื้อหา local และ API ได้ทีละน้อย'
          }
        },
        story: {
          title: 'ที่มาของโปรเจกต์',
          paragraphs: {
            origin:
              'starter มาจากความต้องการซ้ำ ๆ บนเว็บ SaaS และ frontend ผลิตภัณฑ์: หน้าแรกการตลาด ราคา ความช่วยเหลือ ข่าว login/register และตัวอย่าง workspace กับ editor หลัง login',
            practice:
              'ค่าเริ่มต้นเป็นภาษาจีน อังกฤษอยู่ที่ /en ผสม SSR/prerender/SWR สำหรับหน้าสาธารณะ และ route ผลิตภัณฑ์เป็นกลางภาษาด้วย CSR',
            next: 'หากกำลังประเมิน template Nuxt สำหรับเว็บสาธารณะ เริ่มจาก README quick start แล้วแทนที่ข้อความ เนื้อหา และการเชื่อม backend'
          }
        }
      },
      help: {
        eyebrow: 'ศูนย์ช่วยเหลือ',
        title: 'เรียนรู้การใช้ Nuxt Modern Starter',
        lead: 'หน้านี้รวมคำถามทั่วไปเกี่ยวกับ setup i18n auth SEO และ deploy ขั้นตอน quick start และรายการทรัพยากรมาจาก i18n FAQ มาจาก local config ย้ายไป CMS หรือ backend API ได้ภายหลัง',
        faqTitle: 'คำถามที่พบบ่อย',
        quickStart: {
          title: 'เริ่มใช้งานใน 30 นาที',
          steps: {
            install: 'เปิด Corepack แล้วรัน pnpm install',
            dev: 'รัน pnpm dev และดู route จีนเริ่มต้นกับ /en ภาษาอังกฤษ',
            explore:
              'ดูหน้าแรก ราคา เกี่ยวกับ ความช่วยเหลือ และข่าว เพื่อเข้าใจโครงสร้างเว็บสาธารณะ',
            extend: 'ทำตาม docs/usage.md เพื่อเพิ่มหน้า request SEO และ auth แบบเลือกได้'
          }
        },
        resources: {
          title: 'แนะนำให้อ่าน',
          architecture:
            'docs/architecture.md — ความรับผิดชอบของไดเรกทอรี กลยุทธ์ rendering โมดูล และ runtime flow',
          usage: 'docs/usage.md — หน้า request SEO ภาษา workspace/editor/บัญชี และ auth',
          conventions: 'docs/conventions.md — ขอบเขต config ชั้น request และข้อตกลงการเขียนโค้ด',
          deployment: 'docs/deployment.md — ตรวจสอบ deploy แบบ local Docker และ Nginx'
        }
      },
      news: {
        eyebrow: 'อัปเดตโปรเจกต์',
        title: 'รีลีสและบันทึก Nuxt Modern Starter',
        lead: 'ติดตามรีลีส starter แนวทาง deploy และคำแนะนำการขยาย หน้าเหล่านี้ยังสาธิตรายการ/รายละเอียดข่าว Article JSON-LD และกฎ cache SWR',
        notFound: 'ไม่พบบทความข่าวนี้'
      }
    }),
    product: mkProduct({
      auth: {
        header: {
          signIn: 'เข้าสู่ระบบ',
          signUp: 'สมัครสมาชิก',
          enterWorkspace: 'เข้าพื้นที่ทำงาน'
        },
        form: { username: 'ชื่อผู้ใช้', password: 'รหัสผ่าน', confirmPassword: 'ยืนยันรหัสผ่าน' },
        login: {
          title: 'เข้าสู่ระบบ',
          submit: 'เข้าสู่ระบบ',
          success: 'เข้าสู่ระบบสำเร็จ',
          noAccount: 'ยังไม่มีบัญชี?'
        },
        register: {
          title: 'สมัครสมาชิก',
          submit: 'สมัคร',
          success: 'สมัครสำเร็จ โปรดเข้าสู่ระบบ',
          hasAccount: 'มีบัญชีแล้ว?'
        },
        logout: { submit: 'ออกจากระบบ', success: 'ออกจากระบบแล้ว' },
        account: {
          eyebrow: 'หน้าที่มีการป้องกัน',
          title: 'บัญชี',
          lead: 'หน้านี้ถูกป้องกันด้วย named auth middleware และแสดงโปรไฟล์ผู้ใช้ปัจจุบัน',
          avatar: 'รูปโปรไฟล์',
          sessionTitle: 'เซสชัน',
          profileTitle: 'โปรไฟล์เพิ่มเติม',
          userId: 'ID ผู้ใช้',
          nickname: 'ชื่อเล่น',
          roles: 'บทบาท',
          permissions: 'สิทธิ์',
          none: 'ไม่มี',
          emptyProfile: 'ยังไม่มีโปรไฟล์เพิ่มเติม'
        },
        validation: {
          usernameRequired: 'กรุณากรอกชื่อผู้ใช้',
          passwordRequired: 'กรุณากรอกรหัสผ่าน',
          confirmPasswordRequired: 'กรุณายืนยันรหัสผ่าน',
          passwordMin: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
          passwordMismatch: 'รหัสผ่านทั้งสองไม่ตรงกัน'
        },
        errors: {
          loginFailed: 'เข้าสู่ระบบไม่สำเร็จ ตรวจสอบชื่อผู้ใช้หรือรหัสผ่าน',
          registerFailed: 'สมัครไม่สำเร็จ โปรดลองอีกครั้งภายหลัง',
          unauthorized: 'ไม่มีหรือข้อมูลเข้าสู่ระบบไม่ถูกต้อง'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'ตัวแก้ไขเนื้อหา',
        placeholder: 'เริ่มเขียนเนื้อหาของคุณ...',
        metaTitle: 'ตัวแก้ไข',
        autosave: {
          saving: 'กำลังบันทึก…',
          saved: 'บันทึกอัตโนมัติ · {time}',
          failed: 'บันทึกอัตโนมัติล้มเหลว จะลองใหม่เมื่อแก้ไขครั้งถัดไป'
        },
        rename: { failed: 'เปลี่ยนชื่อไม่สำเร็จ โปรดลองอีกครั้ง' }
      },
      workspace: {
        nav: 'พื้นที่ทำงาน',
        title: 'จัดการโปรเจกต์ PPT ของคุณ',
        defaultTitle: 'โปรเจกต์ไม่มีชื่อ',
        empty: 'ยังไม่มีโปรเจกต์ ใช้ปุ่มด้านบนเพื่อสร้าง',
        projectNotFound: 'ไม่พบโปรเจกต์หรือถูกปฏิเสธการเข้าถึง',
        create: 'PPT ว่างใหม่',
        edit: 'แก้ไข',
        delete: 'ลบ',
        deleteCancel: 'ยกเลิก',
        deleteConfirm: 'ลบ "{title}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
        deleteSuccess: 'ลบโปรเจกต์แล้ว',
        save: 'บันทึก',
        projectName: 'ชื่อโปรเจกต์',
        backToWorkspace: 'กลับพื้นที่ทำงาน',
        browse: 'ดู',
        share: 'แชร์',
        download: 'ดาวน์โหลด',
        more: 'การดำเนินการเพิ่มเติม'
      }
    })
  }
}
