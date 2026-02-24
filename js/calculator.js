// =====================================================
// BoxOptimizer - Calculadora de Otimização de Embalagens
// Versão: 1.0 - Dados Fictícios para Demonstração
// =====================================================

// --- DADOS FICTÍCIOS DE DEMONSTRAÇÃO ---
// Todos os valores abaixo são fictícios e não representam dados reais.

const BASELINE = [
    { nome: "Caixa Alfa",    dims: [200, 150, 160], valor: 1.50 },
    { nome: "Caixa Beta",    dims: [250, 170, 230], valor: 2.10 },
    { nome: "Caixa Gama",    dims: [350, 230, 200], valor: 3.00 },
    { nome: "Caixa Delta",   dims: [230, 160, 300], valor: 2.40 },
    { nome: "Caixa Épsilon", dims: [200, 160, 300], valor: 2.30 },
    { nome: "Caixa Zeta",    dims: [140, 130, 220], valor: 1.20 },
    { nome: "Caixa Eta",     dims: [110, 110, 120], valor: 0.70 },
    { nome: "Caixa Theta",   dims: [120, 90, 90],   valor: 0.65 },
    { nome: "Envio Padrão",  dims: [250, 100, 210], valor: 1.40 },
];

const CAIXAS = [
    { nome: "Caixa Alfa",    dims: [200, 150, 160], ocupacao_atual: 0.25, preenchimento_papel_m: 2.5, valor: 1.30 },
    { nome: "Caixa Beta",    dims: [250, 170, 230], ocupacao_atual: 0.55, preenchimento_papel_m: 2.8, valor: 1.90 },
    { nome: "Caixa Gama",    dims: [350, 230, 200], ocupacao_atual: 0.60, preenchimento_papel_m: 5.0, valor: 2.70 },
    { nome: "Caixa Delta",   dims: [230, 160, 300], ocupacao_atual: 0.45, preenchimento_papel_m: 2.8, valor: 2.10 },
    { nome: "Caixa Épsilon", dims: [200, 160, 300], ocupacao_atual: 0.42, preenchimento_papel_m: 3.2, valor: 2.35 },
    { nome: "Caixa Zeta",    dims: [140, 130, 220], ocupacao_atual: 0.22, preenchimento_papel_m: 2.8, valor: 1.70 },
    { nome: "Caixa Eta",     dims: [110, 110, 120], ocupacao_atual: 0.30, preenchimento_papel_m: 1.6, valor: 0.80 },
    { nome: "Caixa Theta",   dims: [120, 90, 90],   ocupacao_atual: 0.28, preenchimento_papel_m: 1.6, valor: 0.65 },
    { nome: "Envio Padrão",  dims: [250, 100, 210], ocupacao_atual: 0.00, preenchimento_papel_m: 0.0, valor: 1.40 },
];

const NOVAS_CAIXAS = [
    { nome: "Box Compacta 1", dims: [180, 140, 145], ocupacao_atual: 0.35, preenchimento_papel_m: 2.2, valor: 1.15 },
    { nome: "Box Compacta 2", dims: [230, 155, 215], ocupacao_atual: 0.50, preenchimento_papel_m: 2.9, valor: 1.75 },
    { nome: "Box Compacta 3", dims: [325, 215, 185], ocupacao_atual: 0.58, preenchimento_papel_m: 3.8, valor: 2.60 },
    { nome: "Box Compacta 4", dims: [210, 142, 270], ocupacao_atual: 0.40, preenchimento_papel_m: 2.0, valor: 2.15 },
    { nome: "Box Compacta 5", dims: [165, 128, 240], ocupacao_atual: 0.32, preenchimento_papel_m: 2.5, valor: 1.55 },
    { nome: "Box Compacta 6", dims: [90, 85, 145],   ocupacao_atual: 0.18, preenchimento_papel_m: 1.0, valor: 0.72 },
];

const VALOR_PAPEL_POR_METRO = 0.50; // R$ por metro (valor fictício)

// =====================================================
// CLASSE CAIXA - Lógica de cálculo portada de Python
// =====================================================
class Caixa {
    constructor(nome, comprimento, largura, altura, ocupacao_atual, preenchimento_papel_m = 0.0, valor = 0.0) {
        this.nome = nome;
        this.comprimento = comprimento;
        this.largura = largura;
        this.altura = altura;
        this.ocupacao_atual = ocupacao_atual;
        this.preenchimento_papel_m = preenchimento_papel_m;
        this.valor = valor;
        this.volume_total = (comprimento * largura * altura) / 1000; // em cm³
    }

