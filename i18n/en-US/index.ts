export default {
  nav: {
    home: 'Home',
    pricing: 'Pricing',
    help: 'Help',
    news: 'News',
    primary: 'Primary navigation'
  },
  brand: {
    tagline: 'Modern Nuxt starter for public websites'
  },
  seo: {
    defaultDescription:
      'A reusable Nuxt 4 starter for marketing sites, SEO pages, and lightweight SaaS frontends.'
  },
  common: {
    switchLanguage: 'Switch language',
    switchTheme: 'Switch theme',
    readMore: 'Read more',
    backHome: 'Back home',
    error: 'Something went wrong. Please try again.'
  },
  auth: {
    header: {
      signIn: 'Sign in',
      signUp: 'Sign up'
    },
    form: {
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm password'
    },
    login: {
      eyebrow: 'Account sign in',
      title: 'Log in',
      lead: 'Sign in with your application account and return to the redirect target.',
      submit: 'Log in',
      success: 'Logged in successfully',
      noAccount: 'No account yet?'
    },
    register: {
      eyebrow: 'Create account',
      title: 'Register',
      lead: 'Registration only creates the account. The backend does not sign you in automatically.',
      submit: 'Register',
      success: 'Registered successfully. Please log in.',
      hasAccount: 'Already have an account?'
    },
    logout: {
      submit: 'Log out',
      success: 'Logged out'
    },
    account: {
      eyebrow: 'Protected page',
      title: 'Account',
      lead: 'This page is protected by the named auth middleware and shows the current user profile.',
      sessionTitle: 'Session',
      profileTitle: 'Extended profile',
      userId: 'User ID',
      nickname: 'Nickname',
      roles: 'Roles',
      permissions: 'Permissions',
      none: 'None',
      emptyProfile: 'No extended profile yet'
    },
    validation: {
      usernameRequired: 'Please enter a username',
      passwordRequired: 'Please enter a password',
      confirmPasswordRequired: 'Please confirm your password',
      passwordMin: 'Password must be at least 6 characters',
      passwordMismatch: 'The two passwords do not match'
    },
    errors: {
      loginFailed: 'Login failed. Check the username or password.',
      registerFailed: 'Registration failed. Please try again later.',
      unauthorized: 'Missing or invalid login credentials'
    }
  },
  home: {
    eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
    title: 'Modern Nuxt starter for public websites',
    lead: 'Nuxt Modern Starter brings marketing pages, auth flows, multilingual content, SEO routes, and Docker/Nginx deployment defaults into one clean foundation. Use it to launch a SaaS website, product frontend, or content hub, then replace content and backend integrations as your product grows.',
    primaryCta: 'Start building',
    secondaryCta: 'View pricing example',
    preview: {
      metricLabel: 'Template coverage',
      metricValue: '12+ pages'
    },
    stats: {
      pages: {
        value: '12+',
        label: 'Reusable pages and content routes'
      },
      modules: {
        value: '6',
        label: 'Core engineering modules included'
      },
      deploy: {
        value: 'SSR',
        label: 'Server rendering and cache rules by default'
      }
    },
    featuresEyebrow: 'Powered by Nuxt 4',
    featuresTitle: 'The usual public-site building blocks, already organized',
    featuresLead:
      'Inspired by the Nuxt SaaS Template hierarchy, the homepage now gives the hero section a stronger follow-through with product-ready feature cards.',
    features: {
      design: {
        title: 'Unified design system',
        description:
          'Built on Ant Design Vue and local theme tokens so color mode, radius, shadows, and spacing stay consistent.'
      },
      i18n: {
        title: 'Localized routing',
        description:
          'Language prefixes, switching, and localized links are ready for marketing pages and content routes.'
      },
      seo: {
        title: 'SEO-friendly pages',
        description:
          'Home, pricing, help, and article pages all have extensible SEO entry points for public indexing.'
      },
      auth: {
        title: 'Account flows',
        description:
          'Login, registration, and account pages are wired to basic state and ready for a real backend.'
      },
      content: {
        title: 'Content hub',
        description:
          'FAQ and news entries come from typed local data and can later move to a CMS or API.'
      },
      deploy: {
        title: 'Production deployment',
        description:
          'Docker, Nginx, SWR route rules, and security headers are already part of the starter.'
      }
    },
    workflow: {
      eyebrow: 'Everything you need to ship',
      title: 'A shorter path from starter to launch',
      lead: 'It keeps the starter lightweight while adding the capability, conversion, and content structure a SaaS frontend needs.',
      steps: {
        routes: 'Reuse home, pricing, help, and news pages to organize public information first.',
        content:
          'Replace local content with product proof points, FAQs, announcements, and customer stories.',
        auth: 'Connect your backend account system when you are ready to wire sessions, roles, and the product app.'
      }
    },
    ctaEyebrow: 'Ready to build',
    ctaTitle: 'Use this Nuxt foundation to launch a polished product frontend faster.'
  },
  pricing: {
    eyebrow: 'Usage plans',
    title: 'Choose the right starting point for your team',
    lead: 'These plans show recommended ways to adopt Nuxt Modern Starter. Starter fits personal validation, Growth covers the full engineering loop, and Custom is for teams that need deeper customization.',
    note: 'Prices are example structure only. Replace them with your real plans, benefits, and conversion CTAs in production.',
    plans: {
      starter: {
        name: 'Starter',
        badge: 'Personal',
        price: 'Free',
        period: 'Open-source template',
        description:
          'Best for learning, proof of concept, or quickly scaffolding a public marketing site.',
        cta: 'Get started',
        features: {
          nuxt: 'Nuxt 4 + TypeScript + Pinia foundation',
          pages: 'Home, pricing, help, news, and other public pages',
          i18n: 'Chinese and English routes with language switching',
          seo: 'Canonical, hreflang, and OG metadata'
        }
      },
      growth: {
        name: 'Growth',
        badge: 'Recommended',
        price: 'Recommended',
        period: 'Full starter stack',
        description:
          'Best for small teams that need auth, request helpers, deployment validation, and quality gates.',
        cta: 'View capability list',
        features: {
          api: 'Scenario-specific API clients and Bearer Token auth',
          auth: 'Login, register, account, and route guard examples',
          deploy: 'Docker image and Nginx reverse-proxy samples',
          quality: 'Lint, Stylelint, Typecheck, and Vitest coverage'
        }
      },
      custom: {
        name: 'Custom',
        badge: 'Enterprise',
        price: 'Talk to us',
        period: 'Tailored extension',
        description:
          'Best for enterprise projects that need brand theming, CMS integration, or multi-region deployment.',
        cta: 'Discuss requirements',
        features: {
          theme: 'Design tokens and Ant Design Vue theme customization',
          content: 'Move FAQ and news content to a CMS or API',
          docs: 'Architecture, usage, and deployment documentation',
          support: 'Optional E2E, CI, and ops integration support'
        }
      }
    },
    includes: {
      eyebrow: 'Included in every plan',
      title: 'A reusable public-site foundation',
      items: {
        stack: 'Nuxt 4, Vue 3, SCSS design tokens, and Ant Design Vue components',
        routing: 'Default locale without prefix, English under /en, and shared localePath helpers',
        content: 'Typed local FAQ and news data that can later be replaced by a CMS',
        editor: 'Built-in Yaniv Editor sample page for rich text or docs scenarios'
      }
    }
  },
  editor: {
    eyebrow: 'Yaniv Editor',
    title: 'Content editor',
    placeholder: 'Start writing your content...',
    metaTitle: 'Editor',
    autosave: {
      saving: 'Saving…',
      saved: 'Auto-saved · {time}',
      failed: 'Auto-save failed, will retry on next edit'
    }
  },
  workspace: {
    nav: 'Workspace',
    eyebrow: 'Product workspace',
    title: 'Manage your PPT projects',
    lead: 'Manage authenticated PPT projects here. Create a project and edit or save document content.',
    empty: 'No projects yet. Create a blank PPT to get started.',
    projectNotFound: 'Project not found or access denied',
    create: 'New project',
    search: 'Search projects',
    edit: 'Edit',
    delete: 'Delete',
    deleteCancel: 'Cancel',
    deleteConfirm: 'Delete "{title}"? This action cannot be undone.',
    deleteSuccess: 'Project deleted',
    save: 'Save',
    slides: 'slides',
    slide: 'Slide',
    properties: 'Properties',
    projectName: 'Project name',
    slideCount: 'Slide count',
    backToWorkspace: 'Back to workspace',
    filters: {
      all: 'All',
      recent: 'Recent',
      shared: 'Shared'
    },
    status: {
      draft: 'Draft',
      ready: 'Ready',
      shared: 'Shared'
    },
    actions: {
      ai: {
        title: 'AI PPT',
        description: 'Generate a deck from one sentence or outline'
      },
      import: {
        title: 'Import document',
        description: 'Upload a document and create a deck structure'
      },
      blank: {
        title: 'Blank PPT',
        description: 'Start from an empty canvas'
      }
    }
  },
  help: {
    eyebrow: 'Help center',
    title: 'Learn how to use Nuxt Modern Starter',
    lead: 'This page collects common questions about project setup, i18n, auth, SEO, and deployment. Content comes from typed local data and can later move to a CMS or backend API.',
    faqTitle: 'FAQ',
    quickStart: {
      title: 'Get running in 30 minutes',
      steps: {
        install: 'Enable Corepack, then run pnpm install.',
        dev: 'Run pnpm dev and browse default Chinese routes plus /en English routes.',
        explore:
          'Review home, pricing, help, and news pages to understand the public-site structure.',
        extend: 'Follow docs/usage.md to add pages, requests, SEO, and optional auth.'
      }
    },
    resources: {
      title: 'Recommended reading',
      architecture:
        'docs/architecture.md — directory responsibilities, rendering strategy, and runtime flow',
      usage: 'docs/usage.md — pages, requests, SEO, languages, product flows, and auth',
      conventions:
        'docs/conventions.md — config boundaries, request layering, and coding conventions',
      deployment: 'docs/deployment.md — local, Docker, and Nginx deployment validation'
    }
  },
  news: {
    eyebrow: 'Project updates',
    title: 'Nuxt Modern Starter releases and notes',
    lead: 'Track starter releases, deployment practices, and extension guidance. These pages also demonstrate news layouts, Article JSON-LD, and SWR cache rules.',
    notFound: 'This news article was not found'
  },
  error: {
    title: 'Page not found',
    message: 'Check the address or return home to keep browsing.',
    forbidden: 'Access denied',
    unsupportedLanguage: 'Unsupported language'
  }
}
