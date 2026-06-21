const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const BIN_ID = process.env.BIN_ID;
const API_KEY = process.env.API_KEY; 
const URL_JSONBIN = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Rota para ler os dados da nuvem
app.get('/api/dados', async (req, res) => {
    try {
        const resposta = await fetch(`${URL_JSONBIN}/latest`, {
            method: 'GET',
            headers: { 'X-Master-Key': API_KEY }
        });
        const dados = await resposta.json();
        res.json(dados.record);
    } catch (err) {
        console.error("Erro ao ler:", err);
        res.status(500).send("Erro ao ler dados.");
    }
});

// Rota para salvar os dados na nuvem
app.post('/api/salvar', async (req, res) => {
    try {
        const resposta = await fetch(URL_JSONBIN, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(req.body)
        });
        if (resposta.ok) res.send("Salvo com sucesso!");
        else throw new Error("Falha no JSONbin");
    } catch (err) {
        console.error("Erro ao salvar:", err);
        res.status(500).send("Erro ao salvar.");
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
