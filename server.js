const express = require('express');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

// Validação de variável de ambiente
if (!process.env.MONGODB_URI) {
    console.error("ERRO: MONGODB_URI não definida nas variáveis de ambiente.");
    process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
    try {
        await client.connect();
        console.log("Conectado ao MongoDB com sucesso!");
        
        const db = client.db("BolaoCopaDB");
        const collection = db.collection("dados");

        // MIGRACAO AUTOMATICA
        const count = await collection.countDocuments();
        if (count === 0 && fs.existsSync('dados_bolao.json')) {
            const localData = JSON.parse(fs.readFileSync('dados_bolao.json', 'utf8'));
            await collection.insertOne(localData);
            console.log("Migração inicial realizada.");
        }

        app.use(express.json());
        app.use(express.static(__dirname));

        // Rota de GET com tratamento de erro
        app.get('/api/dados', async (req, res) => {
            try {
                const data = await collection.findOne({});
                res.json(data || { resultadosOficiais: {}, palpites: {} });
            } catch (err) {
                res.status(500).json({ error: "Erro ao buscar dados do servidor" });
            }
        });

        // Rota de POST com tratamento de erro e validação básica
        app.post('/api/salvar', async (req, res) => {
            try {
                if (!req.body || Object.keys(req.body).length === 0) {
                    return res.status(400).send("Dados inválidos recebidos.");
                }
                await collection.replaceOne({}, req.body, { upsert: true });
                res.status(200).send("Dados salvos com sucesso.");
            } catch (err) {
                console.error("Erro no salvamento:", err);
                res.status(500).send("Erro interno ao salvar dados.");
            }
        });

        app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

    } catch (error) {
        console.error("Falha fatal ao iniciar servidor:", error);
    }
}

// Manter o processo vivo em caso de erros não tratados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

startServer();