    calcularDimensoesOtimizadas(meta_ocupacao = 0.80, largura_minima = null) {
        if (meta_ocupacao === null || meta_ocupacao === undefined) {
            meta_ocupacao = 0.80;
        }

        const volume_caixa_cm3 = this.volume_total;
        const volume_produto_atual = volume_caixa_cm3 * this.ocupacao_atual;
        const volume_caixa_otimizada = volume_produto_atual / meta_ocupacao;
        const scale_target = Math.pow(volume_caixa_otimizada / volume_caixa_cm3, 1 / 3);

        let dim_x_otimizado = this.comprimento * scale_target;
        let dim_y_otimizado = this.largura * scale_target;
        let dim_z_otimizado = this.altura * scale_target;

        // Aplicar restrição de largura mínima SE fornecida
        if (largura_minima !== null && dim_y_otimizado < largura_minima) {
            const razao_ajuste = largura_minima / dim_y_otimizado;
            dim_x_otimizado = dim_x_otimizado * razao_ajuste;
            dim_y_otimizado = largura_minima;
            dim_z_otimizado = dim_z_otimizado * razao_ajuste;
        }

        const volume_final = (dim_x_otimizado * dim_y_otimizado * dim_z_otimizado) / 1000;
        const volume_produto_otimizado = volume_produto_atual;
        const ocupacao_final = (volume_produto_otimizado / volume_final) * 100;
        const volume_vazio_total = volume_final - volume_produto_otimizado;

        let densidade_papel_cm3_por_m = 0;
        let preenchimento_papel_100_m = 0;
        let preenchimento_papel_meta_m = 0;
        let economia_papel_m = 0;

        if (this.ocupacao_atual > 0) {
            const volume_vazio_atual = volume_caixa_cm3 * (1 - this.ocupacao_atual);

            if (this.preenchimento_papel_m > 0) {
                densidade_papel_cm3_por_m = volume_vazio_atual / this.preenchimento_papel_m;
            }

            if (densidade_papel_cm3_por_m > 0) {
                preenchimento_papel_100_m = volume_vazio_total / densidade_papel_cm3_por_m;
            }

            const volume_vazio_meta = volume_final * (1 - meta_ocupacao);
            if (densidade_papel_cm3_por_m > 0) {
                preenchimento_papel_meta_m = volume_vazio_meta / densidade_papel_cm3_por_m;
            }

            economia_papel_m = this.preenchimento_papel_m - preenchimento_papel_meta_m;
        }

        const custo_papel_atual = this.preenchimento_papel_m * VALOR_PAPEL_POR_METRO;
        const custo_papel_nova_caixa = preenchimento_papel_100_m * VALOR_PAPEL_POR_METRO;
        const economia_custo_papel = custo_papel_atual - custo_papel_nova_caixa;

        let percentual_variacao = 0;
        if (volume_produto_atual > 0) {
            percentual_variacao = ((volume_final - volume_produto_atual) / volume_produto_atual) * 100;
        }

        const valor_nova_caixa = this._buscarValorNovaCaixa(dim_x_otimizado, dim_y_otimizado, dim_z_otimizado);
        const valor_baseline = this._buscarValorBaseline();

        return {
            nome_caixa: this.nome,
            dimensoes_caixa: `${this.comprimento}×${this.largura}×${this.altura}mm`,
            volume_caixa: round(volume_caixa_cm3, 2),
            ocupacao_atual: round(this.ocupacao_atual * 100, 1),
            volume_produto_atual: round(volume_produto_atual, 2),
            volume_produto_otimizado: round(volume_produto_otimizado, 2),
            volume_caixa_otimizada: round(volume_final, 2),
            ocupacao_final: round(ocupacao_final, 1),
            dimensoes_otimizadas: `${Math.round(dim_x_otimizado)}×${Math.round(dim_y_otimizado)}×${Math.round(dim_z_otimizado)}mm`,
            dimensoes_array: [dim_x_otimizado, dim_y_otimizado, dim_z_otimizado],
            percentual_variacao: round(percentual_variacao, 1),
            variacao_volume: round(volume_produto_otimizado - volume_produto_atual, 2),
            volume_preenchimento: round(volume_vazio_total, 2),
            preenchimento_papel_atual_m: round(this.preenchimento_papel_m, 2),
            preenchimento_papel_100_m: round(preenchimento_papel_100_m, 2),
            preenchimento_papel_meta_m: round(preenchimento_papel_meta_m, 2),
            economia_papel_m: round(economia_papel_m, 2),
            valor: this.valor,
            valor_nova_caixa: valor_nova_caixa,
            custo_papel_atual: round(custo_papel_atual, 2),
            custo_papel_nova_caixa: round(custo_papel_nova_caixa, 2),
            economia_custo_papel: round(economia_custo_papel, 2),
            valor_baseline: round(valor_baseline, 2),
            custo_total_baseline: round(valor_baseline + custo_papel_atual, 2),
            custo_total_atual: round(this.valor + custo_papel_atual, 2),
            custo_total_nova_caixa: round((valor_nova_caixa || this.valor) + custo_papel_nova_caixa, 2),
            economia_total: round((this.valor + custo_papel_atual) - ((valor_nova_caixa || this.valor) + custo_papel_nova_caixa), 2),
        };
    }

    _buscarValorNovaCaixa(dim_x, dim_y, dim_z) {
        let melhor_match = null;
        let menor_diferenca = Infinity;

        for (const nova_caixa of NOVAS_CAIXAS) {
            const dims = nova_caixa.dims;
            const diferenca = Math.abs(dim_x - dims[0]) + Math.abs(dim_y - dims[1]) + Math.abs(dim_z - dims[2]);

            if (diferenca < menor_diferenca) {
                menor_diferenca = diferenca;
                melhor_match = nova_caixa;
            }
        }

        if (melhor_match && menor_diferenca < 100) {
            return melhor_match.valor;
        }
        return null;
    }

    _buscarValorBaseline() {
        for (const baseline of BASELINE) {
            if (baseline.nome === this.nome) {
                return baseline.valor;
            }
        }
        return this.valor;
    }
}

// =====================================================
// UTILIDADES
// =====================================================
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// =====================================================
// INSTÂNCIAS DAS CAIXAS
// =====================================================
const caixasInstances = CAIXAS.map(c =>
    new Caixa(c.nome, c.dims[0], c.dims[1], c.dims[2], c.ocupacao_atual, c.preenchimento_papel_m, c.valor || 0.0)
);

