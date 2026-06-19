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

const lerDados = () => {
    try {
        if (!fs.existsSync(dadosPath)) {
            // Estrutura inicial idêntica à que o index.html gerencia
            const estruturaInicial = {
                resultadosOficiais: {},
                palpites: {
                    "Luiz Viana": {},
                    "Caio": {},
                    "David": {},
                    "Márcio": {},
                    "Tainá": {}
                }
            };
            fs.writeFileSync(dadosPath, JSON.stringify(estruturaInicial, null, 2), 'utf-8');
            return estruturaInicial;
        }
        const data = fs.readFileSync(dadosPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Erro ao ler dados:", error);
        return { resultadosOficiais: {}, palpites: {} };
    }
};

const salvarDados = (dados) => {
    try {
        fs.writeFileSync(dadosPath, JSON.stringify(dados, null, 2), 'utf-8');
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
    }
};

// Rota para ler todos os dados unidos
app.get('/api/dados', (req, res) => {
    const dados = lerDados();
    res.json(dados);
});

// NOVA ROTA: Alinhada com a chamada do botão salvar e importar do index.html
app.post('/api/salvar', (req, res) => {
    const novosDados = req.body;

    if (!novosDados || !novosDados.palpites || !novosDados.resultadosOficiais) {
        return res.status(400).json({ success: false, message: 'Estrutura de dados inválida.' });
    }

    // Grava o objeto completo enviado pelo front-end (dadosBolao)
    salvarDados(novosDados);
    res.json({ success: true, message: 'Dados sincronizados com sucesso!' });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
