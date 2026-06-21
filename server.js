async function carregarDadosDoServidor() {
    // 1. Tenta buscar primeiro o que já estiver salvo no navegador atual como garantia
    const backupLocal = localStorage.getItem('backup_emergencia_bolao');
    if (backupLocal) {
        try {
            const dadosObtidosLocais = JSON.parse(backupLocal);
            if (dadosObtidosLocais.palpites || dadosObtidosLocais.resultadosOficiais) {
                dadosBolao = dadosObtidosLocais;
            }
        } catch(e) { console.error("Erro ao ler backup local", e); }
    }

    try {
        const response = await fetch('/api/dados');
        if (response.ok) {
            const dadosServidor = await response.json();
            
            // VALIDAÇÃO CRÍTICA: Só substitui a memória se o servidor trouxer dados preenchidos
            if (dadosServidor && (Object.keys(dadosServidor.resultadosOficiais || {}).length > 0 || Object.keys(dadosServidor.palpites || {}).length > 0)) {
                
                if (dadosServidor.resultadosOficiais) dadosBolao.resultadosOficiais = dadosServidor.resultadosOficiais;
                if (dadosServidor.palpites) {
                    PARTICIPANTES.forEach(p => {
                        if (dadosServidor.palpites[p]) dadosBolao.palpites[p] = dadosServidor.palpites[p];
                    });
                }
                // Atualiza o porto seguro local
                localStorage.setItem('backup_emergencia_bolao', JSON.stringify(dadosBolao));
            }
        }
    } catch (error) {
        console.error("Erro ao conectar com o servidor. Mantendo dados locais seguros.", error);
    } finally {
        renderMatches();
        calculateRanking();
    }
}

async function saveData() {
    // Anti-vacilo: impede salvar se a estrutura essencial sumir por completo
    if (!dadosBolao || (!dadosBolao.palpites && !dadosBolao.resultadosOficiais)) {
        alert("Erro gravíssimo: A estrutura de dados está corrompida. Operação abortada para não quebrar o banco!");
        return;
    }

    // Garante o backup local antes de fazer o hit na API
    localStorage.setItem('backup_emergencia_bolao', JSON.stringify(dadosBolao));

    try {
        const response = await fetch('/api/dados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosBolao)
        });
        if (response.ok) {
            alert("Dados salvos com sucesso na nuvem e no navegador!");
            calculateRanking();
            renderMatches();
        } else {
            alert("O servidor rejeitou o salvamento, mas seus dados estão salvos localmente neste navegador!");
        }
    } catch (error) {
        console.error("Erro ao enviar dados.", error);
        alert("Erro de conexão com o servidor. Seus palpites estão guardados em segurança no seu navegador!");
    }
}