// =====================================================
// NAVEGAÇÃO DE ABAS
// =====================================================
function mudarAba(abaId, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));

    document.getElementById(abaId).classList.add('active');
    if (btn) {
        btn.classList.add('active');
    }

    if (abaId === 'analise-comparativa') {
        populaCaixasCheckboxes();
    }
}

// =====================================================
// ANÁLISE INDIVIDUAL
// =====================================================
function atualizarOcupacao() {
    const select = document.getElementById('caixa');
    const opcao = select.options[select.selectedIndex];
    const camposPersonalizados = document.getElementById('campos-personalizados');

    if (opcao.value === 'personalizada') {
        camposPersonalizados.style.display = 'block';
        document.getElementById('ocupacao_atual').value = 25;
        document.getElementById('papel_atual').value = 2.5;
    } else {
        camposPersonalizados.style.display = 'none';
        if (opcao.value) {
            const ocupacao = opcao.getAttribute('data-ocupacao');
            const papel = opcao.getAttribute('data-papel');
            document.getElementById('ocupacao_atual').value = ocupacao || 25;
            document.getElementById('papel_atual').value = papel || 2.5;
        }
    }
}

function calcular() {
    const caixaSelect = document.getElementById('caixa').value;
    const meta_input = document.getElementById('meta').value;
    const meta = meta_input ? parseInt(meta_input) / 100 : 0.80;
    const largura_minima_input = document.getElementById('largura_minima').value;
    let largura_minima = largura_minima_input ? parseInt(largura_minima_input) : null;

    // Aplicar largura mínima para caixas pequenas
    if (caixaSelect === 'Caixa Alfa' || caixaSelect === 'Caixa Delta') {
        largura_minima = largura_minima || 140;
    }

    const ocupacao_atual_input = document.getElementById('ocupacao_atual').value;
    const ocupacao_atual = ocupacao_atual_input ? parseInt(ocupacao_atual_input) / 100 : 0.25;

    const papel_atual_input = document.getElementById('papel_atual').value;
    const papel_atual = papel_atual_input ? parseFloat(papel_atual_input) : 2.5;

    if (!caixaSelect) {
        document.getElementById('resultado').innerHTML = '<div class="empty-state">Selecione uma caixa para continuar</div>';
        return;
    }

    let caixa;

    if (caixaSelect === 'personalizada') {
        const comp = document.getElementById('comp_personalizado').value;
        const larg = document.getElementById('larg_personalizado').value;
        const alt = document.getElementById('alt_personalizado').value;

        if (!comp || !larg || !alt) {
            document.getElementById('resultado').innerHTML = '<div class="resultado error"><h3>Erro</h3>Preencha todas as dimensões da caixa personalizada</div>';
            return;
        }

        caixa = new Caixa('Caixa Personalizada', parseInt(comp), parseInt(larg), parseInt(alt), ocupacao_atual, papel_atual, 0);
    } else {
        caixa = caixasInstances.find(c => c.nome === caixaSelect);
        if (!caixa) {
            document.getElementById('resultado').innerHTML = '<div class="resultado error"><h3>Erro</h3>Caixa não encontrada</div>';
            return;
        }
        // Atualizar valores variáveis temporariamente
        caixa = new Caixa(caixa.nome, caixa.comprimento, caixa.largura, caixa.altura,
            ocupacao_atual >= 0 ? ocupacao_atual : caixa.ocupacao_atual,
            papel_atual >= 0 ? papel_atual : caixa.preenchimento_papel_m,
            caixa.valor
        );
    }

    const data = caixa.calcularDimensoesOtimizadas(meta, largura_minima);
    const quantidade_caixas = parseInt(document.getElementById('quantidade_caixas').value) || 100;

    data.quantidade_caixas = quantidade_caixas;
    data.custo_total_baseline_quantidade = data.custo_total_baseline * quantidade_caixas;
    data.custo_total_atual_quantidade = data.custo_total_atual * quantidade_caixas;
    data.custo_total_nova_caixa_quantidade = data.custo_total_nova_caixa * quantidade_caixas;
    data.economia_total_quantidade = data.economia_total * quantidade_caixas;

    exibirResultadoIndividual(data);
}

