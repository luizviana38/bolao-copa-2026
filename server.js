const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const dadosPath = path.join(__dirname, 'dados_bolao.json');
let palpitesBloqueadosGeral = true;

const lerDados = () => {
    try {
        if (!fs.existsSync(dadosPath)) {
            const estruturaInicial = {
                usuarios: {
                    "Luiz Viana": { "pts": 560, "palpites": {} },
                    "Caio": { "pts": 540, "palpites": {} },
                    "David": { "pts": 520, "palpites": {} },
                    "Márcio": { "pts": 510, "palpites": {} },
                    "Tainá": { "pts": 0, "palpites": {} }
                },
                partidas: [
                    { "id": 1, "grupo": "A", "mandante": "México", "visitante": "Estações / Playoff", "golsMandanteReal": null, "golsVisitanteReal": null, "encerrada": false },
                    { "id": 2, "grupo": "A", "mandante": "Estados Unidos", "visitante": "Playoff", "golsMandanteReal": null, "golsVisitanteReal": null, "encerrada": false },
                    { "id": 3, "grupo": "C", "mandante": "Canadá", "visitante": "Playoff", "golsMandanteReal": null, "golsVisitanteReal": null, "encerrada": false },
                    { "id": 4, "grupo": "C", "mandante": "Brasil", "visitante": "Playoff", "golsMandanteReal": null, "golsVisitanteReal": null, "encerrada": false }
                ]
            };
            fs.writeFileSync(dadosPath, JSON.stringify(estruturaInicial, null, 2), 'utf-8');
            return estruturaInicial;
        }
        const data = fs.readFileSync(dadosPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Erro ao ler dados:", error);
        return { usuarios: {}, partidas: [] };
    }
};

const salvarDados = (dados) => {
    try {
        fs.writeFileSync(dadosPath, JSON.stringify(dados, null, 2), 'utf-8');
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
    }
};

app.get('/api/dados', (req, res) => {
    const dados = lerDados();
    res.json({
        bloqueado: palpitesBloqueadosGeral,
        usuarios: dados.usuarios,
        partidas: dados.partidas
    });
});

app.post('/api/palpites', (req, res) => {
    const { usuario, palpites } = req.body;

    if (palpitesBloqueadosGeral) {
        return res.status(403).json({ success: false, message: 'Os palpites desta rodada estão trancados!' });
    }

    const dados = lerDados();
    if (!dados.usuarios[usuario]) {
        dados.usuarios[usuario] = { pts: 0, palpites: {} };
    }

    dados.usuarios[usuario].palpites = {
        ...dados.usuarios[usuario].palpites,
        ...palpites
    };

    salvarDados(dados);
    res.json({ success: true, message: 'Palpites salvos com sucesso!' });
});

// Ações do Admin: Não exigem validação de senha por string no body
app.post('/api/admin/status-palpites', (req, res) => {
    const { bloquear } = req.body;
    palpitesBloqueadosGeral = bloquear;
    res.json({ success: true, bloqueado: palpitesBloqueadosGeral });
});

app.post('/api/admin/placar-real', (req, res) => {
    const { partidaId, placarMandante, placarVisitante } = req.body;

    const dados = lerDados();
    const partida = dados.partidas.find(p => p.id === partidaId);
    if (partida) {
        partida.golsMandanteReal = placarMandante;
        partida.golsVisitanteReal = placarVisitante;
        partida.encerrada = true;
    }
    
    salvarDados(dados);
    res.json({ success: true, message: 'Placar oficial registrado com sucesso!' });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
