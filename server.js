const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'dados.json');

app.use(express.json());
app.use(express.static(__dirname));

function lerDados() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(rawData);
        }
    } catch (error) {
        console.error("Erro ao ler dados.json:", error);
    }
    return { resultadosOficiais: {}, palpites: {} };
}

// Rota GET padrão para o frontend puxar os dados salvos
app.get('/api/dados', (req, res) => {
    res.json(lerDados());
});

// Rota POST padrão para salvar dados vindos do frontend
app.post('/api/dados', (req, res) => {
    try {
        const novosDados = req.body;
        if (!novosDados || typeof novosDados !== 'object') {
            return res.status(400).json({ error: "Dados inválidos." });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(novosDados, null, 2), 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
        res.status(500).json({ error: "Erro interno." });
    }
});

// ==========================================
// ROTA ESPECIAL DE RESTAURAÇÃO FORÇADA
// ==========================================
app.get('/restaurar-tudo', (req, res) => {
    try {
        // Código Base64 do seu backup completo do bolão
        const backupBase64 = "eyJyZXN1bHRhZG9zT2ZpY2lhaXMiOnsiMSI6eyJtIjoyLCJ2IjowfSwiMiI6eyJtIjoyLCJ2IjoxfSwiNyI6eyJtIjoxLCJ2IjoxfSwiOCI6eyJtIjoxLCJ2IjoxfSwiMTMiOnsibSI6MSwidiI6MX0sIjE0Ijp7Im0iOjAsInYiOjF9LCItcIjo0LCJ2IjoxfSwiMjAiOnsibSI6MiwidiI6MH0sIjI1Ijp7Im0iOjcsInYiOjF9LCIyNiI6eyJtIjoxLCJ2IjowfSwiMzEiOnsibSI6MiwidiI6Mn0sIjMyIjp7Im0iOjUsInYiOjF9LCIzNyI6eyJtIjoxLCJ2IjoxfSwiMzgiOnsibSI6MiwidiI6Mn0sIjMzIjp7Im0iOjAsInYiOjB9LCI0NCI6eyJtIjoxLCJ2IjoxfSwiNDkiOnsibSI6MywidiI6MX0sIjUwIjp7Im0iOjEsInYiOjR9LCI1NSI6eyJtIjozLCJ2IjowfSwiNTYiOnsibSI6MywidiI6MX19LCJwYWxwaXRlcyI6eyJMdWl6IFZpYW5hIjp7fSwiQ2FpbyI6eyIxIjp7Im0iOjIsInYiOjB9LCIyIjp7Im0iOjIsInYiOjF9LCIzIjp7Im0iOjEsInYiOjF9LCI0Ijp7Im0iOjAsInYiOjF9LCI1Ijp7Im0iOjAsInYiOjF9LCI2Ijp7Im0iOjAsInYiOjF9LCI3Ijp7Im0iOjEsInYiOjF9LCI4Ijp7Im0iOjEsInYiOjF9LCI5Ijp7Im0iOjEsInYiOjB9LCIxMCI6eyJtIjowLCJ2IjowfSwiMTEiOnsibSI6MSwidiI6Mn0sIjEyIjp7Im0iOjEsInYiOjB9LCIxMyI6eyJtIjoxLCJ2IjoxfSwiMTQiOnsibSI6MCwidiI6MX0sIjE1Ijp7Im0iOjMsInYiOjB9LCIxNiI6eyJtIjoyLCJ2IjowfSwiMTciOnsibSI6MCwidiI6Mn0sIjE4Ijp7Im0iOjMsInYiOjB9LCIxOSI6eyJtIjo0LCJ2IjoxfSwiMjAiOnsibSI6MiwidiI6MH0sIjIxIjp7Im0iOjIsInYiOjF9LCIyMiI6eyJtIjoyLCJ2IjowfSwiMjMiOnsibSI6MCwidiI6M30sIjI0Ijp7Im0iOjEsInYiOjB9LCIyNSI6eyJtIjo3LCJ2IjoxfSwiMjYiOnsibSI6MSwidiI6MH0sIjI3Ijp7Im0iOj3LCJ2IjoxfSwiMjgiOnsibSI6MCwidiI6Mn0sIjI5Ijp7Im0iOjEsInYiOjN9LCIzMCI6eyJtIjoxLCJ2IjoyfSwiMzEiOnsibSI6MiwidiI6Mn0sIjMyIjp7Im0iOjUsInYiOjF9LCIzMyI6eyJtIjoyLCJ2IjoxfSwiMzQiOnsibSI6MywidiI6MH0sIjM1Ijp7Im0iOjEsInYiIjoyfSwiMzYiOnsibSI6MSwidiI6MH0sIjM3Ijp7Im0iOjEsInYiOjF9LCIzOCI6eyJtIjoyLCJ2IjoyfSwiMzkiOnsibSI6MiwidiI6MX0sIjQwIjp7Im0iOjEsInYiOjB9LCI0MSI6eyJtIjoxLCJ2IjoyfSwiNDIiOnsibSI6MSwidiI6MH0sIjQzIjp7Im0iOjAsInYiOjB9LCI0NCI6eyJtIjoxLCJ2IjoxfSwiNDUiOnsibSI6MiwidiI6MH0sIjY2Ijp7Im0iOjAsInYiOjF9LCI0NyI6eyJtIjoyLCJ2IjozfSwiNDgiOnsibSI6MSwidiI6MH0sIjQ5Ijp7Im0iOjMsInYiOjF9LCI1MCI6eyJtIjoxLCJ2Ijo0fSwiNTEiOnsibSI6NCwidiI6MH0sIjUyIjp7Im0iOjEsInYiIjoyfSwiNTMiOnsibSI6MSwidiI6Mn0sIjU0Ijp7Im0iOjEsInYiOjB9LCI1NSI6eyJtIjozLCJ2IjowfSwiNTYiOnsibSI6MywidiI6MX0sIjU3Ijp7Im0iOjIsInYiOjF9LCI1OCI6eyJtIjoxLCJ2IjowfSwiNTkiOnsibSI6MCwidiI6M30sIjYwIjp7Im0iOjAsInYiOjF9LCI2MSI6eyJtIjo1LCJ2IjowfSwiNjIiOnsibSI6MCwidiI6Mn0sIjYzIjp7Im0iOjMsInYiOjB9LCI2NCI6eyJtIjoxLCJ2IjoyfSwiNjUiOnsibSI6MSwidiI6Mn0sIjY2Ijp7Im0iOjEsInYiOjF9LCI2NyI6eyJtIjoyLCJ2IjoxfSwiNjgiOnsibSI6MiwidiI6MX0sIjY5Ijp7Im0iOjIsInYiOjF9LCI3MCI6eyJtIjoxLCJ2IjowfSwiNzEiOnsibSI6MCwidiI6Mn0sIjcyIjp7Im0iOjEsInYiOjF9fSwiRGF2aWQiOnt9LCJNw6FyY2lvIjp7fSwiVGFpbsOhIjp7fX19";
        
        // Decodifica e converte de volta para Objeto JSON
        const stringDecodificada = Buffer.from(backupBase64, 'base64').toString('utf8');
        const jsonRestaurado = JSON.parse(stringDecodificada);
        
        // Grava por cima do arquivo zerado
        fs.writeFileSync(DATA_FILE, JSON.stringify(jsonRestaurado, null, 2), 'utf8');
        
        res.send("<h1>✅ Banco de dados restaurado com sucesso!</h1><p>Pode voltar para a página do bolão e dar um F5/Atualizar.</p>");
    } catch (e) {
        res.status(500).send("<h1>❌ Erro ao restaurar:</h1><p>" + e.message + "</p>");
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