function exibirResultadoIndividual(data) {
    const aviso = data.ocupacao_atual < 50 ?
        '<div class="aviso">A caixa tem baixa ocupação atualmente. As dimensões otimizadas podem aumentar significativamente.</div>' :
        data.percentual_variacao > 30 ?
        '<div class="aviso">Aumento de dimensões acima de 30%. Verifique a viabilidade operacional.</div>' :
        '';

    const html = `
        <div class="resultado">
            <h3>Análise da ${data.nome_caixa}</h3>
            <div class="resultado-grid">
                <div class="info-box">
                    <div class="info-label">Caixa (Dimensões)</div>
                    <div class="info-value">${data.dimensoes_caixa}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Valor da Caixa</div>
                    <div class="info-value" style="color: #2e7d32;">R$ ${formatarMoeda(data.valor)}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Caixa (Volume)</div>
                    <div class="info-value">${data.volume_caixa} cm³</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Ocupação Atual</div>
                    <div class="info-value">${data.ocupacao_atual}%</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Volume Atual do Produto</div>
                    <div class="info-value">${data.volume_produto_atual} cm³</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Dimensões Otimizadas</div>
                    <div class="info-value">${data.dimensoes_otimizadas}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Volume Otimizado (80%)</div>
                    <div class="info-value">${data.volume_produto_otimizado} cm³</div>
                </div>
                <div class="info-box" style="background: #f3e5f5;">
                    <div class="info-label">Volume Total da Caixa Otimizada</div>
                    <div class="info-value" style="color: #6a1b9a;">${data.volume_caixa_otimizada} cm³</div>
                </div>
                ${data.valor_nova_caixa ? `
                <div class="info-box" style="background: #e8f5e9; border-left: 4px solid #51cf66;">
                    <div class="info-label" style="font-weight: bold; color: #2e7d32;">Valor da Nova Caixa (Otimizada)</div>
                    <div class="info-value" style="color: #2e7d32; font-size: 1.3em;">R$ ${formatarMoeda(data.valor_nova_caixa)}</div>
                </div>` : ''}
                <div class="info-box" style="background: #fff3e0;">
                    <div class="info-label">Volume Preenchimento para 100%</div>
                    <div class="info-value" style="color: #e65100;">${data.volume_preenchimento} cm³</div>
                </div>
            </div>

            <!-- Seção Papel -->
            <div style="border-top: 2px solid #eee; margin-top: 15px; padding-top: 15px;">
                <div class="info-label" style="font-size: 1.1em; font-weight: bold; margin-bottom: 15px; color: #555;">Papel Necessário para a Caixa Otimizada:</div>
                <div class="resultado-grid">
                    <div class="info-box">
                        <div class="info-label">Papel Atual (Caixa Original)</div>
                        <div class="info-value">${data.preenchimento_papel_atual_m} m</div>
                    </div>
                    <div class="info-box" style="background: #fff9c4; border-left: 4px solid #fbc02d;">
                        <div class="info-label" style="font-weight: bold; color: #f57f17;">Para Completar 100% da Caixa Nova</div>
                        <div class="info-value" style="color: #f57f17;">${data.preenchimento_papel_100_m} m</div>
                    </div>
                    <div class="info-box" style="background: #e8f5e9;">
                        <div class="info-label" style="font-weight: bold;">Economia de Papel</div>
                        <div class="info-value" style="color: #2e7d32;">${data.economia_papel_m} m</div>
                    </div>
                </div>
            </div>

            <!-- Seção Custo do Papel -->
            <div style="border-top: 2px solid #eee; margin-top: 15px; padding-top: 15px;">
                <div class="info-label" style="font-size: 1.1em; font-weight: bold; margin-bottom: 15px; color: #555;">Custo do Papel (R$ ${formatarMoeda(VALOR_PAPEL_POR_METRO)} por metro):</div>
                <div class="resultado-grid">
                    <div class="info-box" style="background: #ffebee;">
                        <div class="info-label" style="font-weight: bold; color: #c62828;">Custo Atual</div>
                        <div class="info-value" style="color: #c62828;">R$ ${formatarMoeda(data.custo_papel_atual)}</div>
                    </div>
                    <div class="info-box" style="background: #c8e6c9;">
                        <div class="info-label" style="font-weight: bold; color: #2e7d32;">Custo Nova Caixa</div>
                        <div class="info-value" style="color: #2e7d32;">R$ ${formatarMoeda(data.custo_papel_nova_caixa)}</div>
                    </div>
                    <div class="info-box" style="background: #a5d6a7; border-left: 4px solid #2e7d32;">
                        <div class="info-label" style="font-weight: bold; color: #1b5e20;">Economia de Custo</div>
                        <div class="info-value" style="color: #1b5e20;">R$ ${formatarMoeda(data.economia_custo_papel)}</div>
                    </div>
                </div>
            </div>

            <!-- Comparativo Completo -->
            <div style="border-top: 3px solid #667eea; margin-top: 20px; padding-top: 20px; background: linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%); padding: 20px; border-radius: 5px;">
                <div class="info-label" style="font-size: 1.2em; font-weight: bold; margin-bottom: 20px; color: #333; text-align: center;">COMPARATIVO: BASELINE vs ATUAL vs NOVA</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #9c27b0;">
                        <div style="font-weight: bold; color: #6a1b9a; margin-bottom: 15px;">Baseline</div>
                        <div style="margin-bottom: 10px;"><div style="font-size: 0.9em; color: #666;">Valor da Caixa:</div><div style="font-size: 1.1em; font-weight: 600;">R$ ${formatarMoeda(data.valor_baseline)}</div></div>
                        <div style="margin-bottom: 10px;"><div style="font-size: 0.9em; color: #666;">Custo do Papel:</div><div style="font-size: 1.1em; font-weight: 600;">R$ ${formatarMoeda(data.custo_papel_atual)}</div></div>
                        <div style="border-top: 2px solid #eee; padding-top: 10px; margin-top: 10px;"><div style="font-size: 0.9em; color: #999;">TOTAL:</div><div style="font-size: 1.3em; font-weight: bold; color: #6a1b9a;">R$ ${formatarMoeda(data.custo_total_baseline)}</div></div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ff6b6b;">
                        <div style="font-weight: bold; color: #d32f2f; margin-bottom: 15px;">Caixa Atual</div>
                        <div style="margin-bottom: 10px;"><div style="font-size: 0.9em; color: #666;">Valor da Caixa:</div><div style="font-size: 1.1em; font-weight: 600;">R$ ${formatarMoeda(data.valor)}</div></div>
                        <div style="margin-bottom: 10px;"><div style="font-size: 0.9em; color: #666;">Custo do Papel:</div><div style="font-size: 1.1em; font-weight: 600;">R$ ${formatarMoeda(data.custo_papel_atual)}</div></div>
                        <div style="border-top: 2px solid #eee; padding-top: 10px; margin-top: 10px;"><div style="font-size: 0.9em; color: #999;">TOTAL:</div><div style="font-size: 1.3em; font-weight: bold; color: #d32f2f;">R$ ${formatarMoeda(data.custo_total_atual)}</div></div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #51cf66;">
                        <div style="font-weight: bold; color: #2e7d32; margin-bottom: 15px;">Nova Caixa (Otimizada)</div>
                        <div style="margin-bottom: 10px;"><div style="font-size: 0.9em; color: #666;">Valor da Caixa:</div><div style="font-size: 1.1em; font-weight: 600;">R$ ${data.valor_nova_caixa ? formatarMoeda(data.valor_nova_caixa) : 'N/A'}</div></div>
                        <div style="margin-bottom: 10px;"><div style="font-size: 0.9em; color: #666;">Custo do Papel:</div><div style="font-size: 1.1em; font-weight: 600;">R$ ${formatarMoeda(data.custo_papel_nova_caixa)}</div></div>
                        <div style="border-top: 2px solid #eee; padding-top: 10px; margin-top: 10px;"><div style="font-size: 0.9em; color: #999;">TOTAL:</div><div style="font-size: 1.3em; font-weight: bold; color: #2e7d32;">R$ ${formatarMoeda(data.custo_total_nova_caixa)}</div></div>
                    </div>
                </div>
                <div style="background: linear-gradient(135deg, #a5d6a7 0%, #81c784 100%); padding: 20px; border-radius: 5px; text-align: center;">
                    <div style="font-size: 0.95em; color: #1b5e20; margin-bottom: 8px; font-weight: 600;">ECONOMIA TOTAL POR CAIXA</div>
                    <div style="font-size: 2em; font-weight: bold; color: #1b5e20;">R$ ${formatarMoeda(data.economia_total)}</div>
                </div>

                <!-- Análise de custo por quantidade -->
                <div style="border-top: 3px solid #e94560; margin-top: 25px; padding-top: 20px;">
                    <div class="info-label" style="font-size: 1.2em; font-weight: bold; margin-bottom: 20px; color: #333; text-align: center;">ANÁLISE DE CUSTO PARA ${data.quantidade_caixas} CAIXAS</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                        <div style="background: #f3e5f5; padding: 20px; border-radius: 5px; border-left: 4px solid #9c27b0;">
                            <div style="font-weight: bold; color: #6a1b9a; margin-bottom: 15px;">Baseline</div>
                            <div style="margin-bottom: 12px;"><div style="font-size: 0.85em; color: #666;">Valor unitário:</div><div style="font-weight: 600;">R$ ${formatarMoeda(data.valor_baseline)}</div></div>
                            <div style="margin-bottom: 12px;"><div style="font-size: 0.85em; color: #666;">Quantidade:</div><div style="font-weight: 600;">${data.quantidade_caixas} caixas</div></div>
                            <div><div style="font-size: 0.85em; color: #666;">Custo total:</div><div style="font-size: 1.2em; font-weight: bold; color: #6a1b9a;">R$ ${formatarMoeda(data.custo_total_baseline_quantidade)}</div></div>
                        </div>
                        <div style="background: #fff3e0; padding: 20px; border-radius: 5px; border-left: 4px solid #ff6b6b;">
                            <div style="font-weight: bold; color: #d32f2f; margin-bottom: 15px;">Caixa Atual</div>
                            <div style="margin-bottom: 12px;"><div style="font-size: 0.85em; color: #666;">Valor unitário:</div><div style="font-weight: 600;">R$ ${formatarMoeda(data.valor)}</div></div>
                            <div style="margin-bottom: 12px;"><div style="font-size: 0.85em; color: #666;">Quantidade:</div><div style="font-weight: 600;">${data.quantidade_caixas} caixas</div></div>
                            <div><div style="font-size: 0.85em; color: #666;">Custo total:</div><div style="font-size: 1.2em; font-weight: bold; color: #d32f2f;">R$ ${formatarMoeda(data.custo_total_atual_quantidade)}</div></div>
                        </div>
                        <div style="background: #e8f5e9; padding: 20px; border-radius: 5px; border-left: 4px solid #51cf66;">
                            <div style="font-weight: bold; color: #2e7d32; margin-bottom: 15px;">Nova Caixa</div>
                            <div style="margin-bottom: 12px;"><div style="font-size: 0.85em; color: #666;">Valor unitário:</div><div style="font-weight: 600;">R$ ${data.valor_nova_caixa ? formatarMoeda(data.valor_nova_caixa) : 'N/A'}</div></div>
                            <div style="margin-bottom: 12px;"><div style="font-size: 0.85em; color: #666;">Quantidade:</div><div style="font-weight: 600;">${data.quantidade_caixas} caixas</div></div>
                            <div><div style="font-size: 0.85em; color: #666;">Custo total:</div><div style="font-size: 1.2em; font-weight: bold; color: #2e7d32;">R$ ${formatarMoeda(data.custo_total_nova_caixa_quantidade)}</div></div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #e94560 0%, #d63851 100%); padding: 20px; border-radius: 5px; text-align: center; margin-top: 20px;">
                        <div style="font-size: 1em; color: white; margin-bottom: 10px; font-weight: 600;">ECONOMIA TOTAL COM ${data.quantidade_caixas} CAIXAS</div>
                        <div style="font-size: 2.2em; font-weight: bold; color: white;">R$ ${formatarMoeda(data.economia_total_quantidade)}</div>
                    </div>
                </div>
            </div>
            ${aviso}
        </div>
    `;

    document.getElementById('resultado').innerHTML = html;
}

