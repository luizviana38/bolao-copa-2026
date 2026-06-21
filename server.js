const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// O Render define automaticamente a porta na variável de ambiente process.env.PORT
const PORT = process.env.PORT || 3000;

// Caminho para salvar o arquivo de dados
const DATA_FILE = path.join(__dirname, 'dados.json');

// Middlewares obrigatórios (Removemos o CORS para não exigir instalação de módulo)
app.use(express.json());

// Servir os arquivos estáticos da pasta raiz (onde está o seu index.html)
app.use(express.static(__dirname));

// Função auxiliar para ler os dados de forma segura
function lerDados() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(rawData);
        }
    } catch (error) {
        console.error("Erro ao ler dados.json, resetando estrutura:", error);
    }
    return { resultadosOficiais: {}, palpites: {} };
}

// Rota GET: Envia os dados para o frontend
app.get('/api/dados', (req, res) => {
    const dados = lerDados();
    res.json(dados);
});

// Rota POST: Salva os palpites e resultados oficiais
app.post('/api/dados', (req, res) => {
    try {
        const novosDados = req.body;
        
        if (!novosDados || typeof novosDados !== 'object') {
            return res.status(400).json({ error: "Dados inválidos." });
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(novosDados, null, 2), 'utf8');
        console.log("Dados do Bolão atualizados com sucesso!");
        
        res.json({ success: true, message: "Dados salvos com sucesso!" });
    } catch (error) {
        console.error("Erro crítico ao salvar os dados:", error);
        res.status(500).json({ error: "Erro interno ao salvar os dados no servidor." });
    }
});

// Qualquer outra rota reconduz ao index.html principal
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicialização estável escutando a porta exigida pelo Render
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
