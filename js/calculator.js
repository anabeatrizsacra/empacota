// ============================================================
// calculator.js — Caixa class (port of Python Caixa class)
// ============================================================

class Caixa {
    constructor(nome, comprimento, largura, altura, ocupacaoAtual, preenchimentoPapelM = 0.0, valor = 0.0) {
        this.nome = nome;
        this.comprimento = comprimento;
        this.largura = largura;
        this.altura = altura;
        this.ocupacaoAtual = ocupacaoAtual;
        this.preenchimentoPapelM = preenchimentoPapelM;
        this.valor = valor;
        this.volumeTotal = (comprimento * largura * altura) / 1000; // em cm³
        this.VALOR_PAPEL_POR_METRO = 0.40; // R$ por metro
    }

    /**
     * Calcula as dimensões otimizadas para UMA ÚNICA CAIXA atingir X% de ocupação
     * @param {number} metaOcupacao - Meta de ocupação (0-1), default 0.80
     * @param {number|null} larguraMinima - Largura mínima em mm, null para desativar
     * @returns {object} Resultado com 24+ campos
     */
    calcularDimensoesOtimizadas(metaOcupacao = 0.80, larguraMinima = null) {
        if (metaOcupacao === null || metaOcupacao === undefined) {
            metaOcupacao = 0.80;
        }

        // Volume atual do PRODUTO baseado na ocupação atual da caixa
        const volumeCaixaCm3 = this.volumeTotal;
        const volumeProdutoAtual = volumeCaixaCm3 * this.ocupacaoAtual;

        // Nova caixa otimizada: volume_produto_atual = meta_ocupacao * volume_caixa_otimizada
        const volumeCaixaOtimizada = volumeProdutoAtual / metaOcupacao;

        // Fator de escala (cube root)
        const scaleTarget = Math.pow(volumeCaixaOtimizada / volumeCaixaCm3, 1 / 3);

        // Dimensões otimizadas mantendo proporções
        let dimXOtimizado = this.comprimento * scaleTarget;
        let dimYOtimizado = this.largura * scaleTarget;
        let dimZOtimizado = this.altura * scaleTarget;

        let volumeFinal;

        // Aplicar restrição de largura mínima SE fornecida
        if (larguraMinima !== null && larguraMinima !== undefined && dimYOtimizado < larguraMinima) {
            const razaoAjuste = larguraMinima / dimYOtimizado;
            dimXOtimizado = dimXOtimizado * razaoAjuste;
            dimYOtimizado = larguraMinima;
            dimZOtimizado = dimZOtimizado * razaoAjuste;

            volumeFinal = (dimXOtimizado * dimYOtimizado * dimZOtimizado) / 1000;
        } else {
            volumeFinal = (dimXOtimizado * dimYOtimizado * dimZOtimizado) / 1000;
        }

        // Volume do produto na caixa otimizada (mesmo volume)
        const volumeProdutoOtimizado = volumeProdutoAtual;

        // Ocupação final
        const ocupacaoFinal = (volumeProdutoOtimizado / volumeFinal) * 100;

        // Volume vazio total da caixa otimizada
        const volumeVazioTotal = volumeFinal - volumeProdutoOtimizado;

        // Preenchimento de papel
        let densidadePapelCm3PorM = 0;
        let preenchimentoPapel100M = 0.0;
        let preenchimentoPapelMetaM = 0.0;
        let economiaPapelM = 0.0;
        let volumeVazioAtual = 0;

        if (this.ocupacaoAtual > 0) {
            volumeVazioAtual = volumeCaixaCm3 * (1 - this.ocupacaoAtual);

            if (this.preenchimentoPapelM > 0) {
                densidadePapelCm3PorM = volumeVazioAtual / this.preenchimentoPapelM;
            }

            const volumeVazioPara100 = volumeVazioTotal;

            if (densidadePapelCm3PorM > 0) {
                preenchimentoPapel100M = volumeVazioPara100 / densidadePapelCm3PorM;
            }

            const volumeVazioMeta = volumeFinal * (1 - metaOcupacao);

            if (densidadePapelCm3PorM > 0) {
                preenchimentoPapelMetaM = volumeVazioMeta / densidadePapelCm3PorM;
            }

            economiaPapelM = this.preenchimentoPapelM - preenchimentoPapelMetaM;
        }

        // Custos do papel
        const custoPapelAtual = this.preenchimentoPapelM * this.VALOR_PAPEL_POR_METRO;
        const custoPapelNovaCaixa = preenchimentoPapel100M * this.VALOR_PAPEL_POR_METRO;
        const economiaCustoPapel = custoPapelAtual - custoPapelNovaCaixa;

        // Variação percentual
        let percentualVariacao;
        if (volumeProdutoAtual > 0) {
            percentualVariacao = ((volumeFinal - volumeProdutoAtual) / volumeProdutoAtual) * 100;
        } else {
            percentualVariacao = ((volumeFinal - volumeProdutoOtimizado) / volumeProdutoOtimizado) * 100;
        }

        const valorNovaCaixa = this._buscarValorNovaCaixa(dimXOtimizado, dimYOtimizado, dimZOtimizado);
        const valorBaseline = this._buscarValorBaseline();

        return {
            nome_caixa: this.nome,
            dimensoes_caixa: `${this.comprimento}×${this.largura}×${this.altura}mm`,
            volume_caixa: this._round(volumeCaixaCm3, 2),
            ocupacao_atual: this._round(this.ocupacaoAtual * 100, 1),
            volume_produto_atual: this._round(volumeProdutoAtual, 2),
            volume_produto_otimizado: this._round(volumeProdutoOtimizado, 2),
            volume_caixa_otimizada: this._round(volumeFinal, 2),
            ocupacao_final: this._round(ocupacaoFinal, 1),
            dimensoes_otimizadas: `${Math.round(dimXOtimizado)}×${Math.round(dimYOtimizado)}×${Math.round(dimZOtimizado)}mm`,
            dimensoes_array: [dimXOtimizado, dimYOtimizado, dimZOtimizado],
            percentual_variacao: this._round(percentualVariacao, 1),
            variacao_volume: this._round(volumeProdutoOtimizado - volumeProdutoAtual, 2),
            volume_preenchimento: this._round(volumeVazioTotal, 2),
            preenchimento_papel_atual_m: this._round(this.preenchimentoPapelM, 2),
            preenchimento_papel_100_m: this._round(preenchimentoPapel100M, 2),
            preenchimento_papel_meta_m: this._round(preenchimentoPapelMetaM, 2),
            economia_papel_m: this._round(economiaPapelM, 2),
            valor: this.valor,
            valor_nova_caixa: valorNovaCaixa,
            custo_papel_atual: this._round(custoPapelAtual, 2),
            custo_papel_nova_caixa: this._round(custoPapelNovaCaixa, 2),
            economia_custo_papel: this._round(economiaCustoPapel, 2),
            valor_baseline: this._round(valorBaseline, 2),
            custo_total_baseline: this._round(valorBaseline + custoPapelAtual, 2),
            custo_total_atual: this._round(this.valor + custoPapelAtual, 2),
            custo_total_nova_caixa: this._round((valorNovaCaixa || this.valor) + custoPapelNovaCaixa, 2),
            economia_total: this._round(
                (this.valor + custoPapelAtual) - ((valorNovaCaixa || this.valor) + custoPapelNovaCaixa), 2
            ),
        };
    }

