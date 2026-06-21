const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const caminhoDados = path.join(__dirname, 'dados_bolao.json');

// --- ROTA DE MANTENIMENTO (KEEP-ALIVE) ---
// Adicione esta rota para o UptimeRobot acessar
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.get('/api/dados', (req, res) => {
    if (!fs.existsSync(caminhoDados)) {
        return res.json({ resultadosOficiais: {}, palpites: {} });
    }
    fs.readFile(caminhoDados, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Erro ao ler dados.");
        try {
            res.json(JSON.parse(data || '{}'));
        } catch (e) {
            res.json({ resultadosOficiais: {}, palpites: {} });
        }
    });
});

app.post('/api/salvar', (req, res) => {
    const novosDados = req.body;
    fs.writeFile(caminhoDados, JSON.stringify(novosDados, null, 2), 'utf8', (err) => {
        if (err) return res.status(500).send("Erro ao salvar dados.");
        res.send("Dados salvos com sucesso.");
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
});
