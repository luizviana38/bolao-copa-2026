const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware essencial para ler o JSON enviado pelo index.html
app.use(express.json());

// Servir os ficheiros estáticos (index.html, imagens, etc.)
app.use(express.static(__dirname));

const caminhoDados = path.join(__dirname, 'dados_bolao.json');

// Rota para ler os dados salvos (GET)
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

// Rota para salvar os dados recebidos do index.html (POST)
app.post('/api/salvar', (req, res) => {
    const novosDados = req.body;
    fs.writeFile(caminhoDados, JSON.stringify(novosDados, null, 2), 'utf8', (err) => {
        if (err) return res.status(500).send("Erro ao salvar dados.");
        res.send("Dados salvos com sucesso.");
    });
});

// Forçar qualquer outra rota a carregar o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
});