    /**
     * Busca o valor da nova caixa otimizada por proximidade de dimensões
     */
    _buscarValorNovaCaixa(dimX, dimY, dimZ) {
        let melhorMatch = null;
        let menorDiferenca = Infinity;

        for (const novaCaixa of NOVAS_CAIXAS) {
            const dims = novaCaixa.dims;
            const diferenca = Math.abs(dimX - dims[0]) + Math.abs(dimY - dims[1]) + Math.abs(dimZ - dims[2]);

            if (diferenca < menorDiferenca) {
                menorDiferenca = diferenca;
                melhorMatch = novaCaixa;
            }
        }

        if (melhorMatch && menorDiferenca < 100) {
            return melhorMatch.valor;
        }

        return null;
    }

    /**
     * Busca o valor de baseline para esta caixa
     */
    _buscarValorBaseline() {
        for (const baseline of BASELINE) {
            if (baseline.nome === this.nome) {
                return baseline.valor;
            }
        }
        return this.valor;
    }

    /**
     * Equivalent of Python's round(value, decimals)
     */
    _round(value, decimals) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }
}


// ============================================================
// Comparative analysis (mirrors /api/comparar-caixas)
// ============================================================

/**
 * Compara múltiplas caixas atuais vs otimizadas com análise completa
 * @param {object} caixasQuantidades - { "Caixa P": 100, "Caixa M": 200, ... }
 * @param {number} metaOcupacao - Meta de ocupação (0-1)
 * @param {number|null} larguraMinima - Largura mínima em mm
 * @returns {object} Resultados da comparação
 */
