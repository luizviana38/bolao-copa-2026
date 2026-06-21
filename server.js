async function carregarDadosDoServidor() {
    // 1. Tenta carregar primeiro o backup de emergência do navegador
    const backupLocal = localStorage.getItem('backup_emergencia_bolao');
    if (backupLocal) {
        dadosBolao = JSON.parse(backupLocal);
    }

    try {
        const response = await fetch('/api/dados');
        if (response.ok) {
            const dadosServidor = await response.json();
            if (dadosServidor && (dadosServidor.resultadosOficiais || dadosServidor.palpites)) {
                if(dadosServidor.resultadosOficiais) dadosBolao.resultadosOficiais = dadosServidor.resultadosOficiais;
                if(dadosServidor.palpites) {
                    PARTICIPANTES.forEach(p => {
                        if(dadosServidor.palpites[p]) dadosBolao.palpites[p] = dadosServidor.palpites[p];
                    });
                }
                // Atualiza o backup local com os dados frescos do servidor
                localStorage.setItem('backup_emergencia_bolao', JSON.stringify(dadosBolao));
            }
        }
    } catch (error) {
        console.error("Erro ao conectar com o servidor. Usando dados locais.", error);
    } finally {
        renderMatches();
        calculateRanking();
    }
}

// E modifique a sua função saveData() para salvar no localStorage também:
async function saveData() {
    // Salva localmente primeiro para garantir
    localStorage.setItem('backup_emergencia_bolao', JSON.stringify(dadosBolao));

    try {
        const response = await fetch('/api/dados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosBolao)
        });
        if (response.ok) {
            alert("Dados salvos com sucesso na nuvem e localmente!");
            calculateRanking();
            renderMatches();
        } else {
            alert("Erro ao salvar dados no servidor, mas seu palpite está salvo no seu navegador!");
        }
    } catch (error) {
        console.error("Erro ao enviar dados.", error);
        alert("Erro de conexão. Palpites guardados temporariamente no seu navegador.");
    }
}
