const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Caminho do arquivo JSON que armazena os dados do bolão
const dadosPath = path.join(__dirname, 'dados_bolao.json');

// Estado global do bloqueio de palpites
let palpitesBloqueadosGeral = false;

// Função auxiliar para ler os dados do arquivo JSON
const lerDados = () => {
    try {
        if (!fs.existsSync(dadosPath)) {
            // Se o arquivo não existir, inicia uma estrutura básica vazia
            fs.writeFileSync(dadosPath, JSON.stringify({ usuarios: {}, partidas: [] }, null, 2));
        }
        const data = fs.readFileSync(dadosPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Erro ao ler dados:", error);
        return { usuarios: {}, partidas: [] };
    }
};

// Função auxiliar para salvar os dados no arquivo JSON
const salvarDados = (dados) => {
    try {
        fs.writeFileSync(dadosPath, JSON.stringify(dados, null, 2), 'utf-8');
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
    }
};

// --- ROTAS DA API ---

// 1. Buscar o status atual do bloqueio e os dados dos palpites
app.get('/api/dados', (req, res) => {
    const dados = lerDados();
    res.json({
        bloqueado: palpitesBloqueadosGeral,
        usuarios: dados.usuarios,
        partidas: dados.partidas
    });
});

// 2. Salvar ou atualizar os palpites de um usuário comum
app.post('/api/palpites', (req, res) => {
    const { usuario, palpites } = req.body;

    // Se o bloqueio geral estiver ativado, impede qualquer alteração de usuários comuns
    if (palpitesBloqueadosGeral) {
        return res.status(403).json({ success: false, message: 'Os palpites desta rodada estão trancados!' });
    }

    if (!usuario || !palpites) {
        return res.status(400).json({ success: false, message: 'Dados incompletos.' });
    }

    const dados = lerDados();
    
    // Inicializa o usuário se não existir
    if (!dados.usuarios[usuario]) {
        dados.usuarios[usuario] = { pts: 0, palpites: {} };
    }

    // Atualiza os palpites enviados
    dados.usuarios[usuario].palpites = {
        ...dados.usuarios[usuario].palpites,
        ...palpites
    };

    salvarDados(dados);
    res.json({ success: true, message: 'Palpites salvos com sucesso!' });
});

// 3. Rota de Administração: Bloquear / Liberar Palpites com Senha
app.post('/api/admin/status-palpites', (req, res) => {
    const { bloquear, senha } = req.body;

    // Validação estrita da senha de administrador
    if (senha !== 'luiz2206') {
        return res.status(403).json({ success: false, message: 'Senha de administrador inválida!' });
    }

    palpitesBloqueadosGeral = bloquear;
    res.json({ success: true, bloqueado: palpitesBloqueadosGeral });
});

// 4. Rota de Administração: Registrar Placar Oficial da FIFA
app.post('/api/admin/placar-real', (req, res) => {
    const { senha, partidaId, placarMandante, placarVisitante } = req.body;

    if (senha !== 'luiz2206') {
        return res.status(403).json({ success: false, message: 'Senha de administrador inválida!' });
    }

    const dados = lerDados();
    
    // Localiza a partida e atualiza o placar oficial
    const partida = dados.partidas.find(p => p.id === partidaId);
    if (partida) {
        partida.golsMandanteReal = placarMandante;
        partida.golsVisitanteReal = placarVisitante;
        partida.encerrada = true;
    }

    // Aqui você pode opcionalmente recalcular os pontos (pts) de cada usuário
    
    salvarDados(dados);
    res.json({ success: true, message: 'Placar oficial registrado com sucesso!' });
});

// Alternativa universal que funciona em qualquer versão do Express
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
