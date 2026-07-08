/** Complete locale module translations (excluding de-DE, defined in apply script). */

const mkGlobal = (g) => g
const mkMarketing = (m) => m
const mkProduct = (p) => p

export const LOCALE_MODULES_REST = {
  'es-ES': {
    global: mkGlobal({
      nav: {
        home: 'Inicio',
        pricing: 'Precios',
        about: 'Acerca de',
        help: 'Ayuda',
        news: 'Noticias',
        primary: 'Navegación principal'
      },
      brand: { tagline: 'Starter moderno de Nuxt para sitios públicos' },
      seo: {
        defaultDescription:
          'Un starter reutilizable de Nuxt 4 para sitios de marketing, páginas SEO y frontends SaaS ligeros.'
      },
      common: {
        switchLanguage: 'Cambiar idioma',
        switchTheme: 'Cambiar tema',
        readMore: 'Leer más',
        backHome: 'Volver al inicio',
        error: 'Algo salió mal. Inténtalo de nuevo.',
        loadFailed: 'No se pudieron cargar los datos. Inténtalo de nuevo.',
        retry: 'Reintentar'
      },
      productNav: {
        workspace: 'Espacio de trabajo',
        themeTemplates: 'Plantillas de tema',
        pricing: 'Precios'
      },
      userMenu: { account: 'Cuenta', language: 'Idioma', signOut: 'Cerrar sesión' },
      accountNav: { settings: 'Configuración de cuenta' },
      templates: { empty: 'Las plantillas de tema llegarán pronto.' },
      error: {
        title: 'Página no encontrada',
        message: 'Comprueba la dirección o vuelve al inicio para seguir navegando.',
        forbidden: 'Acceso denegado',
        unsupportedLanguage: 'Idioma no compatible'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: 'Starter moderno de Nuxt para sitios públicos',
        lead: 'Nuxt Modern Starter reúne páginas de marketing, flujos de autenticación, contenido multilingüe, rutas SEO y valores predeterminados de despliegue Docker/Nginx en una base limpia. Úsalo para lanzar un sitio SaaS, frontend de producto o hub de contenido, y sustituye contenido e integraciones backend a medida que crece tu producto.',
        primaryCta: 'Empezar a construir',
        secondaryCta: 'Ver ejemplo de precios',
        preview: { metricLabel: 'Cobertura de plantillas', metricValue: '12+ páginas' },
        stats: {
          pages: { value: '12+', label: 'Páginas reutilizables y rutas de contenido' },
          modules: { value: '6', label: 'Módulos de ingeniería incluidos' },
          deploy: { value: '4', label: 'Estrategias de renderizado híbrido por ruta' }
        },
        featuresEyebrow: 'Impulsado por Nuxt 4',
        featuresTitle: 'Los bloques habituales de sitios públicos, ya organizados',
        featuresLead:
          'Inspirado en la jerarquía de Nuxt SaaS Template, la página de inicio ofrece tarjetas de funciones más sólidas para un aspecto listo para producción.',
        features: {
          design: {
            title: 'Sistema de diseño unificado',
            description:
              'Basado en Ant Design Vue y tokens de tema locales para mantener coherencia en modo de color, radio, sombras y espaciado.'
          },
          i18n: {
            title: 'Enrutamiento localizado',
            description:
              'Prefijos de idioma, cambio y enlaces localizados listos para páginas de marketing y rutas de contenido.'
          },
          seo: {
            title: 'Páginas optimizadas para SEO',
            description:
              'Inicio, precios, ayuda y artículos tienen puntos de entrada SEO extensibles para indexación pública.'
          },
          auth: {
            title: 'Flujos de cuenta',
            description:
              'Login, registro y páginas de cuenta conectadas al estado básico y listas para un backend real.'
          },
          content: {
            title: 'Centro de contenido',
            description:
              'FAQ desde config local tipada; noticias y precios vía API pública, migrables luego a CMS o backend.'
          },
          deploy: {
            title: 'Despliegue en producción',
            description:
              'Docker, Nginx, reglas SWR y cabeceras de seguridad ya incluidos en el starter.'
          }
        },
        workflow: {
          eyebrow: 'Todo lo que necesitas para publicar',
          title: 'Un camino más corto del starter al lanzamiento',
          lead: 'Mantiene el starter ligero añadiendo capacidades, conversión y estructura de contenido que un frontend SaaS necesita.',
          steps: {
            routes:
              'Reutiliza inicio, precios, ayuda y noticias para organizar primero la información pública.',
            content:
              'Sustituye textos i18n y fuentes de contenido (precios/noticias ya usan la API y pueden pasar a CMS).',
            auth: 'Conecta tu sistema de cuentas backend cuando quieras enlazar sesiones, roles y la app de producto.'
          }
        },
        ctaEyebrow: 'Listo para construir',
        ctaTitle: 'Usa esta base Nuxt para lanzar un frontend de producto pulido más rápido.'
      },
      about: {
        eyebrow: 'Acerca de nosotros',
        title: 'Creado para sitios públicos y frontends SaaS ligeros',
        lead: 'Nuxt Modern Starter es una base reutilizable de Nuxt 4 para páginas de marketing, hubs de contenido y superficies de producto opcionales con autenticación.',
        mission: {
          title: 'Nuestra misión',
          body: 'Organizamos las capacidades más comunes de sitios públicos—enrutamiento i18n, SEO, páginas de contenido, ejemplos de auth y patrones de despliegue—en un punto de partida ejecutable para que los equipos se centren en diferencias de producto.'
        },
        values: {
          title: 'En qué optimizamos',
          items: {
            focus:
              'Enfocados en escenarios de sitios públicos con límites de módulo claros, sin un starter sobredimensionado.',
            quality:
              'TypeScript estricto, lint, tests y ejemplos de despliegue desde el primer día.',
            openness:
              'Capas pública y de producto separadas para sustituir contenido local y vía API gradualmente.'
          }
        },
        story: {
          title: 'Antecedentes del proyecto',
          paragraphs: {
            origin:
              'El starter surge de necesidades repetidas en sitios SaaS y frontends de producto: inicio de marketing, precios, ayuda, noticias, registro/login y ejemplos de espacio de trabajo y editor.',
            practice:
              'Por defecto chino como locale principal con inglés en /en, mezcla SSR/prerender/SWR en páginas públicas y rutas de producto neutras en idioma con CSR.',
            next: 'Si evalúas una plantilla Nuxt para sitios públicos, empieza con el quick start del README y sustituye textos, contenido e integraciones backend.'
          }
        }
      },
      help: {
        eyebrow: 'Centro de ayuda',
        title: 'Aprende a usar Nuxt Modern Starter',
        lead: 'Esta página recopila preguntas frecuentes sobre configuración, i18n, auth, SEO y despliegue. Pasos de inicio y recursos vienen de i18n; FAQ de config local, migrable luego a CMS o API backend.',
        faqTitle: 'Preguntas frecuentes',
        quickStart: {
          title: 'En marcha en 30 minutos',
          steps: {
            install: 'Activa Corepack y ejecuta pnpm install.',
            dev: 'Ejecuta pnpm dev y navega rutas chinas por defecto y /en en inglés.',
            explore:
              'Revisa inicio, precios, acerca de, ayuda y noticias para entender la estructura del sitio público.',
            extend: 'Sigue docs/usage.md para añadir páginas, peticiones, SEO y auth opcional.'
          }
        },
        resources: {
          title: 'Lectura recomendada',
          architecture:
            'docs/architecture.md — responsabilidades de directorios, estrategia de renderizado, módulos y flujo en runtime',
          usage:
            'docs/usage.md — páginas, peticiones, SEO, idiomas, espacio de trabajo/editor/cuenta y auth',
          conventions:
            'docs/conventions.md — límites de config, capas de peticiones y convenciones de código',
          deployment: 'docs/deployment.md — validación de despliegue local, Docker y Nginx'
        }
      },
      news: {
        eyebrow: 'Actualizaciones del proyecto',
        title: 'Lanzamientos y notas de Nuxt Modern Starter',
        lead: 'Sigue releases del starter, prácticas de despliegue y guías de extensión. Estas páginas también demuestran listados/detalle de noticias, Article JSON-LD y reglas de caché SWR.',
        notFound: 'No se encontró este artículo de noticias'
      }
    }),
    product: mkProduct({
      auth: {
        header: {
          signIn: 'Iniciar sesión',
          signUp: 'Registrarse',
          enterWorkspace: 'Entrar al espacio de trabajo'
        },
        form: {
          username: 'Nombre de usuario',
          password: 'Contraseña',
          confirmPassword: 'Confirmar contraseña'
        },
        login: {
          title: 'Iniciar sesión',
          submit: 'Iniciar sesión',
          success: 'Sesión iniciada correctamente',
          noAccount: '¿Aún no tienes cuenta?'
        },
        register: {
          title: 'Registrarse',
          submit: 'Registrarse',
          success: 'Registro correcto. Inicia sesión.',
          hasAccount: '¿Ya tienes cuenta?'
        },
        logout: { submit: 'Cerrar sesión', success: 'Sesión cerrada' },
        account: {
          eyebrow: 'Página protegida',
          title: 'Cuenta',
          lead: 'Esta página está protegida por el middleware auth nombrado y muestra el perfil del usuario actual.',
          avatar: 'Foto de perfil',
          sessionTitle: 'Sesión',
          profileTitle: 'Perfil extendido',
          userId: 'ID de usuario',
          nickname: 'Apodo',
          roles: 'Roles',
          permissions: 'Permisos',
          none: 'Ninguno',
          emptyProfile: 'Sin perfil extendido aún'
        },
        validation: {
          usernameRequired: 'Introduce un nombre de usuario',
          passwordRequired: 'Introduce una contraseña',
          confirmPasswordRequired: 'Confirma tu contraseña',
          passwordMin: 'La contraseña debe tener al menos 6 caracteres',
          passwordMismatch: 'Las dos contraseñas no coinciden'
        },
        errors: {
          loginFailed: 'Error al iniciar sesión. Comprueba usuario o contraseña.',
          registerFailed: 'Error al registrarse. Inténtalo más tarde.',
          unauthorized: 'Credenciales de inicio de sesión ausentes o inválidas'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'Editor de contenido',
        placeholder: 'Empieza a escribir tu contenido...',
        metaTitle: 'Editor',
        autosave: {
          saving: 'Guardando…',
          saved: 'Guardado automáticamente · {time}',
          failed: 'Error al guardar automáticamente, se reintentará en la próxima edición'
        },
        rename: { failed: 'Error al renombrar, inténtalo de nuevo' }
      },
      workspace: {
        nav: 'Espacio de trabajo',
        title: 'Gestiona tus proyectos PPT',
        defaultTitle: 'Proyecto sin título',
        empty: 'Aún no hay proyectos. Usa el botón de arriba para crear uno.',
        projectNotFound: 'Proyecto no encontrado o acceso denegado',
        create: 'Nuevo PPT en blanco',
        edit: 'Editar',
        delete: 'Eliminar',
        deleteCancel: 'Cancelar',
        deleteConfirm: '¿Eliminar «{title}»? Esta acción no se puede deshacer.',
        deleteSuccess: 'Proyecto eliminado',
        save: 'Guardar',
        projectName: 'Nombre del proyecto',
        backToWorkspace: 'Volver al espacio de trabajo',
        browse: 'Ver',
        share: 'Compartir',
        download: 'Descargar',
        more: 'Más acciones'
      }
    })
  },

  'fr-FR': {
    global: mkGlobal({
      nav: {
        home: 'Accueil',
        pricing: 'Tarifs',
        about: 'À propos',
        help: 'Aide',
        news: 'Actualités',
        primary: 'Navigation principale'
      },
      brand: { tagline: 'Starter Nuxt moderne pour sites publics' },
      seo: {
        defaultDescription:
          'Un starter Nuxt 4 réutilisable pour sites marketing, pages SEO et frontends SaaS légers.'
      },
      common: {
        switchLanguage: 'Changer de langue',
        switchTheme: 'Changer de thème',
        readMore: 'En savoir plus',
        backHome: "Retour à l'accueil",
        error: 'Une erreur est survenue. Veuillez réessayer.',
        loadFailed: 'Échec du chargement des données. Veuillez réessayer.',
        retry: 'Réessayer'
      },
      productNav: {
        workspace: 'Espace de travail',
        themeTemplates: 'Modèles de thème',
        pricing: 'Tarifs'
      },
      userMenu: { account: 'Compte', language: 'Langue', signOut: 'Se déconnecter' },
      accountNav: { settings: 'Paramètres du compte' },
      templates: { empty: 'Les modèles de thème arrivent bientôt.' },
      error: {
        title: 'Page introuvable',
        message: "Vérifiez l'adresse ou revenez à l'accueil pour continuer.",
        forbidden: 'Accès refusé',
        unsupportedLanguage: 'Langue non prise en charge'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: 'Starter Nuxt moderne pour sites publics',
        lead: 'Nuxt Modern Starter regroupe pages marketing, flux d’authentification, contenu multilingue, routes SEO et paramètres de déploiement Docker/Nginx dans une base claire. Lancez un site SaaS, un frontend produit ou un hub de contenu, puis remplacez contenu et intégrations backend au fil de la croissance.',
        primaryCta: 'Commencer à construire',
        secondaryCta: 'Voir un exemple de tarifs',
        preview: { metricLabel: 'Couverture des modèles', metricValue: '12+ pages' },
        stats: {
          pages: { value: '12+', label: 'Pages réutilisables et routes de contenu' },
          modules: { value: '6', label: 'Modules d’ingénierie inclus' },
          deploy: { value: '4', label: 'Stratégies de rendu hybride par route' }
        },
        featuresEyebrow: 'Propulsé par Nuxt 4',
        featuresTitle: 'Les briques habituelles des sites publics, déjà organisées',
        featuresLead:
          'Inspiré de la hiérarchie Nuxt SaaS Template, la page d’accueil propose des cartes fonctionnelles plus abouties pour un rendu prêt pour la production.',
        features: {
          design: {
            title: 'Système de design unifié',
            description:
              'Basé sur Ant Design Vue et des tokens locaux pour un mode clair/sombre, rayons, ombres et espacements cohérents.'
          },
          i18n: {
            title: 'Routage localisé',
            description:
              'Préfixes de langue, bascule et liens localisés prêts pour le marketing et le contenu.'
          },
          seo: {
            title: 'Pages optimisées SEO',
            description:
              'Accueil, tarifs, aide et articles avec des points d’entrée SEO extensibles pour l’indexation publique.'
          },
          auth: {
            title: 'Parcours compte',
            description:
              'Connexion, inscription et compte reliés à un état de base, prêts pour un vrai backend.'
          },
          content: {
            title: 'Hub de contenu',
            description:
              'FAQ depuis une config locale typée ; actualités et tarifs via API publique, migrables vers CMS ou backend.'
          },
          deploy: {
            title: 'Déploiement production',
            description:
              'Docker, Nginx, règles SWR et en-têtes de sécurité déjà inclus dans le starter.'
          }
        },
        workflow: {
          eyebrow: 'Tout pour mettre en ligne',
          title: 'Un chemin plus court du starter au lancement',
          lead: 'Il reste léger tout en ajoutant capacités, conversion et structure de contenu attendues d’un frontend SaaS.',
          steps: {
            routes:
              'Réutilisez d’abord accueil, tarifs, aide et actualités pour structurer l’information publique.',
            content:
              'Remplacez ensuite les textes i18n et sources de contenu (tarifs/actualités via API, migrables vers CMS).',
            auth: 'Connectez votre backend compte quand vous êtes prêt à gérer sessions, rôles et app produit.'
          }
        },
        ctaEyebrow: 'Prêt à construire',
        ctaTitle: 'Utilisez cette base Nuxt pour lancer plus vite un frontend produit soigné.'
      },
      about: {
        eyebrow: 'À propos de nous',
        title: 'Conçu pour sites publics et frontends SaaS légers',
        lead: 'Nuxt Modern Starter est une base Nuxt 4 réutilisable pour pages marketing, hubs de contenu et surfaces produit optionnelles avec authentification.',
        mission: {
          title: 'Notre mission',
          body: 'Nous regroupons les capacités les plus courantes des sites publics—routage i18n, SEO, pages de contenu, exemples auth et modèles de déploiement—dans un point de départ exécutable pour que les équipes se concentrent sur le produit.'
        },
        values: {
          title: 'Ce que nous optimisons',
          items: {
            focus:
              'Rester focalisés sur les sites publics avec des limites de modules claires, sans starter surdimensionné.',
            quality:
              'TypeScript strict, lint, tests et exemples de déploiement dès le premier jour.',
            openness:
              'Séparer couches publique et produit pour remplacer progressivement contenu local et contenu API.'
          }
        },
        story: {
          title: 'Contexte du projet',
          paragraphs: {
            origin:
              'Le starter vient de besoins récurrents sur sites SaaS et frontends produit : accueil marketing, tarifs, aide, actualités, inscription/connexion, plus espace de travail et éditeur connectés.',
            practice:
              'Chinois par défaut avec anglais sous /en, mélange SSR/prerender/SWR pour les pages publiques et routes produit neutres en langue avec CSR.',
            next: 'Si vous évaluez un template Nuxt pour site public, commencez par le quick start README puis remplacez textes, contenu et intégrations backend.'
          }
        }
      },
      help: {
        eyebrow: 'Centre d’aide',
        title: 'Apprendre à utiliser Nuxt Modern Starter',
        lead: 'Cette page regroupe les questions fréquentes sur setup, i18n, auth, SEO et déploiement. Étapes de démarrage et ressources viennent de i18n ; FAQ depuis config locale, migrable vers CMS ou API backend.',
        faqTitle: 'FAQ',
        quickStart: {
          title: 'Opérationnel en 30 minutes',
          steps: {
            install: 'Activez Corepack puis exécutez pnpm install.',
            dev: 'Lancez pnpm dev et parcourez les routes chinoises par défaut et /en en anglais.',
            explore:
              'Consultez accueil, tarifs, à propos, aide et actualités pour comprendre la structure du site public.',
            extend: 'Suivez docs/usage.md pour ajouter pages, requêtes, SEO et auth optionnelle.'
          }
        },
        resources: {
          title: 'Lecture recommandée',
          architecture:
            'docs/architecture.md — responsabilités des dossiers, stratégie de rendu, modules et flux runtime',
          usage:
            'docs/usage.md — pages, requêtes, SEO, langues, espace de travail/éditeur/compte et auth',
          conventions:
            'docs/conventions.md — limites de config, couches de requêtes et conventions de code',
          deployment: 'docs/deployment.md — validation déploiement local, Docker et Nginx'
        }
      },
      news: {
        eyebrow: 'Mises à jour du projet',
        title: 'Versions et notes Nuxt Modern Starter',
        lead: 'Suivez les releases du starter, pratiques de déploiement et guides d’extension. Ces pages démontrent aussi listes/détails d’actualités, Article JSON-LD et règles de cache SWR.',
        notFound: 'Cet article d’actualité est introuvable'
      }
    }),
    product: mkProduct({
      auth: {
        header: {
          signIn: 'Se connecter',
          signUp: "S'inscrire",
          enterWorkspace: "Entrer dans l'espace de travail"
        },
        form: {
          username: "Nom d'utilisateur",
          password: 'Mot de passe',
          confirmPassword: 'Confirmer le mot de passe'
        },
        login: {
          title: 'Connexion',
          submit: 'Se connecter',
          success: 'Connexion réussie',
          noAccount: 'Pas encore de compte ?'
        },
        register: {
          title: 'Inscription',
          submit: "S'inscrire",
          success: 'Inscription réussie. Veuillez vous connecter.',
          hasAccount: 'Déjà un compte ?'
        },
        logout: { submit: 'Se déconnecter', success: 'Déconnecté' },
        account: {
          eyebrow: 'Page protégée',
          title: 'Compte',
          lead: 'Cette page est protégée par le middleware auth nommé et affiche le profil utilisateur actuel.',
          avatar: 'Photo de profil',
          sessionTitle: 'Session',
          profileTitle: 'Profil étendu',
          userId: 'ID utilisateur',
          nickname: 'Surnom',
          roles: 'Rôles',
          permissions: 'Permissions',
          none: 'Aucun',
          emptyProfile: 'Pas encore de profil étendu'
        },
        validation: {
          usernameRequired: "Veuillez saisir un nom d'utilisateur",
          passwordRequired: 'Veuillez saisir un mot de passe',
          confirmPasswordRequired: 'Veuillez confirmer votre mot de passe',
          passwordMin: 'Le mot de passe doit contenir au moins 6 caractères',
          passwordMismatch: 'Les deux mots de passe ne correspondent pas'
        },
        errors: {
          loginFailed: 'Échec de connexion. Vérifiez identifiant ou mot de passe.',
          registerFailed: "Échec de l'inscription. Réessayez plus tard.",
          unauthorized: 'Identifiants de connexion manquants ou invalides'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'Éditeur de contenu',
        placeholder: 'Commencez à rédiger votre contenu...',
        metaTitle: 'Éditeur',
        autosave: {
          saving: 'Enregistrement…',
          saved: 'Enregistré automatiquement · {time}',
          failed: 'Échec de l’enregistrement automatique, nouvel essai à la prochaine modification'
        },
        rename: { failed: 'Échec du renommage, veuillez réessayer' }
      },
      workspace: {
        nav: 'Espace de travail',
        title: 'Gérez vos projets PPT',
        defaultTitle: 'Projet sans titre',
        empty: 'Aucun projet pour l’instant. Utilisez le bouton ci-dessus pour en créer un.',
        projectNotFound: 'Projet introuvable ou accès refusé',
        create: 'Nouveau PPT vierge',
        edit: 'Modifier',
        delete: 'Supprimer',
        deleteCancel: 'Annuler',
        deleteConfirm: 'Supprimer « {title} » ? Cette action est irréversible.',
        deleteSuccess: 'Projet supprimé',
        save: 'Enregistrer',
        projectName: 'Nom du projet',
        backToWorkspace: "Retour à l'espace de travail",
        browse: 'Voir',
        share: 'Partager',
        download: 'Télécharger',
        more: 'Plus d’actions'
      }
    })
  },

  'ja-JP': {
    global: mkGlobal({
      nav: {
        home: 'ホーム',
        pricing: '料金',
        about: '会社概要',
        help: 'ヘルプ',
        news: 'ニュース',
        primary: 'メインナビゲーション'
      },
      brand: { tagline: '公開サイト向けのモダン Nuxt スターター' },
      seo: {
        defaultDescription:
          'マーケティングサイト、SEO ページ、軽量 SaaS フロントエンド向けの再利用可能な Nuxt 4 スターター。'
      },
      common: {
        switchLanguage: '言語を切り替え',
        switchTheme: 'テーマを切り替え',
        readMore: '続きを読む',
        backHome: 'ホームに戻る',
        error: '問題が発生しました。もう一度お試しください。',
        loadFailed: 'データの読み込みに失敗しました。もう一度お試しください。',
        retry: '再試行'
      },
      productNav: {
        workspace: 'ワークスペース',
        themeTemplates: 'テーマテンプレート',
        pricing: '料金'
      },
      userMenu: { account: 'アカウント', language: '言語', signOut: 'ログアウト' },
      accountNav: { settings: 'アカウント設定' },
      templates: { empty: 'テーマテンプレートは近日公開予定です。' },
      error: {
        title: 'ページが見つかりません',
        message: 'URL を確認するか、ホームに戻って閲覧を続けてください。',
        forbidden: 'アクセスが拒否されました',
        unsupportedLanguage: 'サポートされていない言語'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: '公開サイト向けのモダン Nuxt スターター',
        lead: 'Nuxt Modern Starter は、マーケティングページ、認証フロー、多言語コンテンツ、SEO ルート、Docker/Nginx デプロイ設定を 1 つのクリーンな基盤にまとめます。SaaS サイト、プロダクトフロントエンド、コンテンツハブの立ち上げに使い、成長に合わせてコンテンツとバックエンド連携を置き換えられます。',
        primaryCta: '構築を始める',
        secondaryCta: '料金例を見る',
        preview: { metricLabel: 'テンプレートカバレッジ', metricValue: '12+ ページ' },
        stats: {
          pages: { value: '12+', label: '再利用可能なページとコンテンツルート' },
          modules: { value: '6', label: '同梱のコアエンジニアリングモジュール' },
          deploy: { value: '4', label: 'ルート別ハイブリッドレンダリング戦略' }
        },
        featuresEyebrow: 'Nuxt 4 搭載',
        featuresTitle: '公開サイトに必要な要素をすでに整理',
        featuresLead:
          'Nuxt SaaS Template の情報階層を参考に、ヒーロー以降も本番向けの機能カードでつなげます。',
        features: {
          design: {
            title: '統一デザインシステム',
            description:
              'Ant Design Vue とローカルテーマトークンで、カラーモード、角丸、影、余白を一貫管理。'
          },
          i18n: {
            title: 'ローカライズルーティング',
            description:
              '言語プレフィックス、切り替え、ローカライズリンクをマーケティングとコンテンツページ向けに用意。'
          },
          seo: {
            title: 'SEO フレンドリーなページ',
            description:
              'ホーム、料金、ヘルプ、記事ページに公開インデックス向けの拡張可能な SEO 入口。'
          },
          auth: {
            title: 'アカウントフロー',
            description:
              'ログイン、登録、アカウントページを基本状態に接続し、本番バックエンド連携の準備完了。'
          },
          content: {
            title: 'コンテンツハブ',
            description:
              'FAQ は型付きローカル config、ニュースと料金は Public API 経由。後から CMS やバックエンドへ移行可能。'
          },
          deploy: {
            title: '本番デプロイ',
            description: 'Docker、Nginx、SWR routeRules、セキュリティヘッダーをスターターに同梱。'
          }
        },
        workflow: {
          eyebrow: '公開に必要なものを一式',
          title: 'スターターから公開までの距離を短縮',
          lead: '軽量さを保ちつつ、SaaS フロントエンドに必要な機能、コンバージョン、コンテンツ構造を補完。',
          steps: {
            routes: 'まずホーム、料金、ヘルプ、ニュースで公開情報を整理。',
            content:
              '次に i18n 文案とコンテンツソースを差し替え（料金/ニュースは API 利用、CMS 移行可）。',
            auth: '準備ができたらバックエンドアカウント体系を接続し、セッション、権限、プロダクトアプリを連携。'
          }
        },
        ctaEyebrow: '構築の準備完了',
        ctaTitle: 'この Nuxt 基盤で、より早く洗練されたプロダクトフロントエンドを公開。'
      },
      about: {
        eyebrow: '会社概要',
        title: '公開サイトと軽量 SaaS フロントエンドのために',
        lead: 'Nuxt Modern Starter は、マーケティングページ、コンテンツハブ、任意の認証対応プロダクト面を素早く構築する再利用可能な Nuxt 4 基盤です。',
        mission: {
          title: '私たちの使命',
          body: '公開サイトで最も一般的な能力—i18n ルーティング、SEO、コンテンツページ、認証サンプル、デプロイパターン—を実行可能な起点に整理し、インフラ再構築ではなくプロダクト差分に集中できるようにします。'
        },
        values: {
          title: '大切にしていること',
          items: {
            focus:
              '公開サイトシナリオに集中し、モジュール境界を明確に、スターターの肥大化を避ける。',
            quality: '初日から TypeScript strict、Lint、テスト、デプロイサンプルを標準装備。',
            openness:
              '公開層とプロダクト層を分離し、ローカル/API コンテンツを段階的に置き換え可能に。'
          }
        },
        story: {
          title: 'プロジェクト背景',
          paragraphs: {
            origin:
              'SaaS サイトとプロダクトフロントエンドで繰り返し必要だった要素—マーケティングホーム、料金、ヘルプ、ニュース、ログイン/登録、ログイン後のワークスペースとエディター例—から生まれました。',
            practice:
              'デフォルトは中国語メイン、英語は /en。公開ページは SSR/prerender/SWR を組み合わせ、プロダクトルートは言語中立 URL と CSR。',
            next: 'Nuxt 公開サイトテンプレートを検討中なら README のクイックスタートから始め、文案・コンテンツ・バックエンド連携を差し替えてください。'
          }
        }
      },
      help: {
        eyebrow: 'ヘルプセンター',
        title: 'Nuxt Modern Starter の使い方',
        lead: 'セットアップ、i18n、認証、SEO、デプロイに関する FAQ をまとめています。クイックスタートとリソース一覧は i18n 由来、FAQ はローカル config 由来で、後から CMS やバックエンド API に移行可能です。',
        faqTitle: 'よくある質問',
        quickStart: {
          title: '30 分で起動',
          steps: {
            install: 'Corepack を有効化し、pnpm install を実行。',
            dev: 'pnpm dev を実行し、デフォルト中国語ルートと /en 英語ルートを確認。',
            explore: 'ホーム、料金、会社概要、ヘルプ、ニュースで公開サイト構造を把握。',
            extend: 'docs/usage.md に従い、ページ、リクエスト、SEO、任意の認証を追加。'
          }
        },
        resources: {
          title: 'おすすめ資料',
          architecture:
            'docs/architecture.md — ディレクトリ責務、レンダリング戦略、機能モジュール、ランタイムフロー',
          usage:
            'docs/usage.md — ページ、リクエスト、SEO、言語、ワークスペース/エディター/アカウント、認証',
          conventions: 'docs/conventions.md — 設定境界、リクエスト階層、コーディング規約',
          deployment: 'docs/deployment.md — ローカル、Docker、Nginx デプロイ検証'
        }
      },
      news: {
        eyebrow: 'プロジェクト更新',
        title: 'Nuxt Modern Starter のリリースとノート',
        lead: 'スターターのリリース、デプロイ実践、拡張ガイドを追跡。ニュース一覧/詳細、Article JSON-LD、SWR キャッシュルールのデモも兼ねています。',
        notFound: 'このニュース記事は見つかりませんでした'
      }
    }),
    product: mkProduct({
      auth: {
        header: { signIn: 'ログイン', signUp: '新規登録', enterWorkspace: 'ワークスペースへ' },
        form: {
          username: 'ユーザー名',
          password: 'パスワード',
          confirmPassword: 'パスワード（確認）'
        },
        login: {
          title: 'ログイン',
          submit: 'ログイン',
          success: 'ログインしました',
          noAccount: 'アカウントをお持ちでないですか？'
        },
        register: {
          title: '新規登録',
          submit: '登録',
          success: '登録が完了しました。ログインしてください。',
          hasAccount: 'すでにアカウントをお持ちですか？'
        },
        logout: { submit: 'ログアウト', success: 'ログアウトしました' },
        account: {
          eyebrow: '保護されたページ',
          title: 'アカウント',
          lead: 'このページは named auth ミドルウェアで保護され、現在のユーザープロフィールを表示します。',
          avatar: 'プロフィール写真',
          sessionTitle: 'セッション',
          profileTitle: '拡張プロフィール',
          userId: 'ユーザー ID',
          nickname: 'ニックネーム',
          roles: 'ロール',
          permissions: '権限',
          none: 'なし',
          emptyProfile: '拡張プロフィールはまだありません'
        },
        validation: {
          usernameRequired: 'ユーザー名を入力してください',
          passwordRequired: 'パスワードを入力してください',
          confirmPasswordRequired: 'パスワードを再入力してください',
          passwordMin: 'パスワードは 6 文字以上必要です',
          passwordMismatch: '2 つのパスワードが一致しません'
        },
        errors: {
          loginFailed: 'ログインに失敗しました。ユーザー名またはパスワードを確認してください。',
          registerFailed: '登録に失敗しました。後でもう一度お試しください。',
          unauthorized: 'ログイン情報が無効または未入力です'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'コンテンツエディター',
        placeholder: 'コンテンツの作成を開始...',
        metaTitle: 'エディター',
        autosave: {
          saving: '保存中…',
          saved: '自動保存済み · {time}',
          failed: '自動保存に失敗しました。次回編集時に再試行します'
        },
        rename: { failed: '名前の変更に失敗しました。もう一度お試しください' }
      },
      workspace: {
        nav: 'ワークスペース',
        title: 'PPT プロジェクトを管理',
        defaultTitle: '無題のプロジェクト',
        empty: 'プロジェクトはまだありません。右上のボタンで作成してください。',
        projectNotFound: 'プロジェクトが見つからないか、アクセス権がありません',
        create: '新規空白 PPT',
        edit: '編集',
        delete: '削除',
        deleteCancel: 'キャンセル',
        deleteConfirm: '「{title}」を削除しますか？この操作は元に戻せません。',
        deleteSuccess: 'プロジェクトを削除しました',
        save: '保存',
        projectName: 'プロジェクト名',
        backToWorkspace: 'ワークスペースに戻る',
        browse: '表示',
        share: '共有',
        download: 'ダウンロード',
        more: 'その他の操作'
      }
    })
  },

  'ko-KR': {
    global: mkGlobal({
      nav: {
        home: '홈',
        pricing: '요금',
        about: '소개',
        help: '도움말',
        news: '뉴스',
        primary: '주요 내비게이션'
      },
      brand: { tagline: '공개 웹사이트를 위한 모던 Nuxt 스타터' },
      seo: {
        defaultDescription:
          '마케팅 사이트, SEO 페이지, 경량 SaaS 프론트엔드를 위한 재사용 가능한 Nuxt 4 스타터.'
      },
      common: {
        switchLanguage: '언어 변경',
        switchTheme: '테마 변경',
        readMore: '더 보기',
        backHome: '홈으로',
        error: '문제가 발생했습니다. 다시 시도해 주세요.',
        loadFailed: '데이터를 불러오지 못했습니다. 다시 시도해 주세요.',
        retry: '재시도'
      },
      productNav: { workspace: '워크스페이스', themeTemplates: '테마 템플릿', pricing: '요금' },
      userMenu: { account: '계정', language: '언어', signOut: '로그아웃' },
      accountNav: { settings: '계정 설정' },
      templates: { empty: '테마 템플릿이 곧 제공됩니다.' },
      error: {
        title: '페이지를 찾을 수 없습니다',
        message: '주소를 확인하거나 홈으로 돌아가 계속 탐색하세요.',
        forbidden: '접근 거부',
        unsupportedLanguage: '지원하지 않는 언어'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: '공개 웹사이트를 위한 모던 Nuxt 스타터',
        lead: 'Nuxt Modern Starter는 마케팅 페이지, 인증 흐름, 다국어 콘텐츠, SEO 라우트, Docker/Nginx 배포 기본값을 하나의 깔끔한 기반으로 제공합니다. SaaS 웹사이트, 제품 프론트엔드, 콘텐츠 허브를 빠르게 시작하고 성장에 맞춰 콘텐츠와 백엔드 연동을 교체하세요.',
        primaryCta: '구축 시작',
        secondaryCta: '요금 예시 보기',
        preview: { metricLabel: '템플릿 커버리지', metricValue: '12+ 페이지' },
        stats: {
          pages: { value: '12+', label: '재사용 가능한 페이지 및 콘텐츠 라우트' },
          modules: { value: '6', label: '포함된 핵심 엔지니어링 모듈' },
          deploy: { value: '4', label: '라우트별 하이브리드 렌더링 전략' }
        },
        featuresEyebrow: 'Nuxt 4 기반',
        featuresTitle: '공개 사이트에 필요한 구성 요소를 이미 정리',
        featuresLead:
          'Nuxt SaaS Template 정보 계층을 참고해, 히어로 이후도 제품 수준의 기능 카드로 이어집니다.',
        features: {
          design: {
            title: '통합 디자인 시스템',
            description:
              'Ant Design Vue와 로컬 테마 토큰으로 색상 모드, 모서리, 그림자, 간격을 일관되게 유지.'
          },
          i18n: {
            title: '로컬라이즈드 라우팅',
            description:
              '언어 접두사, 전환, 로컬라이즈드 링크를 마케팅 및 콘텐츠 페이지에 바로 사용.'
          },
          seo: {
            title: 'SEO 친화적 페이지',
            description: '홈, 요금, 도움말, 기사 페이지에 공개 인덱싱용 확장 가능 SEO 진입점.'
          },
          auth: {
            title: '계정 흐름',
            description:
              '로그인, 회원가입, 계정 페이지가 기본 상태에 연결되어 실제 백엔드 연동 준비 완료.'
          },
          content: {
            title: '콘텐츠 허브',
            description:
              'FAQ는 typed 로컬 config, 뉴스와 요금은 Public API. 이후 CMS 또는 백엔드로 이전 가능.'
          },
          deploy: {
            title: '프로덕션 배포',
            description: 'Docker, Nginx, SWR routeRules, 보안 헤더가 스타터에 포함.'
          }
        },
        workflow: {
          eyebrow: '출시에 필요한 모든 것',
          title: '스타터에서 런칭까지 더 짧은 경로',
          lead: '가벼움을 유지하면서 SaaS 프론트엔드에 필요한 기능, 전환, 콘텐츠 구조를 보완합니다.',
          steps: {
            routes: '먼저 홈, 요금, 도움말, 뉴스 페이지로 공개 정보를 구성.',
            content: '다음으로 i18n 문구와 콘텐츠 소스 교체(요금/뉴스는 API 사용, CMS 이전 가능).',
            auth: '준비되면 백엔드 계정 시스템을 연결해 세션, 역할, 제품 앱을 연동.'
          }
        },
        ctaEyebrow: '구축 준비 완료',
        ctaTitle: '이 Nuxt 기반으로 더 빠르게 완성도 높은 제품 프론트엔드를 출시하세요.'
      },
      about: {
        eyebrow: '회사 소개',
        title: '공개 사이트와 경량 SaaS 프론트엔드를 위해',
        lead: 'Nuxt Modern Starter는 마케팅 페이지, 콘텐츠 허브, 선택적 인증 제품 영역을 위한 재사용 가능한 Nuxt 4 기반입니다.',
        mission: {
          title: '우리의 목표',
          body: '공개 사이트에서 가장 흔한 기능—i18n 라우팅, SEO, 콘텐츠 페이지, 인증 샘플, 배포 패턴—을 실행 가능한 시작점으로 정리해 팀이 인프라 재구축 대신 제품 차별화에 집중하도록 합니다.'
        },
        values: {
          title: '우리가 지향하는 것',
          items: {
            focus:
              '공개 사이트 시나리오에 집중하고 모듈 경계를 명확히 하여 스타터 비대화를 피합니다.',
            quality: '첫날부터 TypeScript strict, lint, 테스트, 배포 샘플 제공.',
            openness: '공개/제품 계층을 분리해 로컬 및 API 콘텐츠를 점진적으로 교체 가능.'
          }
        },
        story: {
          title: '프로젝트 배경',
          paragraphs: {
            origin:
              'SaaS 웹사이트와 제품 프론트엔드에서 반복되던 요구—마케팅 홈, 요금, 도움말, 뉴스, 로그인/회원가입, 로그인 후 워크스페이스 및 에디터 예시—에서 출발했습니다.',
            practice:
              '기본 locale은 중국어, 영어는 /en. 공개 페이지는 SSR/prerender/SWR 혼합, 제품 라우트는 언어 중립 URL과 CSR.',
            next: 'Nuxt 공개 사이트 템플릿을 검토 중이라면 README 빠른 시작 후 문구, 콘텐츠, 백엔드 연동을 교체하세요.'
          }
        }
      },
      help: {
        eyebrow: '도움말 센터',
        title: 'Nuxt Modern Starter 사용 방법',
        lead: '프로젝트 설정, i18n, 인증, SEO, 배포에 대한 FAQ를 모았습니다. 빠른 시작 단계와 리소스 목록은 i18n, FAQ는 로컬 config에서 오며 CMS 또는 백엔드 API로 이전 가능합니다.',
        faqTitle: '자주 묻는 질문',
        quickStart: {
          title: '30분 안에 실행',
          steps: {
            install: 'Corepack을 활성화한 뒤 pnpm install 실행.',
            dev: 'pnpm dev 실행 후 기본 중국어 라우트와 /en 영어 라우트 확인.',
            explore: '홈, 요금, 소개, 도움말, 뉴스 페이지로 공개 사이트 구조 파악.',
            extend: 'docs/usage.md를 따라 페이지, 요청, SEO, 선택적 인증 추가.'
          }
        },
        resources: {
          title: '추천 자료',
          architecture: 'docs/architecture.md — 디렉터리 책임, 렌더링 전략, 기능 모듈, 런타임 흐름',
          usage: 'docs/usage.md — 페이지, 요청, SEO, 언어, 워크스페이스/에디터/계정, 인증',
          conventions: 'docs/conventions.md — 설정 경계, 요청 계층, 코딩 규약',
          deployment: 'docs/deployment.md — 로컬, Docker, Nginx 배포 검증'
        }
      },
      news: {
        eyebrow: '프로젝트 업데이트',
        title: 'Nuxt Modern Starter 릴리스 및 노트',
        lead: '스타터 릴리스, 배포 실무, 확장 가이드를 추적합니다. 뉴스 목록/상세, Article JSON-LD, SWR 캐시 규칙 데모도 포함.',
        notFound: '해당 뉴스 기사를 찾을 수 없습니다'
      }
    }),
    product: mkProduct({
      auth: {
        header: { signIn: '로그인', signUp: '회원가입', enterWorkspace: '워크스페이스 입장' },
        form: { username: '사용자 이름', password: '비밀번호', confirmPassword: '비밀번호 확인' },
        login: {
          title: '로그인',
          submit: '로그인',
          success: '로그인되었습니다',
          noAccount: '계정이 없으신가요?'
        },
        register: {
          title: '회원가입',
          submit: '가입',
          success: '가입 완료. 로그인해 주세요.',
          hasAccount: '이미 계정이 있으신가요?'
        },
        logout: { submit: '로그아웃', success: '로그아웃되었습니다' },
        account: {
          eyebrow: '보호된 페이지',
          title: '계정',
          lead: '이 페이지는 named auth 미들웨어로 보호되며 현재 사용자 프로필을 표시합니다.',
          avatar: '프로필 사진',
          sessionTitle: '세션',
          profileTitle: '확장 프로필',
          userId: '사용자 ID',
          nickname: '닉네임',
          roles: '역할',
          permissions: '권한',
          none: '없음',
          emptyProfile: '확장 프로필 없음'
        },
        validation: {
          usernameRequired: '사용자 이름을 입력하세요',
          passwordRequired: '비밀번호를 입력하세요',
          confirmPasswordRequired: '비밀번호를 다시 입력하세요',
          passwordMin: '비밀번호는 최소 6자 이상',
          passwordMismatch: '비밀번호가 일치하지 않습니다'
        },
        errors: {
          loginFailed: '로그인 실패. 사용자 이름 또는 비밀번호를 확인하세요.',
          registerFailed: '가입 실패. 나중에 다시 시도하세요.',
          unauthorized: '로그인 정보가 없거나 유효하지 않습니다'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: '콘텐츠 에디터',
        placeholder: '콘텐츠 작성을 시작하세요...',
        metaTitle: '에디터',
        autosave: {
          saving: '저장 중…',
          saved: '자동 저장됨 · {time}',
          failed: '자동 저장 실패, 다음 편집 시 재시도'
        },
        rename: { failed: '이름 변경 실패, 다시 시도하세요' }
      },
      workspace: {
        nav: '워크스페이스',
        title: 'PPT 프로젝트 관리',
        defaultTitle: '제목 없는 프로젝트',
        empty: '프로젝트가 없습니다. 위 버튼으로 생성하세요.',
        projectNotFound: '프로젝트를 찾을 수 없거나 접근이 거부되었습니다',
        create: '새 빈 PPT',
        edit: '편집',
        delete: '삭제',
        deleteCancel: '취소',
        deleteConfirm: '「{title}」을(를) 삭제할까요? 이 작업은 되돌릴 수 없습니다.',
        deleteSuccess: '프로젝트가 삭제되었습니다',
        save: '저장',
        projectName: '프로젝트 이름',
        backToWorkspace: '워크스페이스로',
        browse: '보기',
        share: '공유',
        download: '다운로드',
        more: '더 보기'
      }
    })
  },

  'zh-HK': {
    global: mkGlobal({
      nav: {
        home: '首頁',
        pricing: '價格',
        about: '關於我們',
        help: '幫助',
        news: '新聞',
        primary: '主導航'
      },
      brand: { tagline: '面向公開網站的現代 Nuxt 基礎骨架' },
      seo: {
        defaultDescription: '面向營銷網站、SEO 頁面與輕量 SaaS 前台的 Nuxt 4 可重用 starter。'
      },
      common: {
        switchLanguage: '切換語言',
        switchTheme: '切換主題',
        readMore: '閱讀更多',
        backHome: '返回首頁',
        error: '操作失敗，請稍後重試',
        loadFailed: '載入失敗，請稍後重試',
        retry: '重試'
      },
      productNav: { workspace: '工作台', themeTemplates: '主題模版', pricing: '定價' },
      userMenu: { account: '帳戶', language: '語言', signOut: '登出' },
      accountNav: { settings: '帳戶設定' },
      templates: { empty: '主題模版即將上線，敬請期待。' },
      error: {
        title: '頁面不存在',
        message: '請檢查訪問地址，或返回首頁繼續瀏覽。',
        forbidden: '無權訪問',
        unsupportedLanguage: '不支援的語言'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: '面向公開網站的現代 Nuxt 基礎骨架',
        lead: 'Nuxt Modern Starter 把營銷首頁、登入註冊、多語言內容、SEO 路由和 Docker/Nginx 部署配置整合進同一套清爽起點。無論你是搭建 SaaS 官網、產品前台還是內容型公開站，都可以從這裡快速起步，再按業務逐步替換內容與後端能力。',
        primaryCta: '開始搭建',
        secondaryCta: '查看價格示例',
        preview: { metricLabel: '模板覆蓋', metricValue: '12+ 頁面' },
        stats: {
          pages: { value: '12+', label: '可重用頁面與內容路由' },
          modules: { value: '6', label: '開箱即用的核心工程模組' },
          deploy: { value: '4 種', label: '按路由分層的混合渲染策略' }
        },
        featuresEyebrow: 'Nuxt 4 強力驅動',
        featuresTitle: '把公開網站常見能力一次整理好',
        featuresLead:
          '參考 Nuxt SaaS Template 的資訊層級，用更完整的功能卡片承接首屏，讓頁面從「示例」更像可直接發佈的產品站。',
        features: {
          design: {
            title: '統一設計系統',
            description:
              '基於 Ant Design Vue 和本地主題 token，亮暗色、圓角、陰影和間距可以集中調整。'
          },
          i18n: {
            title: '多語言路由',
            description:
              '內置語言前綴、語言切換和本地化連結，營銷頁與內容頁都能重用同一套路由規則。'
          },
          seo: {
            title: 'SEO 友好頁面',
            description: '首頁、價格頁、幫助中心和新聞詳情都有可擴展的 SEO 入口，適合公開索引。'
          },
          auth: {
            title: '帳戶流程',
            description:
              '登入、註冊和帳戶頁已經串好基礎狀態，為後續接入真實後端和權限控制留好位置。'
          },
          content: {
            title: '內容中心',
            description:
              'FAQ 來自本地 typed config；新聞與定價經 Public API 拉取，後續可統一替換為 CMS 或後台接口。'
          },
          deploy: {
            title: '生產部署',
            description: '預置 Docker、Nginx、SWR routeRules 和安全響應頭，方便從開發走到上線。'
          }
        },
        workflow: {
          eyebrow: '上線所需，一應俱全',
          title: '從模板到上線，路徑更短',
          lead: '保留 starter 的輕量感，同時補齊 SaaS 官網最需要展示的能力、轉化入口和內容結構。',
          steps: {
            routes: '先重用首頁、價格頁、幫助中心和新聞中心組織公開資訊。',
            content: '再替換 i18n 文案與內容數據（定價/新聞已接 API，可按業務改為 CMS）。',
            auth: '最後接入後端帳號體系，把登入態、權限和業務工作台串起來。'
          }
        },
        ctaEyebrow: '準備開始搭建',
        ctaTitle: '用這套 Nuxt 基礎骨架，更快搭出一個像樣的產品前台。'
      },
      about: {
        eyebrow: '關於我們',
        title: '為公開網站與輕量 SaaS 前台而生',
        lead: 'Nuxt Modern Starter 是一套可重用的 Nuxt 4 工程骨架，幫助團隊更快搭建營銷頁、內容中心與可選鑑權的產品前台。',
        mission: {
          title: '我們的目標',
          body: '把公開網站最常見的能力——多語言路由、SEO、內容頁、登入註冊與部署樣例——整理成一套可直接運行、易於擴展的起點，讓團隊把時間花在業務差異上，而不是重複搭基礎設施。'
        },
        values: {
          title: '我們堅持的原則',
          items: {
            focus: '聚焦公開網站場景，保持目錄清晰、邊界明確，避免 starter 過度膨脹。',
            quality:
              '預設啟用 TypeScript 嚴格模式、Lint、測試與部署樣例，讓質量基線從第一天就到位。',
            openness:
              '公開頁與產品區分層設計，本地內容與 API 內容可平滑替換，便於逐步接入真實後端。'
          }
        },
        story: {
          title: '項目背景',
          paragraphs: {
            origin:
              '項目源於團隊在多個 SaaS 官網與產品前台中反覆搭建的共性需求：營銷首頁、定價、幫助、新聞、登入註冊，以及登入後的工作台與編輯器示例。',
            practice:
              'starter 預設以中文為主語言、英文掛載 /en 前綴，公開頁支援 SSR / prerender / SWR 組合策略，產品區則保持語言中性 URL 與 CSR 渲染。',
            next: '如果你正在評估一套 Nuxt 公開網站模板，可以從 README 快速啟動，再按業務替換文案、內容與後端接口。'
          }
        }
      },
      help: {
        eyebrow: '幫助中心',
        title: '快速了解 Nuxt Modern Starter 的使用方式',
        lead: '這裡匯總了項目啟動、多語言擴展、鑑權接入、SEO 配置與部署驗證等常見問題。上手步驟與資源清單來自 i18n，FAQ 來自本地 config，後續可替換為 CMS 或後台接口。',
        faqTitle: '常見問題',
        quickStart: {
          title: '30 分鐘快速上手',
          steps: {
            install: '啟用 Corepack，執行 pnpm install 安裝依賴。',
            dev: '運行 pnpm dev，本地訪問預設中文路由與 /en 英文路由。',
            explore: '從首頁、價格、關於、幫助和新聞頁了解公開網站資訊結構。',
            extend: '按 docs/usage.md 添加頁面、請求、SEO 與可選鑑權模組。'
          }
        },
        resources: {
          title: '推薦閱讀',
          architecture: 'docs/architecture.md — 目錄職責、渲染策略、特性模組與運行時流程',
          usage: 'docs/usage.md — 頁面、請求、SEO、語言、工作台/編輯器/帳戶與鑑權擴展',
          conventions: 'docs/conventions.md — 配置邊界、請求分層與編碼約定',
          deployment: 'docs/deployment.md — 本地、Docker 與 Nginx 部署驗證'
        }
      },
      news: {
        eyebrow: '項目動態',
        title: 'Nuxt Modern Starter 更新與實踐筆記',
        lead: '這裡記錄 starter 的版本發佈、部署實踐與擴展建議，也演示新聞列表、詳情頁 SEO 與 SWR 緩存策略。',
        notFound: '未找到這篇新聞'
      }
    }),
    product: mkProduct({
      auth: {
        header: { signIn: '登入', signUp: '註冊', enterWorkspace: '進入工作台' },
        form: { username: '用戶名', password: '密碼', confirmPassword: '確認密碼' },
        login: { title: '登入', submit: '登入', success: '登入成功', noAccount: '還沒有帳戶？' },
        register: {
          title: '註冊',
          submit: '註冊',
          success: '註冊成功，請繼續登入',
          hasAccount: '已有帳戶？'
        },
        logout: { submit: '登出', success: '已登出' },
        account: {
          eyebrow: '受保護頁面',
          title: '帳戶',
          lead: '此頁面通過命名 auth 中間件保護，展示當前登入用戶和擴展資料。',
          avatar: '頭像',
          sessionTitle: '登入態',
          profileTitle: '擴展資料',
          userId: '用戶 ID',
          nickname: '暱稱',
          roles: '角色',
          permissions: '權限',
          none: '暫無',
          emptyProfile: '暫無擴展資料'
        },
        validation: {
          usernameRequired: '請輸入用戶名',
          passwordRequired: '請輸入密碼',
          confirmPasswordRequired: '請再次輸入密碼',
          passwordMin: '密碼至少需要 6 個字符',
          passwordMismatch: '兩次輸入的密碼不一致'
        },
        errors: {
          loginFailed: '登入失敗，請檢查用戶名或密碼',
          registerFailed: '註冊失敗，請稍後重試',
          unauthorized: '未登入或無效登入憑證'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: '內容編輯器',
        placeholder: '開始撰寫你的內容...',
        metaTitle: '編輯器',
        autosave: {
          saving: '保存中…',
          saved: '已自動保存 · {time}',
          failed: '自動保存失敗，將繼續重試'
        },
        rename: { failed: '重命名失敗，請重試' }
      },
      workspace: {
        nav: '工作台',
        title: '管理你的 PPT 作品',
        defaultTitle: '未命名作品',
        empty: '暫無作品，點擊右上角按鈕創建。',
        projectNotFound: '項目不存在或無權訪問',
        create: '新建空白 PPT',
        edit: '編輯',
        delete: '刪除',
        deleteCancel: '取消',
        deleteConfirm: '確定刪除「{title}」嗎？此操作不可恢復。',
        deleteSuccess: '作品已刪除',
        save: '保存',
        projectName: '作品名稱',
        backToWorkspace: '返回工作台',
        browse: '瀏覽',
        share: '分享',
        download: '下載',
        more: '更多操作'
      }
    })
  }
}
