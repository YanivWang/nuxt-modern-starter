export default {
  nav: {
    home: 'Home',
    pricing: 'Pricing',
    help: 'Help',
    news: 'News'
  },
  common: {
    switchLanguage: 'Switch language',
    switchTheme: 'Switch theme',
    readMore: 'Read more',
    backHome: 'Back home'
  },
  auth: {
    form: {
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm password'
    },
    login: {
      eyebrow: 'Account sign in',
      title: 'Log in',
      lead: 'Sign in with an express-modern-starter account and return to the redirect target.',
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
    lead: 'A reusable foundation for marketing pages, multilingual content, SEO surfaces, and lightweight SaaS frontends.',
    primaryCta: 'Start building',
    secondaryCta: 'View pricing example',
    matrixTitle: 'Core capability matrix',
    solutionTitle: 'Solution-ready sections',
    customerTitle: 'Customer story structure'
  },
  pricing: {
    title: 'Present service packages with a clean pricing structure',
    lead: 'The pricing example shows recommended structure for plans, benefits, CTAs, and SEO metadata.'
  },
  help: {
    title: 'Build an SSR-friendly help center',
    lead: 'FAQ data comes from typed local content and can later be replaced by a CMS or API.'
  },
  news: {
    title: 'News and content hub',
    lead: 'News pages demonstrate content layouts, Article JSON-LD, and SWR route rules.',
    notFound: 'This news article was not found'
  },
  error: {
    title: 'Page not found',
    message: 'Check the address or return home to keep browsing.'
  }
}
