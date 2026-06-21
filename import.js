
const fs = require('fs');
const { MongoClient } = require('mongodb');

// Use a mesma string de conexão que você colocou no server.js
const uri = "mongodb+srv://luizviana_db:luiz@2206@bolaocopadb.mw6sxqf.mongodb.net/?appName=BolaoCopaDB";
const client = new MongoClient(uri);

async function migrar() {
    try {
        await client.connect();
        const db = client.db("BolaoCopaDB");
        
        // Lê seu arquivo atual
        const dadosAtuais = JSON.parse(fs.readFileSync('dados_bolao.json', 'utf8'));
        
        // Salva no MongoDB
        await db.collection("dados").replaceOne({}, dadosAtuais, { upsert: true });
        
        console.log("SUCESSO: Seus dados antigos foram movidos para o MongoDB!");
    } catch (e) {
        console.error("Erro na migração:", e);
    } finally {
        await client.close();
    }
}

migrar();