// =====================================================
// ANÁLISE COMPARATIVA
// =====================================================
function populaCaixasCheckboxes() {
    const container = document.getElementById('caixas-checkboxes');
    const quantidadesContainer = document.getElementById('quantidades-container');

    container.innerHTML = '';
    quantidadesContainer.innerHTML = '';

    CAIXAS.forEach(caixaData => {
        // Checkbox
        const wrapper = document.createElement('label');
        wrapper.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = caixaData.nome;
        checkbox.className = 'caixa-checkbox';
        checkbox.onchange = atualizarQuantidadesVisiveis;

        const label = document.createElement('div');
        label.className = 'checkbox-label';

        const nome = document.createElement('span');
        nome.className = 'nome';
        nome.textContent = caixaData.nome;

        const dims = document.createElement('span');
        dims.className = 'dims';
        dims.textContent = `${caixaData.dims[0]}×${caixaData.dims[1]}×${caixaData.dims[2]}mm`;

        label.appendChild(nome);
        label.appendChild(dims);
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        container.appendChild(wrapper);

        // Quantidade
        const quantidadeItem = document.createElement('div');
        quantidadeItem.className = 'quantidade-item';
        quantidadeItem.id = 'qtd-' + caixaData.nome;
        quantidadeItem.style.display = 'none';

        const nomeSpan = document.createElement('span');
        nomeSpan.className = 'quantidade-item-nome';
        nomeSpan.textContent = caixaData.nome;

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'quantidade-input';
        input.value = '100';
        input.min = '1';
        input.step = '1';
        input.dataset.caixa = caixaData.nome;

        quantidadeItem.appendChild(nomeSpan);
        quantidadeItem.appendChild(input);
        quantidadesContainer.appendChild(quantidadeItem);
    });
}

