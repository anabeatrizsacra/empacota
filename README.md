# EMPACOTA — Calculadora de Otimização de Embalagens

Calculadora estática para encontrar dimensões ideais de caixas visando maior eficiência e economia em embalagens.

## 🚀 Como usar

### Localmente
Abra o arquivo `index.html` diretamente no navegador — não é necessário servidor.

### GitHub Pages
1. Faça push deste repositório para o GitHub
2. Vá em **Settings → Pages → Source → Deploy from a branch** (selecione `main` / `root`)
3. Acesse `https://seu-usuario.github.io/empacota-publico/`

## 📁 Estrutura

```
├── index.html          ← Página principal (single page)
├── css/
│   └── styles.css      ← Estilos (tema preto/dourado)
├── js/
│   ├── data.js         ← Dados das caixas (BASELINE, CAIXAS, NOVAS_CAIXAS)
│   ├── calculator.js   ← Motor de cálculo (classe Caixa)
│   └── app.js          ← Lógica da interface (abas, formulários, renderização)
├── img/
│   ├── header_loreal_empacota.png
│   └── favicon.png
└── README.md
```

## 📊 Funcionalidades

### Aba 1 — Análise Individual
- Selecione uma caixa predefinida ou crie uma personalizada
- Configure ocupação atual, papel de preenchimento e meta de ocupação
- Veja dimensões otimizadas, economia de papel e comparativo Baseline vs Atual vs Otimizada

### Aba 2 — Análise Comparativa
- Compare múltiplas caixas simultaneamente
- Defina quantidades por tipo de caixa
- Visualize totais agregados e economia geral

## 🔧 Tecnologias

- HTML5 / CSS3 / JavaScript (Vanilla)
- 100% estático — sem servidor, sem dependências externas
- Compatível com GitHub Pages
