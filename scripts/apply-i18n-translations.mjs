#!/usr/bin/env node
/**
 * One-shot script: apply complete locale translations to i18n locale module JSON files.
 * Source structure: en-US. Run: node scripts/apply-i18n-translations.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const i18nRoot = path.join(rootDir, 'i18n')
const sourceLocale = 'en-US'
const targetLocales = [
  'de-DE',
  'es-ES',
  'fr-FR',
  'id-ID',
  'ja-JP',
  'ko-KR',
  'ms-MY',
  'ph-PH',
  'pt-BR',
  'pt-PT',
  'ru-RU',
  'th-TH',
  'zh-HK'
]

const modules = ['global', 'marketing', 'product']

/** @type {Record<string, Record<string, Record<string, unknown>>>} */
const localeModules = {
  'de-DE': {
    global: {
      nav: {
        home: 'Startseite',
        pricing: 'Preise',
        about: 'Über uns',
        help: 'Hilfe',
        news: 'Neuigkeiten',
        primary: 'Hauptnavigation'
      },
      brand: { tagline: 'Moderner Nuxt-Starter für öffentliche Websites' },
      seo: {
        defaultDescription:
          'Ein wiederverwendbarer Nuxt-4-Starter für Marketing-Sites, SEO-Seiten und leichte SaaS-Frontends.'
      },
      common: {
        switchLanguage: 'Sprache wechseln',
        switchTheme: 'Design wechseln',
        readMore: 'Mehr lesen',
        backHome: 'Zur Startseite',
        error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
        loadFailed: 'Daten konnten nicht geladen werden. Bitte versuchen Sie es erneut.',
        retry: 'Erneut versuchen'
      },
      productNav: {
        workspace: 'Arbeitsbereich',
        themeTemplates: 'Design-Vorlagen',
        pricing: 'Preise'
      },
      userMenu: { account: 'Konto', language: 'Sprache', signOut: 'Abmelden' },
      accountNav: { settings: 'Kontoeinstellungen' },
      templates: { empty: 'Design-Vorlagen folgen in Kürze.' },
      error: {
        title: 'Seite nicht gefunden',
        message: 'Überprüfen Sie die Adresse oder kehren Sie zur Startseite zurück.',
        forbidden: 'Zugriff verweigert',
        unsupportedLanguage: 'Nicht unterstützte Sprache'
      }
    },
    marketing: {
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: 'Moderner Nuxt-Starter für öffentliche Websites',
        lead: 'Nuxt Modern Starter vereint Marketing-Seiten, Auth-Flows, mehrsprachige Inhalte, SEO-Routen und Docker/Nginx-Deployment-Standards in einer klaren Grundlage. Starten Sie damit eine SaaS-Website, ein Produkt-Frontend oder ein Content-Hub und ersetzen Sie Inhalte sowie Backend-Integrationen, wenn Ihr Produkt wächst.',
        primaryCta: 'Jetzt starten',
        secondaryCta: 'Preisbeispiel ansehen',
        preview: { metricLabel: 'Vorlagenabdeckung', metricValue: '12+ Seiten' },
        stats: {
          pages: { value: '12+', label: 'Wiederverwendbare Seiten und Content-Routen' },
          modules: { value: '6', label: 'Enthaltene Kern-Engineering-Module' },
          deploy: { value: '4', label: 'Hybride Rendering-Strategien nach Route' }
        },
        featuresEyebrow: 'Angetrieben von Nuxt 4',
        featuresTitle: 'Die üblichen Bausteine für öffentliche Sites – bereits organisiert',
        featuresLead:
          'Inspiriert von der Nuxt SaaS Template-Hierarchie bietet die Startseite stärkere Feature-Karten für ein produktionsreifes Erscheinungsbild.',
        features: {
          design: {
            title: 'Einheitliches Designsystem',
            description:
              'Auf Ant Design Vue und lokalen Theme-Tokens aufgebaut – Farbmodus, Radius, Schatten und Abstände bleiben konsistent.'
          },
          i18n: {
            title: 'Lokalisierte Routen',
            description:
              'Sprachpräfixe, Umschaltung und lokalisierte Links sind für Marketing- und Content-Seiten bereit.'
          },
          seo: {
            title: 'SEO-freundliche Seiten',
            description:
              'Start-, Preis-, Hilfe- und Artikelseiten haben erweiterbare SEO-Einstiegspunkte für die öffentliche Indexierung.'
          },
          auth: {
            title: 'Kontoflows',
            description:
              'Login, Registrierung und Kontoseiten sind an den Basiszustand angebunden und bereit für ein echtes Backend.'
          },
          content: {
            title: 'Content-Hub',
            description:
              'FAQ stammt aus lokaler Typed Config; News und Preise laden über die Public API und können später zu CMS oder Backend wechseln.'
          },
          deploy: {
            title: 'Produktions-Deployment',
            description:
              'Docker, Nginx, SWR-Route-Regeln und Security-Header sind bereits im Starter enthalten.'
          }
        },
        workflow: {
          eyebrow: 'Alles, was Sie zum Launch brauchen',
          title: 'Ein kürzerer Weg vom Starter zum Go-live',
          lead: 'Er bleibt leichtgewichtig und ergänzt die Fähigkeiten, Conversion und Content-Struktur, die ein SaaS-Frontend braucht.',
          steps: {
            routes:
              'Nutzen Sie zuerst Start-, Preis-, Hilfe- und News-Seiten, um öffentliche Informationen zu strukturieren.',
            content:
              'Ersetzen Sie als Nächstes i18n-Texte und Content-Quellen (Preise/News nutzen bereits die API und können zu einem CMS wechseln).',
            auth: 'Verbinden Sie Ihr Backend-Kontosystem, wenn Sie Sessions, Rollen und die Produkt-App anbinden möchten.'
          }
        },
        ctaEyebrow: 'Bereit zum Bauen',
        ctaTitle:
          'Nutzen Sie dieses Nuxt-Fundament, um schneller ein ausgereiftes Produkt-Frontend zu starten.'
      },
      about: {
        eyebrow: 'Über uns',
        title: 'Für öffentliche Sites und leichte SaaS-Frontends',
        lead: 'Nuxt Modern Starter ist eine wiederverwendbare Nuxt-4-Grundlage für Marketing-Seiten, Content-Hubs und optionale auth-fähige Produktflächen.',
        mission: {
          title: 'Unsere Mission',
          body: 'Wir bündeln die häufigsten Fähigkeiten öffentlicher Sites – i18n-Routing, SEO, Content-Seiten, Auth-Beispiele und Deployment-Muster – in einem lauffähigen Startpunkt, damit Teams sich auf Produktunterschiede statt Infrastruktur konzentrieren.'
        },
        values: {
          title: 'Worauf wir optimieren',
          items: {
            focus:
              'Fokus auf öffentliche Sites mit klaren Modulgrenzen statt eines überdimensionierten Starters.',
            quality:
              'Von Tag eins mit TypeScript Strict Mode, Linting, Tests und Deployment-Beispielen.',
            openness:
              'Öffentliche und Produkt-Schichten getrennt halten, damit lokale und API-gesteuerte Inhalte schrittweise ersetzt werden können.'
          }
        },
        story: {
          title: 'Projekthintergrund',
          paragraphs: {
            origin:
              'Der Starter entstand aus wiederkehrenden Anforderungen bei SaaS-Websites und Produkt-Frontends: Marketing-Startseite, Preise, Hilfe, News, An-/Abmeldung sowie angemeldeter Arbeitsbereich und Editor-Beispiele.',
            practice:
              'Standardmäßig Chinesisch als Hauptsprache mit Englisch unter /en, Mischung aus SSR/Prerender/SWR für öffentliche Seiten und sprachneutrale Produkt-Routen mit CSR.',
            next: 'Wenn Sie eine Nuxt-Vorlage für öffentliche Sites evaluieren, starten Sie mit dem README Quick Start und ersetzen Sie Texte, Inhalte und Backend-Integrationen für Ihr Produkt.'
          }
        }
      },
      help: {
        eyebrow: 'Hilfezentrum',
        title: 'So nutzen Sie Nuxt Modern Starter',
        lead: 'Diese Seite sammelt häufige Fragen zu Setup, i18n, Auth, SEO und Deployment. Quick-Start-Schritte und Ressourcenlisten stammen aus i18n; FAQ aus lokaler Config und kann später zu CMS oder Backend-API wechseln.',
        faqTitle: 'FAQ',
        quickStart: {
          title: 'In 30 Minuten loslegen',
          steps: {
            install: 'Corepack aktivieren, dann pnpm install ausführen.',
            dev: 'pnpm dev starten und Standard-Chinesisch sowie /en-Englisch-Routen durchsuchen.',
            explore:
              'Start-, Preis-, Über-, Hilfe- und News-Seiten ansehen, um die Struktur der öffentlichen Site zu verstehen.',
            extend:
              'docs/usage.md folgen, um Seiten, Requests, SEO und optionale Auth hinzuzufügen.'
          }
        },
        resources: {
          title: 'Empfohlene Lektüre',
          architecture:
            'docs/architecture.md — Verzeichnisverantwortung, Rendering-Strategie, Feature-Module und Laufzeitfluss',
          usage:
            'docs/usage.md — Seiten, Requests, SEO, Sprachen, Arbeitsbereich/Editor/Konto und Auth',
          conventions:
            'docs/conventions.md — Config-Grenzen, Request-Schichtung und Coding-Konventionen',
          deployment: 'docs/deployment.md — Validierung für lokales, Docker- und Nginx-Deployment'
        }
      },
      news: {
        eyebrow: 'Projekt-Updates',
        title: 'Nuxt Modern Starter Releases und Notizen',
        lead: 'Verfolgen Sie Starter-Releases, Deployment-Praxis und Erweiterungshinweise. Diese Seiten demonstrieren auch News-Listen/Details, Article JSON-LD und SWR-Cache-Regeln.',
        notFound: 'Dieser News-Artikel wurde nicht gefunden'
      }
    },
    product: {
      auth: {
        header: {
          signIn: 'Anmelden',
          signUp: 'Registrieren',
          enterWorkspace: 'Arbeitsbereich öffnen'
        },
        form: {
          username: 'Benutzername',
          password: 'Passwort',
          confirmPassword: 'Passwort bestätigen'
        },
        login: {
          title: 'Anmelden',
          submit: 'Anmelden',
          success: 'Erfolgreich angemeldet',
          noAccount: 'Noch kein Konto?'
        },
        register: {
          title: 'Registrieren',
          submit: 'Registrieren',
          success: 'Registrierung erfolgreich. Bitte melden Sie sich an.',
          hasAccount: 'Bereits ein Konto?'
        },
        logout: { submit: 'Abmelden', success: 'Abgemeldet' },
        account: {
          eyebrow: 'Geschützte Seite',
          title: 'Konto',
          lead: 'Diese Seite ist durch die benannte Auth-Middleware geschützt und zeigt das aktuelle Benutzerprofil.',
          avatar: 'Profilfoto',
          sessionTitle: 'Sitzung',
          profileTitle: 'Erweitertes Profil',
          userId: 'Benutzer-ID',
          nickname: 'Spitzname',
          roles: 'Rollen',
          permissions: 'Berechtigungen',
          none: 'Keine',
          emptyProfile: 'Noch kein erweitertes Profil'
        },
        validation: {
          usernameRequired: 'Bitte Benutzername eingeben',
          passwordRequired: 'Bitte Passwort eingeben',
          confirmPasswordRequired: 'Bitte Passwort bestätigen',
          passwordMin: 'Passwort muss mindestens 6 Zeichen haben',
          passwordMismatch: 'Die beiden Passwörter stimmen nicht überein'
        },
        errors: {
          loginFailed: 'Anmeldung fehlgeschlagen. Benutzername oder Passwort prüfen.',
          registerFailed: 'Registrierung fehlgeschlagen. Bitte später erneut versuchen.',
          unauthorized: 'Fehlende oder ungültige Anmeldedaten'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'Content-Editor',
        placeholder: 'Beginnen Sie mit dem Schreiben...',
        metaTitle: 'Editor',
        autosave: {
          saving: 'Speichern…',
          saved: 'Automatisch gespeichert · {time}',
          failed: 'Automatisches Speichern fehlgeschlagen, erneuter Versuch beim nächsten Edit'
        },
        rename: { failed: 'Umbenennen fehlgeschlagen, bitte erneut versuchen' }
      },
      workspace: {
        nav: 'Arbeitsbereich',
        title: 'Verwalten Sie Ihre PPT-Projekte',
        defaultTitle: 'Unbenanntes Projekt',
        empty: 'Noch keine Projekte. Nutzen Sie die Schaltfläche oben, um eines zu erstellen.',
        projectNotFound: 'Projekt nicht gefunden oder Zugriff verweigert',
        create: 'Neues leeres PPT',
        edit: 'Bearbeiten',
        delete: 'Löschen',
        deleteCancel: 'Abbrechen',
        deleteConfirm: '„{title}“ löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        deleteSuccess: 'Projekt gelöscht',
        save: 'Speichern',
        projectName: 'Projektname',
        backToWorkspace: 'Zurück zum Arbeitsbereich',
        browse: 'Ansehen',
        share: 'Teilen',
        download: 'Herunterladen',
        more: 'Weitere Aktionen'
      }
    }
  }
}