function atualizarQuantidadesVisiveis() {
    document.querySelectorAll('.caixa-checkbox').forEach(checkbox => {
        const qtdElement = document.getElementById('qtd-' + checkbox.value);
        if (qtdElement) {
            qtdElement.style.display = checkbox.checked ? 'flex' : 'none';
        }
    });
}

function selecionarTodas() {
    document.querySelectorAll('.caixa-checkbox').forEach(cb => { cb.checked = true; });
    atualizarQuantidadesVisiveis();
}

function limparSelecao() {
    document.querySelectorAll('.caixa-checkbox').forEach(cb => { cb.checked = false; });
    atualizarQuantidadesVisiveis();
}

function compararCaixas() {
    const caixasComQuantidades = {};
    document.querySelectorAll('.caixa-checkbox:checked').forEach(cb => {
        const quantidadeInput = document.querySelector('input[data-caixa="' + cb.value + '"]');
        const quantidade = quantidadeInput ? parseInt(quantidadeInput.value) || 100 : 100;
        caixasComQuantidades[cb.value] = quantidade;
    });

    if (Object.keys(caixasComQuantidades).length === 0) {
        alert('Selecione pelo menos uma caixa para comparar.');
        return;
    }

    const meta_input = document.getElementById('meta_comparativa').value;
    const meta = meta_input ? parseInt(meta_input) / 100 : 0.80;
    const largura_minima_input = document.getElementById('largura_minima_comparativa').value;
    let largura_minima = largura_minima_input ? parseInt(largura_minima_input) : null;

    if ('Caixa Alfa' in caixasComQuantidades) {
        largura_minima = largura_minima || 140;
    }

    // Cálculo local (sem API)
    const resultados = [];
    let custo_total_baseline_geral = 0;
    let custo_total_atual_geral = 0;
    let custo_total_otimizado_geral = 0;
    let economia_total_geral = 0;

    for (const [nome_caixa, quantidade] of Object.entries(caixasComQuantidades)) {
        const caixaData = CAIXAS.find(c => c.nome === nome_caixa);
        if (!caixaData) continue;

        const caixa = new Caixa(caixaData.nome, caixaData.dims[0], caixaData.dims[1], caixaData.dims[2],
            caixaData.ocupacao_atual, caixaData.preenchimento_papel_m, caixaData.valor || 0.0);

        // Aplicar largura mínima apenas para certas caixas
        let largura_minima_caixa = largura_minima;
        if (nome_caixa !== 'Caixa Alfa' && nome_caixa !== 'Caixa Delta') {
            largura_minima_caixa = null;
        }

        const valor_unitario_atual = caixa.valor;
        const valor_total_atual = valor_unitario_atual * quantidade;
        const volume_atual = (caixa.comprimento * caixa.largura * caixa.altura) / 1000;

        const resultado_otimizado = caixa.calcularDimensoesOtimizadas(meta, largura_minima_caixa);

        const valor_baseline = caixa._buscarValorBaseline();
        const valor_total_baseline = valor_baseline * quantidade;
        const custo_papel_baseline = resultado_otimizado.custo_papel_atual;
        const custo_total_baseline = valor_total_baseline + (custo_papel_baseline * quantidade);

        const dims_otimizadas = resultado_otimizado.dimensoes_array;
        const volume_otimizado = (dims_otimizadas[0] * dims_otimizadas[1] * dims_otimizadas[2]) / 1000;

        const valor_unitario_otimizado = resultado_otimizado.valor_nova_caixa || caixa.valor;
        const valor_total_otimizado = valor_unitario_otimizado * quantidade;

        const custo_papel_atual = resultado_otimizado.custo_papel_atual;
        const custo_papel_nova_caixa = resultado_otimizado.custo_papel_nova_caixa;
        const economia_custo_papel = resultado_otimizado.economia_custo_papel;

        const custo_total_atual = valor_total_atual + (custo_papel_atual * quantidade);
        const custo_total_otimizado = valor_total_otimizado + (custo_papel_nova_caixa * quantidade);
        const economia_quantidade = custo_total_atual - custo_total_otimizado;

        custo_total_baseline_geral += custo_total_baseline;
        custo_total_atual_geral += custo_total_atual;
        custo_total_otimizado_geral += custo_total_otimizado;
        economia_total_geral += economia_quantidade;

        resultados.push({
            nome: caixa.nome,
            quantidade: quantidade,
            valor_baseline: valor_baseline,
            valor_total_baseline: valor_total_baseline,
            custo_papel_baseline: custo_papel_baseline,
            custo_total_baseline: custo_total_baseline,
            dims_atual: [caixa.comprimento, caixa.largura, caixa.altura],
            valor_atual: valor_unitario_atual,
            valor_total_atual: valor_total_atual,
            volume_atual: volume_atual,
            ocupacao_atual: caixa.ocupacao_atual * 100,
            preenchimento_papel_atual_m: resultado_otimizado.preenchimento_papel_atual_m,
            custo_papel_atual: custo_papel_atual,
            custo_total_atual: custo_total_atual,
            dims_otimizada: dims_otimizadas,
            valor_otimizado: valor_unitario_otimizado,
            valor_total_otimizado: valor_total_otimizado,
            volume_otimizado: volume_otimizado,
            ocupacao_otimizada: resultado_otimizado.ocupacao_final,
            preenchimento_papel_otimizado_m: resultado_otimizado.preenchimento_papel_100_m,
            custo_papel_otimizado: custo_papel_nova_caixa,
            custo_total_otimizado: custo_total_otimizado,
            reducao_volume: volume_atual > 0 ? ((volume_atual - volume_otimizado) / volume_atual * 100) : 0,
            economia_custo_papel: economia_custo_papel * quantidade,
            economia_quantidade: economia_quantidade
        });
    }

    const percentual_economia = custo_total_atual_geral > 0 ? (economia_total_geral / custo_total_atual_geral * 100) : 0;
    const economia_baseline_vs_otimizado = custo_total_baseline_geral - custo_total_otimizado_geral;
    const economia_atual_vs_otimizado = custo_total_atual_geral - custo_total_otimizado_geral;
    const percentual_economia_baseline = custo_total_baseline_geral > 0 ? (economia_baseline_vs_otimizado / custo_total_baseline_geral * 100) : 0;

    const data = {
        caixas: resultados,
        custo_total_baseline: custo_total_baseline_geral,
        custo_total_atual: custo_total_atual_geral,
        custo_total_otimizado: custo_total_otimizado_geral,
        economia_total_geral: economia_total_geral,
        economia_baseline_vs_otimizado: economia_baseline_vs_otimizado,
        economia_atual_vs_otimizado: economia_atual_vs_otimizado,
        percentual_economia: percentual_economia,
        percentual_economia_baseline: percentual_economia_baseline
    };

    exibirComparacao(data);
}

