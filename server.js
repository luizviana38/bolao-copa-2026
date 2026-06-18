const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para decodificar JSON e servir os arquivos estáticos (index.html)
app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'dados_bolao.json');

// Inicializa o arquivo JSON com uma estrutura vazia se ele não existir
if (!fs.existsSync(DATA_FILE)) {
    const estruturaInicial = { resultadosOficiais: {}, palpites: {} };
    fs.writeFileSync(DATA_FILE, JSON.stringify(estruturaInicial, null, 2));
}

// ROTA 1: Obter os dados atuais do arquivo JSON
app.get('/api/dados', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao ler os dados.' });
        }
        res.json(JSON.parse(data));
    });
});

// ROTA 2: Gravar/Salvar os novos dados no arquivo JSON
app.post('/api/salvar', (req, res) => {
    const novosDados = req.body;
    
    fs.writeFile(DATA_FILE, JSON.stringify(novosDados, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao salvar os dados.' });
        }
        res.json({ success: true, message: 'Dados gravados com sucesso no servidor!' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
// Variável de controle (por padrão, começa liberado)
let palpitesBloqueados = false;

// Rota para o Admin alterar o status (Bloquear/Liberar)
app.post('/api/admin/status-palpites', (req, res) => {
    const { bloquear } = req.body;
    palpitesBloqueados = bloquear;
    res.json({ success: true, bloqueado: palpitesBloqueados });
});

// Rota pública para os usuários consultarem se está bloqueado antes de salvar
app.get('/api/status-palpites', (req, res) => {
    res.json({ bloqueado: palpitesBloqueados });
});
