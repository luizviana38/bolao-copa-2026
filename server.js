const express = require('express');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

// A URI virá das Configurações de Variáveis de Ambiente do seu serviço de hospedagem
const uri = process.env.MONGODB_URI; 
const client = new MongoClient(uri);

async function startServer() {
    await client.connect();
    const db = client.db("BolaoCopaDB");
    const collection = db.collection("dados");

    // MIGRACAO AUTOMATICA: Se o banco estiver vazio, importa do JSON
    const count = await collection.countDocuments();
    if (count === 0 && fs.existsSync('dados_bolao.json')) {
        const localData = JSON.parse(fs.readFileSync('dados_bolao.json', 'utf8'));
        await collection.insertOne(localData);
        console.log("Migração de dados realizada com sucesso!");
    }

    app.use(express.json());
    app.use(express.static(__dirname));

    app.get('/api/dados', async (req, res) => {
        const data = await collection.findOne({});
        res.json(data || { resultadosOficiais: {}, palpites: {} });
    });

    app.post('/api/salvar', async (req, res) => {
        await collection.replaceOne({}, req.body, { upsert: true });
        res.send("Dados salvos no MongoDB.");
    });

    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

startServer().catch(console.error);
