const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// =================================================================
// CREDENCIAIS DO SEU PROJETO SUPABASE
// =================================================================
const SUPABASE_URL = 'https://mvyclbnkhhyqfovkxaxq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UnDoq1JUj5vNM-d7VSuxtg_XmG6tAxz';
// =================================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Rota para ler os dados vindos direto do banco de dados na nuvem
app.get('/api/dados', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bota_copa_dados')
            .select('dados')
            .eq('id', 1)
            .single();

        if (error || !data) {
            console.error("Erro ao ler dados do Supabase:", error);
            return res.status(500).json({ error: "Erro ao buscar dados na nuvem." });
        }

        res.json(data.dados);
    } catch (err) {
        console.error("Erro interno:", err);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

// Rota para gravar definitivamente os dados na nuvem
app.post('/api/salvar', async (req, res) => {
    const novosDados = req.body;

    if (!novosDados || !novosDados.palpites || !novosDados.resultadosOficiais) {
        return res.status(400).json({ success: false, message: 'Estrutura de dados inválida.' });
    }

    try {
        const { error } = await supabase
            .from('bota_copa_dados')
            .update({ dados: novosDados, updated_at: new Date() })
            .eq('id', 1);

        if (error) {
            console.error("Erro ao salvar no Supabase:", error);
            return res.status(500).json({ success: false, message: "Falha ao gravar na base de dados." });
        }

        res.json({ success: true, message: 'Dados gravados definitivamente na nuvem!' });
    } catch (err) {
        console.error("Erro interno:", err);
        res.status(500).json({ success: false, message: "Erro interno no servidor." });
    }
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
