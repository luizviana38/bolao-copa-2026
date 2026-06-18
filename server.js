const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// AJUSTE PARA A WEB: Usa a porta do Render ou a 3000 localmente
const PORT = process.env.PORT || 3000;

// Variável de controle do bloqueio (começa liberado)
let palpitesBloqueados = false;

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

// ROTA 2: Gravar/Salvar os novos dados no arquivo JSON (Com validação de bloqueio)
app.post('/api/salvar', (req, res) => {
    // Se o admin bloqueou e NÃO for uma gravação de resultados oficiais, barra o salvamento
    // Nota: Se o seu index.html enviar algo que identifique que é o Admin salvando os resultados oficiais, 
    // você pode ignorar o bloqueio. Caso contrário, o bloqueio simples impede qualquer gravação:
    if (palpitesBloqueados && req.body.resultadosOficiais === undefined) {
        return res.status(403).json({ 
            success: false, 
            message: "Os palpites para esta rodada já foram bloqueados pelo Administrador!" 
        });
    }

    const novosDados = req.body;
    
    fs.writeFile(DATA_FILE, JSON.stringify(novosDados, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao salvar os dados.' });
        }
        res.json({ success: true, message: 'Dados gravados com sucesso no servidor!' });
    });
});

// ROTA 3: Admin altera o status (Bloquear/Liberar)
app.post('/api/admin/status-palpites', (req, res) => {
    const { bloquear } = req.body;
    palpitesBloqueados = bloquear;
    res.json({ success: true, bloqueado: palpitesBloqueados });
});

// ROTA 4: Usuários consultam se está bloqueado antes de interagir
app.get('/api/status-palpites', (req, res) => {
    res.json({ bloqueado: palpitesBloqueados });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando perfeitamente na porta: ${PORT}`);
});