// Import remaining locales from separate data files to keep this script maintainable
const { LOCALE_MODULES_REST } = await import('./i18n-translations-data.mjs')
const { LOCALE_MODULES_REST_PART2 } = await import('./i18n-translations-data-part2.mjs')
const { LOCALE_MODULES_REST_PART3 } = await import('./i18n-translations-data-part3.mjs')
const { LOCALE_MODULES_REST_PART4 } = await import('./i18n-translations-data-part4.mjs')
Object.assign(
  localeModules,
  LOCALE_MODULES_REST,
  LOCALE_MODULES_REST_PART2,
  LOCALE_MODULES_REST_PART3,
  LOCALE_MODULES_REST_PART4
)

const writeModule = (locale, moduleName, data) => {
  const targetPath = path.join(i18nRoot, locale, 'modules', `${moduleName}.json`)
  fs.writeFileSync(targetPath, `${JSON.stringify(data, null, 2)}\n`)
}

for (const locale of targetLocales) {
  if (!localeModules[locale]) {
    console.error(`Missing translations for ${locale}`)
    process.exit(1)
  }
  for (const moduleName of modules) {
    if (!localeModules[locale][moduleName]) {
      console.error(`Missing ${locale}/${moduleName}`)
      process.exit(1)
    }
    writeModule(locale, moduleName, localeModules[locale][moduleName])
    console.log(`wrote i18n/${locale}/modules/${moduleName}.json`)
  }
}

console.log(`Applied translations for ${targetLocales.length} locales (source: ${sourceLocale})`)