function compararCaixasCalc(caixasQuantidades, metaOcupacao = 0.80, larguraMinima = null) {
    const resultados = [];
    let custoTotalBaselineGeral = 0;
    let custoTotalAtualGeral = 0;
    let custoTotalOtimizadoGeral = 0;
    let economiaTotalGeral = 0;

    for (const [nomeCaixa, quantidade] of Object.entries(caixasQuantidades)) {
        const qty = (Number.isInteger(quantidade) && quantidade > 0) ? quantidade : 100;

        // Encontrar a caixa nos dados
        const caixaData = CAIXAS.find(c => c.nome === nomeCaixa);
        if (!caixaData) continue;

        // Aplicar largura mínima APENAS para Caixa P e Caixa PH
        let larguraMinimaCaixa = larguraMinima;
        if (nomeCaixa !== 'Caixa P' && nomeCaixa !== 'Caixa PH') {
            larguraMinimaCaixa = null;
        }

        // Instanciar caixa
        const caixa = new Caixa(
            caixaData.nome,
            caixaData.dims[0], caixaData.dims[1], caixaData.dims[2],
            caixaData.ocupacao_atual,
            caixaData.preenchimento_papel_m,
            caixaData.valor
        );

        // CAIXA ATUAL
        const valorUnitarioAtual = caixa.valor;
        const valorTotalAtual = valorUnitarioAtual * qty;
        const volumeAtual = (caixa.comprimento * caixa.largura * caixa.altura) / 1000;

        // CAIXA OTIMIZADA
        const resultadoOtimizado = caixa.calcularDimensoesOtimizadas(metaOcupacao, larguraMinimaCaixa);

        // BASELINE
        const valorBaseline = caixa._buscarValorBaseline();
        const valorTotalBaseline = valorBaseline * qty;
        const custoPapelBaseline = resultadoOtimizado.custo_papel_atual;
        const custoTotalBaseline = valorTotalBaseline + (custoPapelBaseline * qty);

        // Dimensões otimizadas
        const dimsOtimizadas = resultadoOtimizado.dimensoes_array;
        const dimOtimizadaX = dimsOtimizadas[0];
        const dimOtimizadaY = dimsOtimizadas[1];
        const dimOtimizadaZ = dimsOtimizadas[2];
        const volumeOtimizado = (dimOtimizadaX * dimOtimizadaY * dimOtimizadaZ) / 1000;

        // Valor da nova caixa otimizada
        const valorUnitarioOtimizado = resultadoOtimizado.valor_nova_caixa || caixa.valor;
        const valorTotalOtimizado = valorUnitarioOtimizado * qty;

        // Custos detalhados
        const custoPapelAtual = resultadoOtimizado.custo_papel_atual;
        const custoPapelNovaCaixa = resultadoOtimizado.custo_papel_nova_caixa;
        const economiaCustoPapel = resultadoOtimizado.economia_custo_papel;

        // Custo total (caixa + papel) atual
        const custoTotalAtual = valorTotalAtual + (custoPapelAtual * qty);

        // Custo total (caixa + papel) otimizado
        const custoTotalOtimizado = valorTotalOtimizado + (custoPapelNovaCaixa * qty);

        // Economia
        const economiaQuantidade = custoTotalAtual - custoTotalOtimizado;

        custoTotalBaselineGeral += custoTotalBaseline;
        custoTotalAtualGeral += custoTotalAtual;
        custoTotalOtimizadoGeral += custoTotalOtimizado;
        economiaTotalGeral += economiaQuantidade;

        resultados.push({
            nome: caixa.nome,
            quantidade: qty,
            valor_baseline: valorBaseline,
            valor_total_baseline: valorTotalBaseline,
            custo_papel_baseline: custoPapelBaseline,
            custo_total_baseline: custoTotalBaseline,
            dims_atual: [caixa.comprimento, caixa.largura, caixa.altura],
            valor_atual: valorUnitarioAtual,
            valor_total_atual: valorTotalAtual,
            volume_atual: volumeAtual,
            ocupacao_atual: caixa.ocupacaoAtual * 100,
            preenchimento_papel_atual_m: resultadoOtimizado.preenchimento_papel_atual_m,
            custo_papel_atual: resultadoOtimizado.custo_papel_atual,
            custo_total_atual: custoTotalAtual,
            dims_otimizada: [dimOtimizadaX, dimOtimizadaY, dimOtimizadaZ],
            valor_otimizado: valorUnitarioOtimizado,
            valor_total_otimizado: valorTotalOtimizado,
            volume_otimizado: volumeOtimizado,
            ocupacao_otimizada: resultadoOtimizado.ocupacao_final,
            preenchimento_papel_otimizado_m: resultadoOtimizado.preenchimento_papel_100_m,
            custo_papel_otimizado: resultadoOtimizado.custo_papel_nova_caixa,
            custo_total_otimizado: custoTotalOtimizado,
            reducao_volume: volumeAtual > 0 ? ((volumeAtual - volumeOtimizado) / volumeAtual * 100) : 0,
            economia_custo_papel: economiaCustoPapel * qty,
            economia_quantidade: economiaQuantidade
        });
    }

    // Percentuais de economia
    const percentualEconomia = custoTotalAtualGeral > 0
        ? (economiaTotalGeral / custoTotalAtualGeral * 100)
        : 0;
    const economiaBaselineVsOtimizado = custoTotalBaselineGeral - custoTotalOtimizadoGeral;
    const economiaAtualVsOtimizado = custoTotalAtualGeral - custoTotalOtimizadoGeral;
    const percentualEconomiaBaseline = custoTotalBaselineGeral > 0
        ? (economiaBaselineVsOtimizado / custoTotalBaselineGeral * 100)
        : 0;

    return {
        caixas: resultados,
        custo_total_baseline: custoTotalBaselineGeral,
        custo_total_atual: custoTotalAtualGeral,
        custo_total_otimizado: custoTotalOtimizadoGeral,
        economia_total_geral: economiaTotalGeral,
        economia_baseline_vs_otimizado: economiaBaselineVsOtimizado,
        economia_atual_vs_otimizado: economiaAtualVsOtimizado,
        percentual_economia: percentualEconomia,
        percentual_economia_baseline: percentualEconomiaBaseline,
    };
}
