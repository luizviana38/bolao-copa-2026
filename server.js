const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// O Render vai injetar esses valores de forma segura através das variáveis de ambiente
const BIN_ID = process.env.BIN_ID;
const API_KEY = process.env.API_KEY; 
const URL_JSONBIN = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Rota para ler os dados salvos (GET)
app.get('/api/dados', async (req, res) => {
    try {
        if (!BIN_ID || !API_KEY) {
            return res.status(500).send("Configurações do banco de dados ausentes.");
        }
        const resposta = await fetch(`${URL_JSONBIN}/latest`, {
            method: 'GET',
            headers: { 'X-Master-Key': API_KEY }
        });
        const dados = await resposta.json();
        res.json(dados.record || { resultadosOficiais: {}, palpites: {} });
    } catch (err) {
        console.error("Erro ao ler dados da nuvem:", err);
        res.status(500).send("Erro ao ler dados.");
    }
});

// Rota para salvar os dados recebidos (POST)
app.post('/api/salvar', async (req, res) => {
    try {
        const novosDados = req.body;
        const resposta = await fetch(URL_JSONBIN, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(novosDados)
        });

        if (resposta.ok) {
            res.send("Dados salvos com sucesso na nuvem.");
        } else {
            throw new Error("Falha na resposta do JSONBin");
        }
    } catch (err) {
        console.error("Erro ao salvar dados na nuvem:", err);
        res.status(500).send("Erro ao salvar dados.");
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
});
