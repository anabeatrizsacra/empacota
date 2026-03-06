// ============================================================
// app.js — UI logic (tab switching, form handling, rendering)
// ============================================================

// ===== UTILITY =====
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function () {
    populateBoxSelector();
});

/**
 * Populate the <select> dropdown with boxes from CAIXAS
 */
function populateBoxSelector() {
    const select = document.getElementById('caixa');
    // First two options already in HTML (empty + personalizada)

    CAIXAS.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.nome;
        opt.textContent = `${c.nome} - ${c.dims[0]}×${c.dims[1]}×${c.dims[2]}mm`;
        opt.setAttribute('data-ocupacao', (c.ocupacao_atual * 100).toString());
        opt.setAttribute('data-papel', c.preenchimento_papel_m.toString());
        select.appendChild(opt);
    });
}

// ===== TAB NAVIGATION =====
function mudarAba(abaId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));

    document.getElementById(abaId).classList.add('active');
    btnElement.classList.add('active');

    if (abaId === 'analise-comparativa') {
        populaCaixasCheckboxes();
    }
}

// ===== INDIVIDUAL ANALYSIS =====
function atualizarOcupacao() {
    const select = document.getElementById('caixa');
    const opcao = select.options[select.selectedIndex];
    const camposPersonalizados = document.getElementById('campos-personalizados');

    if (opcao.value === 'personalizada') {
        camposPersonalizados.style.display = 'block';
        document.getElementById('ocupacao_atual').value = 20;
        document.getElementById('papel_atual').value = 2.8;
    } else {
        camposPersonalizados.style.display = 'none';
        if (opcao.value) {
            const ocupacao = opcao.getAttribute('data-ocupacao');
            const papel = opcao.getAttribute('data-papel');
            document.getElementById('ocupacao_atual').value = ocupacao || 20;
            document.getElementById('papel_atual').value = papel || 2.8;
        }
    }
}

function calcular() {
    const caixaValue = document.getElementById('caixa').value;
    const metaInput = document.getElementById('meta').value;
    const meta = metaInput ? parseInt(metaInput) / 100 : 0.80;
    const larguraMinimaInput = document.getElementById('largura_minima').value;
    let larguraMinima = larguraMinimaInput ? parseInt(larguraMinimaInput) : null;

    // Business rule: force largura_minima = 150 for Caixa P and Caixa PH
    if (caixaValue === 'Caixa P' || caixaValue === 'Caixa PH') {
        larguraMinima = 150;
    }

    const ocupacaoAtualInput = document.getElementById('ocupacao_atual').value;
    const ocupacaoAtual = ocupacaoAtualInput ? parseInt(ocupacaoAtualInput) / 100 : 0.20;

    const papelAtualInput = document.getElementById('papel_atual').value;
    const papelAtual = papelAtualInput ? parseFloat(papelAtualInput) : 2.8;

    if (!caixaValue) {
        document.getElementById('resultado').innerHTML = '<div class="empty-state">Selecione uma caixa para continuar</div>';
        return;
    }

    let caixa;

    if (caixaValue === 'personalizada') {
        const comp = document.getElementById('comp_personalizado').value;
        const larg = document.getElementById('larg_personalizado').value;
        const alt = document.getElementById('alt_personalizado').value;

        if (!comp || !larg || !alt) {
            document.getElementById('resultado').innerHTML = '<div class="resultado error"><h3>❌ Erro</h3>Por favor, preencha todas as dimensões da caixa personalizada</div>';
            return;
        }

        caixa = new Caixa(
            'Caixa Personalizada',
            parseInt(comp), parseInt(larg), parseInt(alt),
            ocupacaoAtual, papelAtual, 0
        );
    } else {
        const caixaData = CAIXAS.find(c => c.nome === caixaValue);
        if (!caixaData) {
            document.getElementById('resultado').innerHTML = '<div class="resultado error"><h3>❌ Erro</h3>Caixa não encontrada</div>';
            return;
        }
        caixa = new Caixa(
            caixaData.nome,
            caixaData.dims[0], caixaData.dims[1], caixaData.dims[2],
            ocupacaoAtual, papelAtual, caixaData.valor
        );
    }

    const data = caixa.calcularDimensoesOtimizadas(meta, larguraMinima);

    const quantidadeCaixas = parseInt(document.getElementById('quantidade_caixas').value) || 100;

    // Multiply unit costs by quantity
    data.quantidade_caixas = quantidadeCaixas;
    data.custo_total_baseline_quantidade = data.custo_total_baseline * quantidadeCaixas;
    data.custo_total_atual_quantidade = data.custo_total_atual * quantidadeCaixas;
    data.custo_total_nova_caixa_quantidade = data.custo_total_nova_caixa * quantidadeCaixas;
    data.economia_total_quantidade = data.economia_total * quantidadeCaixas;

    renderResultadoIndividual(data);
}