function exibirComparacao(data) {
    const resultadoDiv = document.getElementById('resultado-comparativo');

    if (!data || !data.caixas || data.caixas.length === 0) {
        resultadoDiv.innerHTML = '<p>Erro ao obter dados das caixas.</p>';
        return;
    }

    let html = '<div class="resultado-comparativo">';
    html += '<h3 style="color: #e94560; margin-bottom: 20px;">Análise Comparativa Detalhada</h3>';

    data.caixas.forEach((caixa, index) => {
        const quantidade = caixa.quantidade || 100;
        html += '<div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #e94560;">';
        html += '<h4 style="margin: 0 0 15px 0; color: #333;">' + (index + 1) + '. ' + caixa.nome + ' - ' + quantidade.toLocaleString('pt-BR') + ' unidades</h4>';

        html += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 15px;">';

        // Baseline
        html += '<div style="background: white; padding: 15px; border-radius: 3px; border: 1px solid #ddd;">';
        html += '<h5 style="margin: 0 0 10px 0; color: #6a1b9a; font-size: 0.95em;">BASELINE</h5>';
        html += '<table style="width: 100%; font-size: 0.9em; color: #555;">';
        html += '<tr><td><strong>Papel (m):</strong></td><td>' + caixa.preenchimento_papel_atual_m.toFixed(2) + ' m</td></tr>';
        html += '<tr><td><strong>Caixa:</strong></td><td>R$ ' + formatarMoeda(caixa.valor_baseline) + '</td></tr>';
        html += '<tr><td><strong>Papel:</strong></td><td>R$ ' + formatarMoeda(caixa.custo_papel_baseline) + '</td></tr>';
        html += '<tr><td><strong>Total Unit.:</strong></td><td style="color: #6a1b9a; font-weight: 600;">R$ ' + formatarMoeda(caixa.valor_baseline + caixa.custo_papel_baseline) + '</td></tr>';
        html += '<tr style="background: #f3e5f5; font-weight: 600;"><td><strong>Total (' + quantidade.toLocaleString('pt-BR') + '):</strong></td><td style="color: #6a1b9a;">R$ ' + formatarMoeda(caixa.custo_total_baseline) + '</td></tr>';
        html += '</table></div>';

        // Atual
        html += '<div style="background: white; padding: 15px; border-radius: 3px; border: 1px solid #ddd;">';
        html += '<h5 style="margin: 0 0 10px 0; color: #333; font-size: 0.95em;">CAIXA ATUAL</h5>';
        html += '<table style="width: 100%; font-size: 0.9em; color: #555;">';
        html += '<tr><td><strong>Dimensões:</strong></td><td>' + caixa.dims_atual[0] + '×' + caixa.dims_atual[1] + '×' + caixa.dims_atual[2] + ' mm</td></tr>';
        html += '<tr><td><strong>Ocupação:</strong></td><td>' + caixa.ocupacao_atual.toFixed(1) + '%</td></tr>';
        html += '<tr><td><strong>Papel (m):</strong></td><td>' + caixa.preenchimento_papel_atual_m.toFixed(2) + ' m</td></tr>';
        html += '<tr><td><strong>Caixa:</strong></td><td>R$ ' + formatarMoeda(caixa.valor_atual) + '</td></tr>';
        html += '<tr><td><strong>Papel:</strong></td><td>R$ ' + formatarMoeda(caixa.custo_papel_atual) + '</td></tr>';
        html += '<tr style="background: #e3f2fd; font-weight: 600;"><td><strong>Total (' + quantidade.toLocaleString('pt-BR') + '):</strong></td><td style="color: #0d47a1;">R$ ' + formatarMoeda(caixa.custo_total_atual) + '</td></tr>';
        html += '</table></div>';

        // Otimizada
        html += '<div style="background: white; padding: 15px; border-radius: 3px; border: 1px solid #ddd;">';
        html += '<h5 style="margin: 0 0 10px 0; color: #2d5016; font-size: 0.95em;">CAIXA OTIMIZADA</h5>';
        html += '<table style="width: 100%; font-size: 0.9em; color: #555;">';
        html += '<tr><td><strong>Dimensões:</strong></td><td>' + Math.round(caixa.dims_otimizada[0]) + '×' + Math.round(caixa.dims_otimizada[1]) + '×' + Math.round(caixa.dims_otimizada[2]) + ' mm</td></tr>';
        html += '<tr><td><strong>Ocupação:</strong></td><td>' + caixa.ocupacao_otimizada.toFixed(1) + '%</td></tr>';
        html += '<tr><td><strong>Papel (m):</strong></td><td>' + caixa.preenchimento_papel_otimizado_m.toFixed(2) + ' m</td></tr>';
        html += '<tr><td><strong>Caixa:</strong></td><td>R$ ' + formatarMoeda(caixa.valor_otimizado) + '</td></tr>';
        html += '<tr><td><strong>Papel:</strong></td><td>R$ ' + formatarMoeda(caixa.custo_papel_otimizado) + '</td></tr>';
        html += '<tr style="background: #e8f5e9; font-weight: 600;"><td><strong>Total (' + quantidade.toLocaleString('pt-BR') + '):</strong></td><td style="color: #2d5016;">R$ ' + formatarMoeda(caixa.custo_total_otimizado) + '</td></tr>';
        html += '</table></div>';

        html += '</div></div>';
    });

    // Resumo geral
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px;">';

    html += '<div style="background: #f3e5f5; padding: 20px; border-radius: 5px; border-left: 4px solid #9c27b0;">';
    html += '<h4 style="margin: 0 0 10px 0; color: #6a1b9a;">Baseline Total</h4>';
    html += '<div style="font-size: 1.8em; font-weight: bold; color: #6a1b9a;">R$ ' + formatarMoeda(data.custo_total_baseline) + '</div>';
    html += '</div>';

    html += '<div style="background: #fff3e0; padding: 20px; border-radius: 5px; border-left: 4px solid #ff6b6b;">';
    html += '<h4 style="margin: 0 0 10px 0; color: #d32f2f;">Caixa Atual Total</h4>';
    html += '<div style="font-size: 1.8em; font-weight: bold; color: #d32f2f;">R$ ' + formatarMoeda(data.custo_total_atual) + '</div>';
    html += '</div>';

    html += '<div style="background: #e8f5e9; padding: 20px; border-radius: 5px; border-left: 4px solid #2d5016;">';
    html += '<h4 style="margin: 0 0 10px 0; color: #2d5016;">Caixa Otimizada Total</h4>';
    html += '<div style="font-size: 1.8em; font-weight: bold; color: #2d5016;">R$ ' + formatarMoeda(data.custo_total_otimizado) + '</div>';
    html += '</div>';

    html += '</div>';

    // Economia
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">';

    html += '<div style="background: #e8f5e9; padding: 20px; border-radius: 5px; border: 2px solid #2d5016;">';
    html += '<h4 style="margin: 0 0 10px 0; color: #1b5e20;">Economia: Baseline vs Otimizado</h4>';
    html += '<div style="font-size: 2em; font-weight: bold; color: #1b5e20;">R$ ' + formatarMoeda(data.economia_baseline_vs_otimizado) + '</div>';
    html += '<div style="font-size: 1.2em; color: #2d5016; margin-top: 10px;">-' + data.percentual_economia_baseline.toFixed(2) + '%</div>';
    html += '</div>';

    html += '<div style="background: #e3f2fd; padding: 20px; border-radius: 5px; border: 2px solid #1976d2;">';
    html += '<h4 style="margin: 0 0 10px 0; color: #0d47a1;">Economia: Atual vs Otimizado</h4>';
    html += '<div style="font-size: 2em; font-weight: bold; color: #0d47a1;">R$ ' + formatarMoeda(data.economia_atual_vs_otimizado) + '</div>';
    const pctAtualVsOtim = data.custo_total_atual > 0 ? ((data.economia_atual_vs_otimizado / data.custo_total_atual) * 100).toFixed(2) : '0.00';
    html += '<div style="font-size: 1.2em; color: #1976d2; margin-top: 10px;">-' + pctAtualVsOtim + '%</div>';
    html += '</div>';

    html += '</div></div>';

    resultadoDiv.innerHTML = html;
}
