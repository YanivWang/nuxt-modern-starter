const mkGlobal = (g) => g
const mkMarketing = (m) => m
const mkProduct = (p) => p

export const LOCALE_MODULES_REST_PART3 = {
  'ph-PH': {
    global: mkGlobal({
      nav: {
        home: 'Home',
        pricing: 'Presyo',
        about: 'Tungkol sa amin',
        help: 'Tulong',
        news: 'Balita',
        primary: 'Pangunahing navigation'
      },
      brand: { tagline: 'Modernong Nuxt starter para sa pampublikong website' },
      seo: {
        defaultDescription:
          'Isang reusable na Nuxt 4 starter para sa marketing site, SEO page, at lightweight SaaS frontend.'
      },
      common: {
        switchLanguage: 'Palitan ang wika',
        switchTheme: 'Palitan ang tema',
        readMore: 'Magbasa pa',
        backHome: 'Bumalik sa home',
        error: 'May naganap na error. Pakisubukang muli.',
        loadFailed: 'Hindi ma-load ang data. Pakisubukang muli.',
        retry: 'Subukang muli'
      },
      productNav: {
        workspace: 'Workspace',
        themeTemplates: 'Mga theme template',
        pricing: 'Presyo'
      },
      userMenu: { account: 'Account', language: 'Wika', signOut: 'Mag-sign out' },
      accountNav: { settings: 'Mga setting ng account' },
      templates: { empty: 'Malapit nang dumating ang mga theme template.' },
      error: {
        title: 'Hindi mahanap ang page',
        message: 'Suriin ang address o bumalik sa home para magpatuloy.',
        forbidden: 'Tinanggihan ang access',
        unsupportedLanguage: 'Hindi suportadong wika'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: 'Modernong Nuxt starter para sa pampublikong website',
        lead: 'Pinagsasama ng Nuxt Modern Starter ang marketing page, auth flow, multilingual content, SEO route, at Docker/Nginx deployment default sa isang malinis na pundasyon. Gamitin ito para mag-launch ng SaaS website, product frontend, o content hub, at palitan ang content at backend integration habang lumalaki ang produkto.',
        primaryCta: 'Magsimulang magtayo',
        secondaryCta: 'Tingnan ang halimbawa ng presyo',
        preview: { metricLabel: 'Saklaw ng template', metricValue: '12+ page' },
        stats: {
          pages: { value: '12+', label: 'Reusable na page at content route' },
          modules: { value: '6', label: 'Kasamang core engineering module' },
          deploy: { value: '4', label: 'Hybrid rendering strategy ayon sa route' }
        },
        featuresEyebrow: 'Pinapagana ng Nuxt 4',
        featuresTitle: 'Karaniwang building block ng public site, nakaayos na',
        featuresLead:
          'Inspired sa hierarchy ng Nuxt SaaS Template, mas malakas ang follow-through ng homepage gamit ang product-ready feature card.',
        features: {
          design: {
            title: 'Unified design system',
            description:
              'Built sa Ant Design Vue at local theme token para consistent ang color mode, radius, shadow, at spacing.'
          },
          i18n: {
            title: 'Localized routing',
            description:
              'Handa na ang language prefix, switching, at localized link para sa marketing at content page.'
          },
          seo: {
            title: 'SEO-friendly page',
            description:
              'May extensible SEO entry point ang home, pricing, help, at article para sa public indexing.'
          },
          auth: {
            title: 'Account flow',
            description:
              'Naka-wire na ang login, registration, at account page sa basic state at handa na para sa tunay na backend.'
          },
          content: {
            title: 'Content hub',
            description:
              'Galing sa typed local config ang FAQ; ang news at pricing ay sa Public API at puwedeng ilipat sa CMS o backend.'
          },
          deploy: {
            title: 'Production deployment',
            description:
              'Kasama na sa starter ang Docker, Nginx, SWR route rule, at security header.'
          }
        },
        workflow: {
          eyebrow: 'Lahat ng kailangan para mag-ship',
          title: 'Mas maikling daan mula starter hanggang launch',
          lead: 'Nanatiling lightweight habang dinadagdagan ang kakayahan, conversion, at content structure na kailangan ng SaaS frontend.',
          steps: {
            routes:
              'Gamitin muna ang home, pricing, help, at news page para ayusin ang public information.',
            content:
              'Palitan ang i18n copy at content source (pricing/news ay API na at puwedeng ilipat sa CMS).',
            auth: 'Ikonekta ang backend account system kapag handa nang i-wire ang session, role, at product app.'
          }
        },
        ctaEyebrow: 'Handa nang magtayo',
        ctaTitle:
          'Gamitin ang Nuxt foundation na ito para mas mabilis mag-launch ng polished product frontend.'
      },
      about: {
        eyebrow: 'Tungkol sa amin',
        title: 'Ginawa para sa public site at lightweight SaaS frontend',
        lead: 'Ang Nuxt Modern Starter ay reusable na Nuxt 4 foundation para sa marketing page, content hub, at optional auth-ready product surface.',
        mission: {
          title: 'Ang aming misyon',
          body: 'Inaayos namin ang pinakakaraniwang kakayahan ng public site—i18n routing, SEO, content page, auth sample, at deployment pattern—sa isang runnable starting point para makapag-focus ang team sa product difference.'
        },
        values: {
          title: 'Ang aming prayoridad',
          items: {
            focus:
              'Nakatuon sa public-site scenario na may malinaw na module boundary, hindi oversized starter.',
            quality: 'May TypeScript strict mode, lint, test, at deployment sample mula day one.',
            openness:
              'Hiwalay ang public at product layer para unti-unting mapalitan ang local at API-driven content.'
          }
        },
        story: {
          title: 'Background ng proyekto',
          paragraphs: {
            origin:
              'Nagmula ang starter sa paulit-ulit na pangangailangan sa SaaS website at product frontend: marketing home, pricing, help, news, sign-in/sign-up, at logged-in workspace at editor example.',
            practice:
              'Default na Chinese ang primary locale na may English sa /en, pinagsasama ang SSR/prerender/SWR para sa public page, at language-neutral ang product route na may CSR.',
            next: 'Kung nag-e-evaluate ka ng Nuxt public-site template, magsimula sa README quick start at palitan ang copy, content, at backend integration.'
          }
        }
      },
      help: {
        eyebrow: 'Help center',
        title: 'Alamin kung paano gamitin ang Nuxt Modern Starter',
        lead: 'Kinokolekta ng page na ito ang common question tungkol sa project setup, i18n, auth, SEO, at deployment. Galing sa i18n ang quick-start step at resource list; galing sa local config ang FAQ at puwedeng ilipat sa CMS o backend API.',
        faqTitle: 'FAQ',
        quickStart: {
          title: 'Makakagana sa 30 minuto',
          steps: {
            install: 'I-enable ang Corepack, pagkatapos ay pnpm install.',
            dev: 'Patakbuhin ang pnpm dev at i-browse ang default Chinese route at /en English route.',
            explore:
              'Suriin ang home, pricing, about, help, at news page para maintindihan ang public-site structure.',
            extend:
              'Sundin ang docs/usage.md para magdagdag ng page, request, SEO, at optional auth.'
          }
        },
        resources: {
          title: 'Inirerekomendang basahin',
          architecture:
            'docs/architecture.md — directory responsibility, rendering strategy, feature module, at runtime flow',
          usage:
            'docs/usage.md — page, request, SEO, language, workspace/editor/account flow, at auth',
          conventions:
            'docs/conventions.md — config boundary, request layering, at coding convention',
          deployment: 'docs/deployment.md — local, Docker, at Nginx deployment validation'
        }
      },
      news: {
        eyebrow: 'Project update',
        title: 'Nuxt Modern Starter release at note',
        lead: 'Subaybayan ang starter release, deployment practice, at extension guidance. Ipinapakita rin ng page na ito ang news list/detail, Article JSON-LD, at SWR cache rule.',
        notFound: 'Hindi mahanap ang artikulong ito'
      }
    }),
    product: mkProduct({
      auth: {
        header: {
          signIn: 'Mag-sign in',
          signUp: 'Mag-sign up',
          enterWorkspace: 'Pumasok sa workspace'
        },
        form: {
          username: 'Username',
          password: 'Password',
          confirmPassword: 'Kumpirmahin ang password'
        },
        login: {
          title: 'Mag-log in',
          submit: 'Mag-log in',
          success: 'Matagumpay na naka-log in',
          noAccount: 'Wala pang account?'
        },
        register: {
          title: 'Mag-register',
          submit: 'Mag-register',
          success: 'Matagumpay na nag-register. Mag-log in na.',
          hasAccount: 'May account na?'
        },
        logout: { submit: 'Mag-log out', success: 'Naka-log out na' },
        account: {
          eyebrow: 'Protected page',
          title: 'Account',
          lead: 'Protektado ng named auth middleware ang page na ito at ipinapakita ang kasalukuyang user profile.',
          avatar: 'Profile photo',
          sessionTitle: 'Session',
          profileTitle: 'Extended profile',
          userId: 'User ID',
          nickname: 'Nickname',
          roles: 'Role',
          permissions: 'Permission',
          none: 'Wala',
          emptyProfile: 'Wala pang extended profile'
        },
        validation: {
          usernameRequired: 'Maglagay ng username',
          passwordRequired: 'Maglagay ng password',
          confirmPasswordRequired: 'Kumpirmahin ang password',
          passwordMin: 'Dapat hindi bababa sa 6 character ang password',
          passwordMismatch: 'Hindi magkatugma ang dalawang password'
        },
        errors: {
          loginFailed: 'Hindi makapag-log in. Suriin ang username o password.',
          registerFailed: 'Hindi makapag-register. Subukang muli mamaya.',
          unauthorized: 'Walang o invalid na login credential'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'Content editor',
        placeholder: 'Simulang magsulat ng content...',
        metaTitle: 'Editor',
        autosave: {
          saving: 'Sine-save…',
          saved: 'Auto-saved · {time}',
          failed: 'Hindi na-auto-save, susubukang muli sa susunod na edit'
        },
        rename: { failed: 'Hindi ma-rename, subukang muli' }
      },
      workspace: {
        nav: 'Workspace',
        title: 'Pamahalaan ang iyong PPT project',
        defaultTitle: 'Walang pamagat na project',
        empty: 'Wala pang project. Gamitin ang button sa itaas para gumawa.',
        projectNotFound: 'Hindi mahanap ang project o tinanggihan ang access',
        create: 'Bagong blank PPT',
        edit: 'I-edit',
        delete: 'Burahin',
        deleteCancel: 'Kanselahin',
        deleteConfirm: 'Burahin ang "{title}"? Hindi na ito mababawi.',
        deleteSuccess: 'Nabura na ang project',
        save: 'I-save',
        projectName: 'Pangalan ng project',
        backToWorkspace: 'Bumalik sa workspace',
        browse: 'Tingnan',
        share: 'I-share',
        download: 'I-download',
        more: 'Higit pang aksyon'
      }
    })
  },

  'pt-BR': {
    global: mkGlobal({
      nav: {
        home: 'Início',
        pricing: 'Preços',
        about: 'Sobre',
        help: 'Ajuda',
        news: 'Notícias',
        primary: 'Navegação principal'
      },
      brand: { tagline: 'Starter Nuxt moderno para sites públicos' },
      seo: {
        defaultDescription:
          'Um starter reutilizável de Nuxt 4 para sites de marketing, páginas SEO e frontends SaaS leves.'
      },
      common: {
        switchLanguage: 'Trocar idioma',
        switchTheme: 'Trocar tema',
        readMore: 'Leia mais',
        backHome: 'Voltar ao início',
        error: 'Algo deu errado. Tente novamente.',
        loadFailed: 'Falha ao carregar os dados. Tente novamente.',
        retry: 'Tentar novamente'
      },
      productNav: {
        workspace: 'Área de trabalho',
        themeTemplates: 'Modelos de tema',
        pricing: 'Preços'
      },
      userMenu: { account: 'Conta', language: 'Idioma', signOut: 'Sair' },
      accountNav: { settings: 'Configurações da conta' },
      templates: { empty: 'Os modelos de tema chegarão em breve.' },
      error: {
        title: 'Página não encontrada',
        message: 'Verifique o endereço ou volte ao início para continuar.',
        forbidden: 'Acesso negado',
        unsupportedLanguage: 'Idioma não suportado'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: 'Starter Nuxt moderno para sites públicos',
        lead: 'O Nuxt Modern Starter reúne páginas de marketing, fluxos de autenticação, conteúdo multilíngue, rotas SEO e padrões de deploy Docker/Nginx em uma base limpa. Use-o para lançar um site SaaS, frontend de produto ou hub de conteúdo e substitua conteúdo e integrações backend conforme o produto cresce.',
        primaryCta: 'Começar a construir',
        secondaryCta: 'Ver exemplo de preços',
        preview: { metricLabel: 'Cobertura de modelos', metricValue: '12+ páginas' },
        stats: {
          pages: { value: '12+', label: 'Páginas reutilizáveis e rotas de conteúdo' },
          modules: { value: '6', label: 'Módulos de engenharia incluídos' },
          deploy: { value: '4', label: 'Estratégias de renderização híbrida por rota' }
        },
        featuresEyebrow: 'Impulsionado por Nuxt 4',
        featuresTitle: 'Os blocos usuais de sites públicos, já organizados',
        featuresLead:
          'Inspirado na hierarquia do Nuxt SaaS Template, a homepage oferece cards de recursos mais sólidos para um visual pronto para produção.',
        features: {
          design: {
            title: 'Sistema de design unificado',
            description:
              'Construído com Ant Design Vue e tokens locais para manter consistência de modo de cor, raio, sombras e espaçamento.'
          },
          i18n: {
            title: 'Roteamento localizado',
            description:
              'Prefixos de idioma, troca e links localizados prontos para páginas de marketing e conteúdo.'
          },
          seo: {
            title: 'Páginas amigáveis ao SEO',
            description:
              'Início, preços, ajuda e artigos têm pontos de entrada SEO extensíveis para indexação pública.'
          },
          auth: {
            title: 'Fluxos de conta',
            description:
              'Login, registro e páginas de conta conectados ao estado básico e prontos para um backend real.'
          },
          content: {
            title: 'Hub de conteúdo',
            description:
              'FAQ vem de config local tipada; notícias e preços via API pública, migráveis depois para CMS ou backend.'
          },
          deploy: {
            title: 'Deploy em produção',
            description:
              'Docker, Nginx, regras SWR e cabeçalhos de segurança já fazem parte do starter.'
          }
        },
        workflow: {
          eyebrow: 'Tudo para publicar',
          title: 'Um caminho mais curto do starter ao lançamento',
          lead: 'Mantém o starter leve enquanto adiciona capacidade, conversão e estrutura de conteúdo que um frontend SaaS precisa.',
          steps: {
            routes:
              'Reutilize início, preços, ajuda e notícias para organizar primeiro as informações públicas.',
            content:
              'Substitua textos i18n e fontes de conteúdo (preços/notícias já usam API e podem ir para CMS).',
            auth: 'Conecte seu sistema de contas backend quando estiver pronto para sessões, papéis e app de produto.'
          }
        },
        ctaEyebrow: 'Pronto para construir',
        ctaTitle: 'Use esta base Nuxt para lançar um frontend de produto polido mais rápido.'
      },
      about: {
        eyebrow: 'Sobre nós',
        title: 'Feito para sites públicos e frontends SaaS leves',
        lead: 'Nuxt Modern Starter é uma base reutilizável de Nuxt 4 para páginas de marketing, hubs de conteúdo e superfícies de produto opcionais com autenticação.',
        mission: {
          title: 'Nossa missão',
          body: 'Organizamos as capacidades mais comuns de sites públicos—roteamento i18n, SEO, páginas de conteúdo, exemplos de auth e padrões de deploy—em um ponto de partida executável para que equipes foquem em diferenças de produto.'
        },
        values: {
          title: 'O que otimizamos',
          items: {
            focus:
              'Foco em cenários de site público com limites de módulo claros, sem um starter superdimensionado.',
            quality: 'TypeScript strict, lint, testes e exemplos de deploy desde o primeiro dia.',
            openness:
              'Camadas pública e de produto separadas para trocar conteúdo local e via API gradualmente.'
          }
        },
        story: {
          title: 'Contexto do projeto',
          paragraphs: {
            origin:
              'O starter vem de necessidades repetidas em sites SaaS e frontends de produto: home de marketing, preços, ajuda, notícias, login/registro e exemplos de workspace e editor logados.',
            practice:
              'Padrão chinês como locale principal com inglês em /en, mistura SSR/prerender/SWR para páginas públicas e rotas de produto neutras em idioma com CSR.',
            next: 'Se você avalia um template Nuxt para site público, comece pelo quick start do README e substitua textos, conteúdo e integrações backend.'
          }
        }
      },
      help: {
        eyebrow: 'Central de ajuda',
        title: 'Aprenda a usar o Nuxt Modern Starter',
        lead: 'Esta página reúne perguntas comuns sobre setup, i18n, auth, SEO e deploy. Passos de início rápido e recursos vêm do i18n; FAQ de config local, migrável depois para CMS ou API backend.',
        faqTitle: 'Perguntas frequentes',
        quickStart: {
          title: 'Funcionando em 30 minutos',
          steps: {
            install: 'Ative o Corepack e execute pnpm install.',
            dev: 'Execute pnpm dev e navegue rotas chinesas padrão e /en em inglês.',
            explore:
              'Revise início, preços, sobre, ajuda e notícias para entender a estrutura do site público.',
            extend: 'Siga docs/usage.md para adicionar páginas, requests, SEO e auth opcional.'
          }
        },
        resources: {
          title: 'Leitura recomendada',
          architecture:
            'docs/architecture.md — responsabilidades de diretórios, estratégia de renderização, módulos e fluxo runtime',
          usage: 'docs/usage.md — páginas, requests, SEO, idiomas, workspace/editor/conta e auth',
          conventions:
            'docs/conventions.md — limites de config, camadas de request e convenções de código',
          deployment: 'docs/deployment.md — validação de deploy local, Docker e Nginx'
        }
      },
      news: {
        eyebrow: 'Atualizações do projeto',
        title: 'Lançamentos e notas do Nuxt Modern Starter',
        lead: 'Acompanhe releases do starter, práticas de deploy e orientações de extensão. Estas páginas também demonstram listagem/detalhe de notícias, Article JSON-LD e regras de cache SWR.',
        notFound: 'Esta notícia não foi encontrada'
      }
    }),
    product: mkProduct({
      auth: {
        header: {
          signIn: 'Entrar',
          signUp: 'Cadastrar',
          enterWorkspace: 'Entrar na área de trabalho'
        },
        form: {
          username: 'Nome de usuário',
          password: 'Senha',
          confirmPassword: 'Confirmar senha'
        },
        login: {
          title: 'Entrar',
          submit: 'Entrar',
          success: 'Login realizado com sucesso',
          noAccount: 'Ainda não tem conta?'
        },
        register: {
          title: 'Cadastrar',
          submit: 'Cadastrar',
          success: 'Cadastro realizado. Faça login.',
          hasAccount: 'Já tem conta?'
        },
        logout: { submit: 'Sair', success: 'Sessão encerrada' },
        account: {
          eyebrow: 'Página protegida',
          title: 'Conta',
          lead: 'Esta página é protegida pelo middleware auth nomeado e mostra o perfil do usuário atual.',
          avatar: 'Foto de perfil',
          sessionTitle: 'Sessão',
          profileTitle: 'Perfil estendido',
          userId: 'ID do usuário',
          nickname: 'Apelido',
          roles: 'Papéis',
          permissions: 'Permissões',
          none: 'Nenhum',
          emptyProfile: 'Sem perfil estendido ainda'
        },
        validation: {
          usernameRequired: 'Informe um nome de usuário',
          passwordRequired: 'Informe uma senha',
          confirmPasswordRequired: 'Confirme sua senha',
          passwordMin: 'A senha deve ter pelo menos 6 caracteres',
          passwordMismatch: 'As duas senhas não coincidem'
        },
        errors: {
          loginFailed: 'Falha no login. Verifique usuário ou senha.',
          registerFailed: 'Falha no cadastro. Tente novamente mais tarde.',
          unauthorized: 'Credenciais de login ausentes ou inválidas'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'Editor de conteúdo',
        placeholder: 'Comece a escrever seu conteúdo...',
        metaTitle: 'Editor',
        autosave: {
          saving: 'Salvando…',
          saved: 'Salvo automaticamente · {time}',
          failed: 'Falha no salvamento automático, nova tentativa na próxima edição'
        },
        rename: { failed: 'Falha ao renomear, tente novamente' }
      },
      workspace: {
        nav: 'Área de trabalho',
        title: 'Gerencie seus projetos PPT',
        defaultTitle: 'Projeto sem título',
        empty: 'Ainda não há projetos. Use o botão acima para criar um.',
        projectNotFound: 'Projeto não encontrado ou acesso negado',
        create: 'Novo PPT em branco',
        edit: 'Editar',
        delete: 'Excluir',
        deleteCancel: 'Cancelar',
        deleteConfirm: 'Excluir "{title}"? Esta ação não pode ser desfeita.',
        deleteSuccess: 'Projeto excluído',
        save: 'Salvar',
        projectName: 'Nome do projeto',
        backToWorkspace: 'Voltar à área de trabalho',
        browse: 'Visualizar',
        share: 'Compartilhar',
        download: 'Baixar',
        more: 'Mais ações'
      }
    })
  },

  'pt-PT': {
    global: mkGlobal({
      nav: {
        home: 'Início',
        pricing: 'Preços',
        about: 'Sobre',
        help: 'Ajuda',
        news: 'Notícias',
        primary: 'Navegação principal'
      },
      brand: { tagline: 'Starter Nuxt moderno para sites públicos' },
      seo: {
        defaultDescription:
          'Um starter reutilizável de Nuxt 4 para sites de marketing, páginas SEO e frontends SaaS leves.'
      },
      common: {
        switchLanguage: 'Mudar idioma',
        switchTheme: 'Mudar tema',
        readMore: 'Ler mais',
        backHome: 'Voltar ao início',
        error: 'Ocorreu um erro. Tente novamente.',
        loadFailed: 'Falha ao carregar os dados. Tente novamente.',
        retry: 'Tentar novamente'
      },
      productNav: {
        workspace: 'Área de trabalho',
        themeTemplates: 'Modelos de tema',
        pricing: 'Preços'
      },
      userMenu: { account: 'Conta', language: 'Idioma', signOut: 'Terminar sessão' },
      accountNav: { settings: 'Definições da conta' },
      templates: { empty: 'Os modelos de tema chegarão em breve.' },
      error: {
        title: 'Página não encontrada',
        message: 'Verifique o endereço ou volte ao início para continuar.',
        forbidden: 'Acesso negado',
        unsupportedLanguage: 'Idioma não suportado'
      }
    }),
    marketing: mkMarketing({
      home: {
        eyebrow: 'Nuxt 4 · TypeScript · Ant Design Vue',
        title: 'Starter Nuxt moderno para sites públicos',
        lead: 'O Nuxt Modern Starter reúne páginas de marketing, fluxos de autenticação, conteúdo multilingue, rotas SEO e predefinições de implementação Docker/Nginx numa base limpa. Utilize-o para lançar um site SaaS, frontend de produto ou hub de conteúdo e substitua conteúdo e integrações backend à medida que o produto cresce.',
        primaryCta: 'Começar a construir',
        secondaryCta: 'Ver exemplo de preços',
        preview: { metricLabel: 'Cobertura de modelos', metricValue: '12+ páginas' },
        stats: {
          pages: { value: '12+', label: 'Páginas reutilizáveis e rotas de conteúdo' },
          modules: { value: '6', label: 'Módulos de engenharia incluídos' },
          deploy: { value: '4', label: 'Estratégias de renderização híbrida por rota' }
        },
        featuresEyebrow: 'Com tecnologia Nuxt 4',
        featuresTitle: 'Os blocos habituais de sites públicos, já organizados',
        featuresLead:
          'Inspirado na hierarquia do Nuxt SaaS Template, a página inicial oferece cartões de funcionalidades mais sólidos para um aspeto pronto para produção.',
        features: {
          design: {
            title: 'Sistema de design unificado',
            description:
              'Construído com Ant Design Vue e tokens locais para manter consistência de modo de cor, raio, sombras e espaçamento.'
          },
          i18n: {
            title: 'Encaminhamento localizado',
            description:
              'Prefixos de idioma, alternância e ligações localizadas prontos para páginas de marketing e conteúdo.'
          },
          seo: {
            title: 'Páginas amigas do SEO',
            description:
              'Início, preços, ajuda e artigos têm pontos de entrada SEO extensíveis para indexação pública.'
          },
          auth: {
            title: 'Fluxos de conta',
            description:
              'Início de sessão, registo e páginas de conta ligados ao estado básico e prontos para um backend real.'
          },
          content: {
            title: 'Hub de conteúdo',
            description:
              'FAQ a partir de config local tipada; notícias e preços via API pública, migráveis depois para CMS ou backend.'
          },
          deploy: {
            title: 'Implementação em produção',
            description:
              'Docker, Nginx, regras SWR e cabeçalhos de segurança já fazem parte do starter.'
          }
        },
        workflow: {
          eyebrow: 'Tudo o que precisa para publicar',
          title: 'Um caminho mais curto do starter ao lançamento',
          lead: 'Mantém o starter leve enquanto adiciona capacidade, conversão e estrutura de conteúdo que um frontend SaaS precisa.',
          steps: {
            routes:
              'Reutilize início, preços, ajuda e notícias para organizar primeiro a informação pública.',
            content:
              'Substitua textos i18n e fontes de conteúdo (preços/notícias já usam API e podem ir para CMS).',
            auth: 'Ligue o seu sistema de contas backend quando estiver pronto para sessões, papéis e app de produto.'
          }
        },
        ctaEyebrow: 'Pronto para construir',
        ctaTitle:
          'Utilize esta base Nuxt para lançar um frontend de produto polido mais rapidamente.'
      },
      about: {
        eyebrow: 'Sobre nós',
        title: 'Criado para sites públicos e frontends SaaS leves',
        lead: 'Nuxt Modern Starter é uma base reutilizável de Nuxt 4 para páginas de marketing, hubs de conteúdo e superfícies de produto opcionais com autenticação.',
        mission: {
          title: 'A nossa missão',
          body: 'Organizamos as capacidades mais comuns de sites públicos—encaminhamento i18n, SEO, páginas de conteúdo, exemplos de auth e padrões de implementação—num ponto de partida executável para que as equipas se concentrem nas diferenças de produto.'
        },
        values: {
          title: 'O que optimizamos',
          items: {
            focus:
              'Foco em cenários de site público com limites de módulo claros, sem um starter sobredimensionado.',
            quality:
              'TypeScript strict, lint, testes e exemplos de implementação desde o primeiro dia.',
            openness:
              'Camadas pública e de produto separadas para trocar conteúdo local e via API gradualmente.'
          }
        },
        story: {
          title: 'Contexto do projeto',
          paragraphs: {
            origin:
              'O starter nasce de necessidades repetidas em sites SaaS e frontends de produto: home de marketing, preços, ajuda, notícias, registo/início de sessão e exemplos de área de trabalho e editor autenticados.',
            practice:
              'Chinês por defeito como locale principal com inglês em /en, mistura SSR/prerender/SWR para páginas públicas e rotas de produto neutras em idioma com CSR.',
            next: 'Se avalia um template Nuxt para site público, comece pelo quick start do README e substitua textos, conteúdo e integrações backend.'
          }
        }
      },
      help: {
        eyebrow: 'Centro de ajuda',
        title: 'Aprenda a utilizar o Nuxt Modern Starter',
        lead: 'Esta página reúne perguntas frequentes sobre configuração, i18n, auth, SEO e implementação. Passos de arranque rápido e recursos vêm do i18n; FAQ de config local, migrável depois para CMS ou API backend.',
        faqTitle: 'Perguntas frequentes',
        quickStart: {
          title: 'A funcionar em 30 minutos',
          steps: {
            install: 'Ative o Corepack e execute pnpm install.',
            dev: 'Execute pnpm dev e navegue rotas chinesas por defeito e /en em inglês.',
            explore:
              'Revise início, preços, sobre, ajuda e notícias para compreender a estrutura do site público.',
            extend: 'Siga docs/usage.md para adicionar páginas, pedidos, SEO e auth opcional.'
          }
        },
        resources: {
          title: 'Leitura recomendada',
          architecture:
            'docs/architecture.md — responsabilidades de diretórios, estratégia de renderização, módulos e fluxo runtime',
          usage:
            'docs/usage.md — páginas, pedidos, SEO, idiomas, área de trabalho/editor/conta e auth',
          conventions:
            'docs/conventions.md — limites de config, camadas de pedidos e convenções de código',
          deployment: 'docs/deployment.md — validação de implementação local, Docker e Nginx'
        }
      },
      news: {
        eyebrow: 'Atualizações do projeto',
        title: 'Lançamentos e notas do Nuxt Modern Starter',
        lead: 'Acompanhe lançamentos do starter, práticas de implementação e orientações de extensão. Estas páginas também demonstram listagem/detalhe de notícias, Article JSON-LD e regras de cache SWR.',
        notFound: 'Esta notícia não foi encontrada'
      }
    }),
    product: mkProduct({
      auth: {
        header: {
          signIn: 'Iniciar sessão',
          signUp: 'Registar',
          enterWorkspace: 'Entrar na área de trabalho'
        },
        form: {
          username: 'Nome de utilizador',
          password: 'Palavra-passe',
          confirmPassword: 'Confirmar palavra-passe'
        },
        login: {
          title: 'Iniciar sessão',
          submit: 'Iniciar sessão',
          success: 'Sessão iniciada com sucesso',
          noAccount: 'Ainda não tem conta?'
        },
        register: {
          title: 'Registar',
          submit: 'Registar',
          success: 'Registo concluído. Inicie sessão.',
          hasAccount: 'Já tem conta?'
        },
        logout: { submit: 'Terminar sessão', success: 'Sessão terminada' },
        account: {
          eyebrow: 'Página protegida',
          title: 'Conta',
          lead: 'Esta página é protegida pelo middleware auth nomeado e mostra o perfil do utilizador atual.',
          avatar: 'Foto de perfil',
          sessionTitle: 'Sessão',
          profileTitle: 'Perfil alargado',
          userId: 'ID do utilizador',
          nickname: 'Alcunha',
          roles: 'Papéis',
          permissions: 'Permissões',
          none: 'Nenhum',
          emptyProfile: 'Sem perfil alargado ainda'
        },
        validation: {
          usernameRequired: 'Introduza um nome de utilizador',
          passwordRequired: 'Introduza uma palavra-passe',
          confirmPasswordRequired: 'Confirme a palavra-passe',
          passwordMin: 'A palavra-passe deve ter pelo menos 6 caracteres',
          passwordMismatch: 'As duas palavras-passe não coincidem'
        },
        errors: {
          loginFailed: 'Falha no início de sessão. Verifique utilizador ou palavra-passe.',
          registerFailed: 'Falha no registo. Tente novamente mais tarde.',
          unauthorized: 'Credenciais de início de sessão em falta ou inválidas'
        }
      },
      editor: {
        eyebrow: 'Yaniv Editor',
        title: 'Editor de conteúdo',
        placeholder: 'Comece a escrever o seu conteúdo...',
        metaTitle: 'Editor',
        autosave: {
          saving: 'A guardar…',
          saved: 'Guardado automaticamente · {time}',
          failed: 'Falha ao guardar automaticamente, nova tentativa na próxima edição'
        },
        rename: { failed: 'Falha ao renomear, tente novamente' }
      },
      workspace: {
        nav: 'Área de trabalho',
        title: 'Gerir os seus projetos PPT',
        defaultTitle: 'Projeto sem título',
        empty: 'Ainda não há projetos. Utilize o botão acima para criar um.',
        projectNotFound: 'Projeto não encontrado ou acesso negado',
        create: 'Novo PPT em branco',
        edit: 'Editar',
        delete: 'Eliminar',
        deleteCancel: 'Cancelar',
        deleteConfirm: 'Eliminar «{title}»? Esta ação não pode ser anulada.',
        deleteSuccess: 'Projeto eliminado',
        save: 'Guardar',
        projectName: 'Nome do projeto',
        backToWorkspace: 'Voltar à área de trabalho',
        browse: 'Ver',
        share: 'Partilhar',
        download: 'Transferir',
        more: 'Mais ações'
      }
    })
  }
}