function renderResultadoIndividual(data) {
    const aviso = data.ocupacao_atual < 50
        ? '<div class="aviso">⚠️ A caixa tem baixa ocupação atualmente. As dimensões otimizadas aumentarão significativamente.</div>'
        : data.percentual_variacao > 30
            ? '<div class="aviso">⚠️ Aumento de dimensões acima de 30%. Verifique a viabilidade operacional.</div>'
            : '';

    const html = `
        <div class="resultado">
            <h3>✓ Análise da ${data.nome_caixa}</h3>
            <div class="resultado-grid">
                <div class="info-box">
                    <div class="info-label">Caixa (Dimensões)</div>
                    <div class="info-value">${data.dimensoes_caixa}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">💰 Valor da Caixa</div>
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
                    <div class="info-label" style="font-weight: bold; color: #2e7d32;">💰 Valor da Nova Caixa (Otimizada)</div>
                    <div class="info-value" style="color: #2e7d32; font-size: 1.3em;">R$ ${formatarMoeda(data.valor_nova_caixa)}</div>
                </div>
                ` : ''}
                <div class="info-box" style="background: #fff3e0;">
                    <div class="info-label">Volume Preenchimento para 100%</div>
                    <div class="info-value" style="color: #e65100;">${data.volume_preenchimento} cm³</div>
                </div>
                <div style="border-top: 2px solid #eee; margin-top: 15px; padding-top: 15px;">
                    <div class="info-label" style="font-size: 1.1em; font-weight: bold; margin-bottom: 15px; color: #555;">📦 Papel Necessário para a Caixa Otimizada:</div>
                    <div class="info-box">
                        <div class="info-label">Papel Atual (Caixa Original)</div>
                        <div class="info-value">${data.preenchimento_papel_atual_m} m</div>
                    </div>
                    <div class="info-box" style="background: #fff9c4; border-left: 4px solid #fbc02d;">
                        <div class="info-label" style="font-weight: bold; color: #f57f17;">✓ Para Completar 100% da Caixa Nova</div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(245, 127, 23, 0.3);">
                            <div style="font-size: 0.9em; color: #f57f17; margin-bottom: 5px;">Volume a Preencher:</div>
                            <div class="info-value" style="color: #f57f17; font-size: 1.2em; margin-bottom: 8px;">${data.volume_preenchimento} cm³</div>
                            <div style="font-size: 0.9em; color: #f57f17; margin-bottom: 5px;">Papel Necessário:</div>
                            <div class="info-value" style="color: #f57f17; font-size: 1.3em;">${data.preenchimento_papel_100_m} m</div>
                        </div>
                    </div>
                    <div class="info-box" style="background: #e8f5e9;">
                        <div class="info-label" style="font-weight: bold;">💰 Economia de Papel (Comparado com Atual)</div>
                        <div class="info-value" style="color: #2e7d32; font-size: 1.3em;">${data.economia_papel_m} m</div>
                    </div>
                </div>
                <div style="border-top: 2px solid #eee; margin-top: 15px; padding-top: 15px;">
                    <div class="info-label" style="font-size: 1.1em; font-weight: bold; margin-bottom: 15px; color: #555;">💵 Custo do Papel (R$ 0,40 por metro):</div>
                    <div class="info-box" style="background: #ffebee;">
                        <div class="info-label" style="font-weight: bold; color: #c62828;">Custo Atual (Caixa Original)</div>
                        <div class="info-value" style="color: #c62828; font-size: 1.3em;">R$ ${formatarMoeda(data.custo_papel_atual)}</div>
                    </div>
                    <div class="info-box" style="background: #c8e6c9;">
                        <div class="info-label" style="font-weight: bold; color: #2e7d32;">Custo na Nova Caixa (Otimizada)</div>
                        <div class="info-value" style="color: #2e7d32; font-size: 1.3em;">R$ ${formatarMoeda(data.custo_papel_nova_caixa)}</div>
                    </div>
                    <div class="info-box" style="background: #a5d6a7; border-left: 4px solid #2e7d32;">
                        <div class="info-label" style="font-weight: bold; color: #1b5e20;">✓ Economia de Custo</div>
                        <div class="info-value" style="color: #1b5e20; font-size: 1.3em;">R$ ${formatarMoeda(data.economia_custo_papel)}</div>
                    </div>
                </div>
            </div>
            <div style="border-top: 3px solid #667eea; margin-top: 20px; padding-top: 20px; background: linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%); padding: 20px; border-radius: 5px;">
                <div class="info-label" style="font-size: 1.2em; font-weight: bold; margin-bottom: 20px; color: #333; text-align: center;">📊 COMPARATIVO COMPLETO: BASELINE vs CAIXA ATUAL vs NOVA</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <!-- BASELINE -->
                    <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #9c27b0;">
                        <div style="font-weight: bold; color: #6a1b9a; margin-bottom: 15px; font-size: 1.05em;">📌 Baseline (Referência)</div>
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 0.9em; color: #666;">Valor da Caixa:</div>
                            <div style="font-size: 1.1em; font-weight: 600; color: #333;">R$ ${formatarMoeda(data.valor_baseline)}</div>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 0.9em; color: #666;">Custo do Papel:</div>
                            <div style="font-size: 1.1em; font-weight: 600; color: #333;">R$ ${formatarMoeda(data.custo_papel_atual)}</div>
                        </div>
                        <div style="border-top: 2px solid #eee; padding-top: 10px; margin-top: 10px;">
                            <div style="font-size: 0.9em; color: #999; margin-bottom: 5px;">TOTAL:</div>
                            <div style="font-size: 1.3em; font-weight: bold; color: #6a1b9a;">R$ ${formatarMoeda(data.custo_total_baseline)}</div>
                        </div>
                    </div>
                    <!-- CAIXA ATUAL -->
                    <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ff6b6b;">
                        <div style="font-weight: bold; color: #d32f2f; margin-bottom: 15px; font-size: 1.05em;">Caixa Atual</div>
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 0.9em; color: #666;">Valor da Caixa:</div>
                            <div style="font-size: 1.1em; font-weight: 600; color: #333;">R$ ${formatarMoeda(data.valor)}</div>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 0.9em; color: #666;">Custo do Papel:</div>
                            <div style="font-size: 1.1em; font-weight: 600; color: #333;">R$ ${formatarMoeda(data.custo_papel_atual)}</div>
                        </div>
                        <div style="border-top: 2px solid #eee; padding-top: 10px; margin-top: 10px;">
                            <div style="font-size: 0.9em; color: #999; margin-bottom: 5px;">TOTAL:</div>
                            <div style="font-size: 1.3em; font-weight: bold; color: #d32f2f;">R$ ${formatarMoeda(data.custo_total_atual)}</div>
                        </div>
                    </div>
                    <!-- CAIXA OTIMIZADA -->
                    <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #51cf66;">
                        <div style="font-weight: bold; color: #2e7d32; margin-bottom: 15px; font-size: 1.05em;">Nova Caixa (Otimizada)</div>
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 0.9em; color: #666;">Valor da Caixa:</div>
                            <div style="font-size: 1.1em; font-weight: 600; color: #333;">R$ ${data.valor_nova_caixa ? formatarMoeda(data.valor_nova_caixa) : 'N/A'}</div>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 0.9em; color: #666;">Custo do Papel:</div>
                            <div style="font-size: 1.1em; font-weight: 600; color: #333;">R$ ${formatarMoeda(data.custo_papel_nova_caixa)}</div>
                        </div>
                        <div style="border-top: 2px solid #eee; padding-top: 10px; margin-top: 10px;">
                            <div style="font-size: 0.9em; color: #999; margin-bottom: 5px;">TOTAL:</div>
                            <div style="font-size: 1.3em; font-weight: bold; color: #2e7d32;">R$ ${formatarMoeda(data.custo_total_nova_caixa)}</div>
                        </div>
                    </div>
                </div>
                <div style="background: linear-gradient(135deg, #a5d6a7 0%, #81c784 100%); padding: 20px; border-radius: 5px; text-align: center;">
                    <div style="font-size: 0.95em; color: #1b5e20; margin-bottom: 8px; font-weight: 600;">💰 ECONOMIA TOTAL POR CAIXA</div>
                    <div style="font-size: 2em; font-weight: bold; color: #1b5e20;">R$ ${formatarMoeda(data.economia_total)}</div>
                    <div style="font-size: 0.9em; color: #2e7d32; margin-top: 10px;">Diferença: (Caixa Atual + Papel Atual) - (Caixa Nova + Papel Nova)</div>
                </div>

                <div style="border-top: 3px solid #D4AF37; margin-top: 25px; padding-top: 20px;">
                    <div class="info-label" style="font-size: 1.2em; font-weight: bold; margin-bottom: 20px; color: #333; text-align: center;">📦 ANÁLISE DE CUSTO PARA ${data.quantidade_caixas} CAIXAS</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                        <!-- BASELINE -->
                        <div style="background: #f3e5f5; padding: 20px; border-radius: 5px; border-left: 4px solid #9c27b0;">
                            <div style="font-weight: bold; color: #6a1b9a; margin-bottom: 15px; font-size: 1.1em;">📌 Baseline (Referência)</div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 0.85em; color: #666;">Valor unitário:</div>
                                <div style="font-size: 0.95em; font-weight: 600; color: #333;">R$ ${formatarMoeda(data.valor_baseline)}</div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 0.85em; color: #666;">Quantidade:</div>
                                <div style="font-size: 0.95em; font-weight: 600; color: #333;">${data.quantidade_caixas} caixas</div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 0.85em; color: #666;">Custo total (caixas + papel):</div>
                                <div style="font-size: 1.2em; font-weight: bold; color: #6a1b9a;">R$ ${formatarMoeda(data.custo_total_baseline_quantidade)}</div>
                            </div>
                        </div>
                        <!-- CAIXA ATUAL -->
                        <div style="background: #fff3e0; padding: 20px; border-radius: 5px; border-left: 4px solid #ff6b6b;">
                            <div style="font-weight: bold; color: #d32f2f; margin-bottom: 15px; font-size: 1.1em;">Caixa Atual</div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 0.85em; color: #666;">Valor unitário:</div>
                                <div style="font-size: 0.95em; font-weight: 600; color: #333;">R$ ${formatarMoeda(data.valor)}</div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 0.85em; color: #666;">Quantidade:</div>
                                <div style="font-size: 0.95em; font-weight: 600; color: #333;">${data.quantidade_caixas} caixas</div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 0.85em; color: #666;">Custo total (caixas + papel):</div>
                                <div style="font-size: 1.2em; font-weight: bold; color: #d32f2f;">R$ ${formatarMoeda(data.custo_total_atual_quantidade)}</div>
                            </div>
                        </div>
                        <!-- NOVA CAIXA -->
                        <div style="background: #e8f5e9; padding: 20px; border-radius: 5px; border-left: 4px solid #51cf66;">
                            <div style="font-weight: bold; color: #2e7d32; margin-bottom: 15px; font-size: 1.1em;">Nova Caixa (Otimizada)</div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 0.85em; color: #666;">Valor unitário:</div>
                                <div style="font-size: 0.95em; font-weight: 600; color: #333;">R$ ${data.valor_nova_caixa ? formatarMoeda(data.valor_nova_caixa) : 'N/A'}</div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 0.85em; color: #666;">Quantidade:</div>
                                <div style="font-size: 0.95em; font-weight: 600; color: #333;">${data.quantidade_caixas} caixas</div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 0.85em; color: #666;">Custo total (caixas + papel):</div>
                                <div style="font-size: 1.2em; font-weight: bold; color: #2e7d32;">R$ ${formatarMoeda(data.custo_total_nova_caixa_quantidade)}</div>
                            </div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #D4AF37 0%, #E5C158 100%); padding: 20px; border-radius: 5px; text-align: center; margin-top: 20px;">
                        <div style="font-size: 1em; color: black; margin-bottom: 10px; font-weight: 600;">✓ ECONOMIA TOTAL COM ${data.quantidade_caixas} CAIXAS</div>
                        <div style="font-size: 2.2em; font-weight: bold; color: black;">R$ ${formatarMoeda(data.economia_total_quantidade)}</div>
                        <div style="font-size: 0.9em; color: black; margin-top: 10px;">Retorno do investimento na nova caixa</div>
                    </div>
                </div>
            </div>
            ${aviso}
        </div>
    `;

    document.getElementById('resultado').innerHTML = html;
}


// ===== COMPARATIVE ANALYSIS (TAB 2) =====

function populaCaixasCheckboxes() {
    const container = document.getElementById('caixas-checkboxes');
    const quantidadesContainer = document.getElementById('quantidades-container');

    container.innerHTML = '';
    quantidadesContainer.innerHTML = '';

    CAIXAS.forEach(c => {
        // Checkbox wrapper
        const wrapper = document.createElement('label');
        wrapper.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = c.nome;
        checkbox.className = 'caixa-checkbox';
        checkbox.onchange = atualizarQuantidadesVisiveis;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'checkbox-label';

        const nomeSpan = document.createElement('span');
        nomeSpan.className = 'nome';
        nomeSpan.textContent = c.nome;

        const dimsSpan = document.createElement('span');
        dimsSpan.className = 'dims';
        dimsSpan.textContent = `${c.dims[0]}×${c.dims[1]}×${c.dims[2]}mm`;

        labelDiv.appendChild(nomeSpan);
        labelDiv.appendChild(dimsSpan);
        wrapper.appendChild(checkbox);
        wrapper.appendChild(labelDiv);
        container.appendChild(wrapper);

        // Quantity input
        const quantidadeItem = document.createElement('div');
        quantidadeItem.className = 'quantidade-item';
        quantidadeItem.id = 'qtd-' + c.nome;
        quantidadeItem.style.display = 'none';

        const qtdNome = document.createElement('span');
        qtdNome.className = 'quantidade-item-nome';
        qtdNome.textContent = c.nome;

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'quantidade-input';
        input.value = '100';
        input.min = '1';
        input.step = '1';
        input.dataset.caixa = c.nome;

        quantidadeItem.appendChild(qtdNome);
        quantidadeItem.appendChild(input);
        quantidadesContainer.appendChild(quantidadeItem);
    });

    atualizarQuantidadesVisiveis();
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
    document.querySelectorAll('.caixa-checkbox').forEach(cb => cb.checked = true);
    atualizarQuantidadesVisiveis();
}

function limparSelecao() {
    document.querySelectorAll('.caixa-checkbox').forEach(cb => cb.checked = false);
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
        alert('Por favor, selecione pelo menos uma caixa para comparar.');
        return;
    }

    const metaInput = document.getElementById('meta_comparativa').value;
    const meta = metaInput ? parseInt(metaInput) / 100 : 0.80;
    const larguraMinimaInput = document.getElementById('largura_minima_comparativa').value;
    let larguraMinima = larguraMinimaInput ? parseInt(larguraMinimaInput) : null;

    // Business rule: Apply largura mínima of 150mm for Caixa P if selected
    if ('Caixa P' in caixasComQuantidades) {
        larguraMinima = 150;
    }

    // Call the calculator function directly (no server!)
    const data = compararCaixasCalc(caixasComQuantidades, meta, larguraMinima);
    exibirComparacao(data);
}

function exibirComparacao(data) {
    const resultadoDiv = document.getElementById('resultado-comparativo');

    if (!data || !data.caixas || data.caixas.length === 0) {
        resultadoDiv.innerHTML = '<p>Erro ao obter dados das caixas.</p>';
        return;
    }

    let html = '<div class="resultado-comparativo">';
    html += '<h3>Análise Comparativa Detalhada</h3>';

    data.caixas.forEach((caixa, index) => {
        const quantidade = caixa.quantidade || 100;
        html += '<div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #D4AF37;">';
        html += '<h4 style="margin: 0 0 15px 0; color: #333;">' + (index + 1) + '. ' + caixa.nome + ' - ' + quantidade.toLocaleString('pt-BR') + ' unidades</h4>';

        // 3-column grid
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 15px;">';

        // BASELINE
        html += '<div style="background: white; padding: 15px; border-radius: 3px; border: 1px solid #ddd;">';
        html += '<h5 style="margin: 0 0 10px 0; color: #6a1b9a; font-size: 0.95em;">📌 BASELINE</h5>';
        html += '<table style="width: 100%; font-size: 0.9em; color: #555;">';
        html += '<tr><td colspan="2"><strong style="color: #6a1b9a;">Referência Inicial</strong></td></tr>';
        html += '<tr><td><strong>Papel (m):</strong></td><td>' + caixa.preenchimento_papel_atual_m.toFixed(2) + ' m</td></tr>';
        html += '<tr><td style="border-top: 1px solid #eee; padding-top: 8px;"><strong>Caixa:</strong></td><td style="border-top: 1px solid #eee; padding-top: 8px;">R$ ' + formatarMoeda(caixa.valor_baseline) + '</td></tr>';
        html += '<tr><td><strong>Papel:</strong></td><td>R$ ' + formatarMoeda(caixa.custo_papel_baseline) + '</td></tr>';
        html += '<tr><td><strong>Total Unit.:</strong></td><td style="color: #6a1b9a; font-weight: 600;">R$ ' + formatarMoeda(caixa.valor_baseline + caixa.custo_papel_baseline) + '</td></tr>';
        html += '<tr style="background: #f3e5f5; font-weight: 600;"><td><strong>Total (' + quantidade.toLocaleString('pt-BR') + ' un.):</strong></td><td style="color: #6a1b9a;">R$ ' + formatarMoeda(caixa.custo_total_baseline) + '</td></tr>';
        html += '</table>';
        html += '</div>';

        // ATUAL
        html += '<div style="background: white; padding: 15px; border-radius: 3px; border: 1px solid #ddd;">';
        html += '<h5 style="margin: 0 0 10px 0; color: #333; font-size: 0.95em;">CAIXA ATUAL</h5>';
        html += '<table style="width: 100%; font-size: 0.9em; color: #555;">';
        html += '<tr><td><strong>Dimensões:</strong></td><td>' + caixa.dims_atual[0] + '×' + caixa.dims_atual[1] + '×' + caixa.dims_atual[2] + ' mm</td></tr>';
        html += '<tr><td><strong>Ocupação:</strong></td><td>' + caixa.ocupacao_atual.toFixed(1) + '%</td></tr>';
        html += '<tr><td><strong>Papel (m):</strong></td><td>' + caixa.preenchimento_papel_atual_m.toFixed(2) + ' m</td></tr>';
        html += '<tr><td style="border-top: 1px solid #eee; padding-top: 8px;"><strong>Caixa:</strong></td><td style="border-top: 1px solid #eee; padding-top: 8px;">R$ ' + formatarMoeda(caixa.valor_atual) + '</td></tr>';
        html += '<tr><td><strong>Papel:</strong></td><td>R$ ' + formatarMoeda(caixa.custo_papel_atual) + '</td></tr>';
        html += '<tr><td><strong>Total Unit.:</strong></td><td style="color: #333; font-weight: 600;">R$ ' + formatarMoeda(caixa.valor_atual + caixa.custo_papel_atual) + '</td></tr>';
        html += '<tr style="background: #e3f2fd; font-weight: 600;"><td><strong>Total (' + quantidade.toLocaleString('pt-BR') + ' un.):</strong></td><td style="color: #0d47a1;">R$ ' + formatarMoeda(caixa.custo_total_atual) + '</td></tr>';
        html += '</table>';
        html += '</div>';

        // OTIMIZADA
        html += '<div style="background: white; padding: 15px; border-radius: 3px; border: 1px solid #ddd;">';
        html += '<h5 style="margin: 0 0 10px 0; color: #2d5016; font-size: 0.95em;">CAIXA OTIMIZADA</h5>';
        html += '<table style="width: 100%; font-size: 0.9em; color: #555;">';
        html += '<tr><td><strong>Dimensões:</strong></td><td>' + Math.round(caixa.dims_otimizada[0]) + '×' + Math.round(caixa.dims_otimizada[1]) + '×' + Math.round(caixa.dims_otimizada[2]) + ' mm</td></tr>';
        html += '<tr><td><strong>Ocupação:</strong></td><td>' + caixa.ocupacao_otimizada.toFixed(1) + '%</td></tr>';
        html += '<tr><td><strong>Papel (m):</strong></td><td>' + caixa.preenchimento_papel_otimizado_m.toFixed(2) + ' m</td></tr>';
        html += '<tr><td style="border-top: 1px solid #eee; padding-top: 8px;"><strong>Caixa:</strong></td><td style="border-top: 1px solid #eee; padding-top: 8px;">R$ ' + formatarMoeda(caixa.valor_otimizado) + '</td></tr>';
        html += '<tr><td><strong>Papel:</strong></td><td>R$ ' + formatarMoeda(caixa.custo_papel_otimizado) + '</td></tr>';
        html += '<tr><td><strong>Total Unit.:</strong></td><td style="color: #2d5016; font-weight: 600;">R$ ' + formatarMoeda(caixa.valor_otimizado + caixa.custo_papel_otimizado) + '</td></tr>';
        html += '<tr style="background: #e8f5e9; font-weight: 600;"><td><strong>Total (' + quantidade.toLocaleString('pt-BR') + ' un.):</strong></td><td style="color: #2d5016;">R$ ' + formatarMoeda(caixa.custo_total_otimizado) + '</td></tr>';
        html += '</table>';
        html += '</div>';

        html += '</div>'; // grid
        html += '</div>'; // card
    });

    // Summary
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px;">';

    html += '<div style="background: #f3e5f5; padding: 20px; border-radius: 5px; border-left: 4px solid #9c27b0;">';
    html += '<h4 style="margin: 0 0 10px 0; color: #6a1b9a;">📌 Baseline Total</h4>';
    html += '<div style="font-size: 1.8em; font-weight: bold; color: #6a1b9a;">R$ ' + formatarMoeda(data.custo_total_baseline) + '</div>';
    html += '<p style="margin: 10px 0 0 0; font-size: 0.9em; color: #555;">Referência inicial</p>';
    html += '</div>';

    html += '<div style="background: #fff3e0; padding: 20px; border-radius: 5px; border-left: 4px solid #ff6b6b;">';
    html += '<h4 style="margin: 0 0 10px 0; color: #d32f2f;">Caixa Atual Total</h4>';
    html += '<div style="font-size: 1.8em; font-weight: bold; color: #d32f2f;">R$ ' + formatarMoeda(data.custo_total_atual) + '</div>';
    html += '<p style="margin: 10px 0 0 0; font-size: 0.9em; color: #555;">Custo em uso</p>';
    html += '</div>';

    html += '<div style="background: #e8f5e9; padding: 20px; border-radius: 5px; border-left: 4px solid #2d5016;">';
    html += '<h4 style="margin: 0 0 10px 0; color: #2d5016;">Caixa Otimizada Total</h4>';
    html += '<div style="font-size: 1.8em; font-weight: bold; color: #2d5016;">R$ ' + formatarMoeda(data.custo_total_otimizado) + '</div>';
    html += '<p style="margin: 10px 0 0 0; font-size: 0.9em; color: #555;">Após otimização</p>';
    html += '</div>';

    html += '</div>';

    // Savings detail
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">';

    html += '<div style="background: #e8f5e9; padding: 20px; border-radius: 5px; border: 2px solid #2d5016;">';
    html += '<h4 style="margin: 0 0 10px 0; color: #1b5e20; font-size: 1.1em;">💰 Economia: Baseline vs Otimizado</h4>';
    html += '<div style="font-size: 2em; font-weight: bold; color: #1b5e20;">R$ ' + formatarMoeda(data.economia_baseline_vs_otimizado) + '</div>';
    html += '<div style="font-size: 1.2em; color: #2d5016; margin-top: 10px;">-' + data.percentual_economia_baseline.toFixed(2) + '% de economia</div>';
    html += '<p style="margin: 15px 0 0 0; font-size: 0.9em; color: #555;">Redução em relação ao custo de baseline</p>';
    html += '</div>';

    html += '<div style="background: #e3f2fd; padding: 20px; border-radius: 5px; border: 2px solid #1976d2;">';
    html += '<h4 style="margin: 0 0 10px 0; color: #0d47a1; font-size: 1.1em;">💰 Economia: Atual vs Otimizado</h4>';
    html += '<div style="font-size: 2em; font-weight: bold; color: #0d47a1;">R$ ' + formatarMoeda(data.economia_atual_vs_otimizado) + '</div>';
    html += '<div style="font-size: 1.2em; color: #1976d2; margin-top: 10px;">-' + ((data.economia_atual_vs_otimizado / data.custo_total_atual) * 100).toFixed(2) + '% de economia</div>';
    html += '<p style="margin: 15px 0 0 0; font-size: 0.9em; color: #555;">Redução em relação ao custo atual</p>';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    resultadoDiv.innerHTML = html;
}
