// ============================================================
// data.js — All box data constants (mirrors Python app.py)
// ============================================================

// --- BASELINE DE REFERÊNCIA (Valores iniciais para comparação) ---
const BASELINE = [
    { nome: "Caixa P",    dims: [218, 170, 174], valor: 1.18 },
    { nome: "Caixa M",    dims: [270, 180, 250], valor: 1.80 },
    { nome: "Caixa G",    dims: [372, 248, 211], valor: 2.47 },
    { nome: "Caixa PH",   dims: [250, 170, 320], valor: 2.01 },
    { nome: "Caixa PHE",  dims: [220, 170, 319], valor: 1.97 },
    { nome: "Caixa XXA",  dims: [150, 140, 240], valor: 1.07 },
    { nome: "Caixa PXA",  dims: [120, 120, 130], valor: 0.58 },
    { nome: "Caixa XXP",  dims: [130, 100, 100], valor: 0.58 },
    { nome: "Shipping M", dims: [268, 110, 222], valor: 1.25 },
];

// --- CAIXAS COM DADOS ATUAIS E PREENCHIMENTO DE PAPEL ---
const CAIXAS = [
    { nome: "Caixa P",    dims: [218, 170, 174], ocupacao_atual: 0.20, preenchimento_papel_m: 2.8, valor: 1.06 },
    { nome: "Caixa M",    dims: [270, 180, 250], ocupacao_atual: 0.60, preenchimento_papel_m: 3.0, valor: 1.63 },
    { nome: "Caixa G",    dims: [372, 248, 211], ocupacao_atual: 0.63, preenchimento_papel_m: 5.6, valor: 2.21 },
    { nome: "Caixa PH",   dims: [250, 170, 320], ocupacao_atual: 0.40, preenchimento_papel_m: 3.0, valor: 1.83 },
    { nome: "Caixa PHE",  dims: [220, 170, 319], ocupacao_atual: 0.39, preenchimento_papel_m: 3.6, valor: 2.07 },
    { nome: "Caixa XXA",  dims: [150, 140, 240], ocupacao_atual: 0.20, preenchimento_papel_m: 3.0, valor: 1.53 },
    { nome: "Caixa PXA",  dims: [120, 120, 130], ocupacao_atual: 0.27, preenchimento_papel_m: 1.8, valor: 0.68 },
    { nome: "Caixa XXP",  dims: [130, 100, 100], ocupacao_atual: 0.24, preenchimento_papel_m: 1.8, valor: 0.58 },
    { nome: "Shipping M", dims: [268, 110, 222], ocupacao_atual: 0.00, preenchimento_papel_m: 0.0, valor: 1.25 },
];

// --- NOVAS CAIXAS OTIMIZADAS ---
const NOVAS_CAIXAS = [
    { nome: "Box Especial 1", dims: [192, 150, 154], ocupacao_atual: 0.30, preenchimento_papel_m: 2.5, valor: 1.038 },
    { nome: "Box Especial 2", dims: [245, 164, 227], ocupacao_atual: 0.45, preenchimento_papel_m: 3.2, valor: 1.565 },
    { nome: "Box Especial 3", dims: [344, 229, 195], ocupacao_atual: 0.55, preenchimento_papel_m: 4.0, valor: 2.33 },
    { nome: "Box Especial 4", dims: [221, 150, 282], ocupacao_atual: 0.35, preenchimento_papel_m: 2.2, valor: 1.91 },
    { nome: "Box Especial 5", dims: [173, 134, 251], ocupacao_atual: 0.28, preenchimento_papel_m: 2.8, valor: 1.385 },
    { nome: "Box Especial 6", dims: [94, 88, 151],   ocupacao_atual: 0.15, preenchimento_papel_m: 1.2, valor: 0.643 },
];
