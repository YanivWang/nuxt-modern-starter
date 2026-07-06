export default {
  nav: {
    home: 'Home',
    pricing: 'Pricing',
    about: 'About',
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
    error: 'Something went wrong. Please try again.',
    loadFailed: 'Failed to load data. Please try again.',
    retry: 'Retry'
  },
  productNav: {
    workspace: 'Workspace',
    themeTemplates: 'Theme templates',
    pricing: 'Pricing'
  },
  userMenu: {
    account: 'Account',
    language: 'Language',
    signOut: 'Sign out'
  },
  accountNav: {
    settings: 'Account settings'
  },
  templates: {
    empty: 'Theme templates are coming soon.'
  },
  auth: {
    header: {
      signIn: 'Sign in',
      signUp: 'Sign up',
      enterWorkspace: 'Enter workspace'
    },
    form: {
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm password'
    },
    login: {
      title: 'Log in',
      submit: 'Log in',
      success: 'Logged in successfully',
      noAccount: 'No account yet?'
    },
    register: {
      title: 'Register',
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
      avatar: 'Profile photo',
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
  editor: {
    eyebrow: 'Yaniv Editor',
    title: 'Content editor',
    placeholder: 'Start writing your content...',
    metaTitle: 'Editor',
    autosave: {
      saving: 'Saving…',
      saved: 'Auto-saved · {time}',
      failed: 'Auto-save failed, will retry on next edit'
    },
    rename: {
      failed: 'Failed to rename, please try again'
    }
  },
  workspace: {
    nav: 'Workspace',
    title: 'Manage your PPT projects',
    defaultTitle: 'Untitled project',
    empty: 'No projects yet. Use the button above to create one.',
    projectNotFound: 'Project not found or access denied',
    create: 'New blank PPT',
    edit: 'Edit',
    delete: 'Delete',
    deleteCancel: 'Cancel',
    deleteConfirm: 'Delete "{title}"? This action cannot be undone.',
    deleteSuccess: 'Project deleted',
    save: 'Save',
    projectName: 'Project name',
    backToWorkspace: 'Back to workspace',
    browse: 'View',
    share: 'Share',
    download: 'Download',
    more: 'More actions'
  },
  about: {
    eyebrow: 'About us',
    title: 'Built for public sites and lightweight SaaS frontends',
    lead: 'Nuxt Modern Starter is a reusable Nuxt 4 foundation for marketing pages, content hubs, and optional auth-ready product surfaces.',
    mission: {
      title: 'Our mission',
      body: 'We organize the most common public-site capabilities—i18n routing, SEO, content pages, auth samples, and deployment patterns—into a runnable starting point so teams can focus on product differences instead of rebuilding infrastructure.'
    },
    values: {
      title: 'What we optimize for',
      items: {
        focus:
          'Stay focused on public-site scenarios with clear module boundaries instead of an oversized starter.',
        quality:
          'Ship with TypeScript strict mode, linting, tests, and deployment samples from day one.',
        openness:
          'Keep public and product layers separate so local content and API-driven content can be swapped in gradually.'
      }
    },
    story: {
      title: 'Project background',
      paragraphs: {
        origin:
          'The starter comes from repeated needs across SaaS websites and product frontends: marketing home, pricing, help, news, sign-in/sign-up, plus logged-in workspace and editor examples.',
        practice:
          'It defaults to Chinese as the primary locale with English under /en, mixes SSR/prerender/SWR for public pages, and keeps product routes language-neutral with CSR rendering.',
        next: 'If you are evaluating a Nuxt public-site template, start with the README quick start, then replace copy, content, and backend integrations for your product.'
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
          'Review home, pricing, about, help, and news pages to understand the public-site structure.',
        extend: 'Follow docs/usage.md to add pages, requests, SEO, and optional auth.'
      }
    },
    resources: {
      title: 'Recommended reading',
      architecture:
        'docs/architecture.md — directory responsibilities, rendering strategy, feature modules, and runtime flow',
      usage:
        'docs/usage.md — pages, requests, SEO, languages, workspace/editor/account flows, and auth',
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
