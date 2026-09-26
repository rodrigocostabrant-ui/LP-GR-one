// Todo o copy real da GR One, extraído de `Lp design/v2/GR One Landing v2.dc.html`
// (versão 2 do design, importada via claude.ai/design em 2026-09-25).
// Nenhum texto deste arquivo foi inventado — ao editar, mantenha a fonte (o .dc.html).

export const site = {
  nome: "GR One",
  // TODO: número real do WhatsApp dos sócios (formato internacional, ex: 5511999999999)
  whatsapp: "5500000000000",
  whatsappMensagem: "Olá! Quero conversar sobre uma landing page para a minha empresa.",
  socios: "Rodrigo e Gustavo",
  /** CTA curto: cabeçalho, topo e barra fixa do celular */
  ctaCurto: "Começar uma conversa",
  menuAssinatura: "GR One — estúdio de landing pages",

  nav: [
    { id: "inicio", label: "Início" },
    { id: "metodo", label: "Método" },
    { id: "processo", label: "Processo" },
    { id: "contato", label: "Contato" },
  ],

  hero: {
    eyebrow: "(01) Estúdio de landing pages",
    selo: "Brasil — MMXXVI",
    linha1: "A landing page que",
    palavraDestaque: "TRANSFORMA",
    linha3Italico: "visitante",
    linha3Resto: "em cliente.",
    paragrafo:
      "Landing pages de alto padrão para empresas de serviço que não podem parecer comuns. Estratégia, texto e design com um único objetivo: começar a conversa.",
    ctaPrimario: "Começar uma conversa",
    ctaSecundario: "Ver o método",
    scrollHint: "Role para entrar",
  },

  manifesto: {
    eyebrow: "(02) Manifesto",
    linhaA: "SUA EMPRESA",
    linhaB: "NÃO É",
    palavraFragmentada: "COMUM.",
    pergunta: "Então por que a sua página seria?",
  },

  metodo: {
    eyebrow: "(03) Método",
    tituloLinha1: "Anatomia de uma página",
    tituloItalico: "que converte.",
    paragrafo:
      "Nada está na página por acaso. Cada bloco cumpre uma função no caminho entre a primeira visita e a conversa.",
    citacao: "“Tenho um site, mas ninguém me chama.”",
    partes: [
      {
        numero: "01",
        titulo: "Promessa",
        descricao: "Em três segundos o visitante entende o que você faz e para quem.",
      },
      {
        numero: "02",
        titulo: "Identificação",
        descricao: "A dor do cliente dita com as palavras dele. É aqui que ele pensa: é comigo.",
      },
      {
        numero: "03",
        titulo: "Método",
        descricao: "Como você resolve, mostrado com clareza. Confiança nasce de um processo visível.",
      },
      {
        numero: "04",
        titulo: "Objeções",
        descricao: "As dúvidas que travam a decisão, respondidas antes de serem perguntadas.",
      },
      {
        numero: "05",
        titulo: "Diferenciais",
        descricao: "Por que você — e não o próximo resultado da busca.",
      },
      {
        numero: "06",
        titulo: "Chamada",
        descricao: "Uma única ação, repetida no momento certo. Sem distração, sem ruído.",
      },
    ],
  },

  processo: {
    eyebrow: "(04) Processo",
    subEyebrow: "Do entendimento à entrega",
    tituloLinha1: "Como uma página",
    tituloItalico: "nasce aqui.",
    paragrafo:
      "Não começamos montando blocos. Começamos entendendo por que alguém escolheria a sua empresa — e desenhamos a página a partir disso.",
    continuarRolando: "Continue rolando",
    rotuloEtapa: "ETAPA",
    rotuloNestaEtapa: "Nesta etapa",
    rotuloVoceRecebe: "Você recebe",
    etapas: [
      {
        n: "01",
        titulo: "Estratégia",
        descricao:
          "Antes do layout, o negócio. Entendemos quem decide, o que ele receia e por que escolheria você.",
        itens: ["Público e decisor", "Oferta e diferenciais", "Objeções a responder"],
        entrega: "Diagnóstico e objetivo da página",
      },
      {
        n: "02",
        titulo: "Direção visual",
        descricao:
          "Tipografia, imagens e ritmo definidos para a sua marca — nunca adaptados de um modelo pronto.",
        itens: ["Referências e linguagem", "Tipografia e paleta", "Tratamento de imagem"],
        entrega: "Direção de arte aprovada",
      },
      {
        n: "03",
        titulo: "Criação",
        descricao:
          "Texto e estrutura nascem juntos. Cada seção responde uma dúvida e aproxima o visitante do contato.",
        itens: ["Arquitetura da informação", "Texto persuasivo", "Desenho de todas as telas"],
        entrega: "Página desenhada e escrita",
      },
      {
        n: "04",
        titulo: "Desenvolvimento",
        descricao:
          "Construída em Next.js e publicada na Vercel: rápida, estável e impecável em qualquer tela.",
        itens: ["Computador, tablet e celular", "Carregamento rápido", "Contato direto pelo WhatsApp"],
        entrega: "Página funcionando em ambiente de teste",
      },
      {
        n: "05",
        titulo: "Entrega",
        descricao: "Refinamos com você até estar certo — e publicamos no seu domínio.",
        itens: ["Refinamento final", "Publicação no seu domínio", "Orientação de uso"],
        entrega: "Sua página no ar",
      },
    ],
  },

  manifestoTipografico: {
    eyebrow: "(05) Se você já tem um site",
    faixa1: "ESTRATÉGIA · TEXTO QUE CONDUZ · DIREÇÃO DE ARTE",
    faixa2: "ATENDIMENTO PERSONALIZADO — REUNIÕES POR VÍDEO",
    frase: "Ter um site não é o mesmo que ter uma página que converte.",
    paragrafo:
      "Um site apresenta. Uma landing page conduz: cada seção antecipa uma dúvida, responde e aproxima o visitante do contato.",
    diferenciais: [
      {
        numero: "01 — DIFERENCIAL",
        titulo: "Texto antes do enfeite.",
        descricao:
          "O design chama a atenção. O texto convence. Escrevemos a página antes de desenhá-la — e a estrutura inteira existe para gerar contato.",
      },
      {
        numero: "02 — DIFERENCIAL",
        titulo: "Atendimento personalizado.",
        descricao:
          "Chamadas de vídeo e reuniões para entender o seu negócio de perto. Nada de formulário genérico: cada página começa numa conversa.",
      },
    ],
  },

  antesDepois: {
    eyebrow: "(06) Antes e depois — exemplo conceitual",
    tituloLinha1: "Mesma empresa.",
    tituloItalico: "Outra percepção.",
    paragrafo:
      "Não é sobre estar na internet. É sobre como você é percebido quando alguém chega. Arraste para comparar.",
    antes: {
      marca: "VALE ADVOCACIA",
      badge: "ANTES",
      nav: ["Início", "Quem somos", "Áreas de atuação", "Equipe", "Artigos", "Contato"],
      telefone: "(11) 0000-0000",
      bannerTitulo: "Bem-vindo à Vale Advocacia",
      bannerSubtitulo: "Tradição, ética e compromisso com nossos clientes.",
      bannerCta: "SAIBA MAIS",
      imagemAlt: "Escritório — imagem genérica",
      cards: [
        { titulo: "Missão", texto: "Oferecer serviços jurídicos de qualidade com dedicação e seriedade." },
        { titulo: "Visão", texto: "Ser referência em soluções jurídicas na região." },
        { titulo: "Valores", texto: "Ética, transparência, respeito e comprometimento." },
      ],
      // Versão de celular (moldura 9:16) — textos encurtados na v2.
      cardsMobile: [
        { titulo: "Missão", texto: "Oferecer serviços jurídicos de qualidade com dedicação." },
        { titulo: "Visão", texto: "Ser referência em soluções jurídicas." },
      ],
    },
    depois: {
      marca: "VALE",
      subtitulo: "advocacia empresarial",
      nav: ["Atuação", "Sócios", "Contato"],
      ctaTopo: "Falar com um advogado",
      imagemAlt: "Edifício corporativo — imagem conceitual",
      eyebrow: "Direito empresarial — São Paulo",
      titulo: "Decisões difíceis pedem",
      tituloItalico: "clareza.",
      paragrafo:
        "Assessoria para empresas que precisam decidir rápido, com segurança e sem juridiquês.",
      cta: "Agendar conversa",
      ctaSecundario: "Como atuamos",
      areas: ["Societário", "Contratos", "Tributário"],
      badge: "DEPOIS — GR ONE",
      eyebrowMobile: "DIREITO EMPRESARIAL",
      menuMobile: "MENU",
    },
    sliderLabel: "Comparar antes e depois",
  },

  investimento: {
    eyebrow: "(07) Investimento",
    tituloLinha1: "Investimento",
    tituloItalico: "sob consulta.",
    paragrafo:
      "Fazemos um atendimento personalizado para entender a dor real do seu negócio — e resolvê-la com uma página que transforma visitantes em clientes.",
    paragrafo2:
      "Por isso não existe tabela: o investimento é definido depois de conhecermos o seu cenário.",
    cta: "Agendar minha conversa",
    comoFunciona: {
      eyebrow: "Como funciona o atendimento",
      passos: [
        {
          n: "01",
          titulo: "Primeiro contato",
          descricao: "Você nos chama no WhatsApp e marcamos um horário.",
        },
        {
          n: "02",
          titulo: "Reunião de diagnóstico",
          descricao:
            "Por chamada de vídeo ou presencial: público, oferta, objeções e o que hoje impede o contato.",
        },
        {
          n: "03",
          titulo: "Proposta sob medida",
          descricao: "Escopo, prazo e investimento pensados para o seu caso — não para um pacote.",
        },
      ],
    },
  },

  contato: {
    eyebrow: "(08) Contato",
    tituloLinha1: "Sua próxima página",
    tituloItalico: "começa em uma conversa.",
    cta: "Começar uma conversa no WhatsApp",
    rodape: "Atendimento personalizado — por chamada de vídeo ou reunião",
  },

  footer: {
    nome: "GR One — estúdio de landing pages premium",
    copyright: "© 2026 GR One",
    marca: "GR ONE",
  },
} as const;

export type Site = typeof site;
