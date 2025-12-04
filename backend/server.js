// Balance Ball Leaderboard API
// Deploy to Render

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors({
    origin: [
        'https://jurigregg.com',
        'http://jurigregg.com',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', game: 'balance-ball' });
});

// GET /api/balance-ball/scores - Fetch top 20 scores
app.get('/api/balance-ball/scores', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('id, name, score, message, created_at')
            .order('score', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch scores' });
        }

        // Add rank to each entry
        const rankedData = data.map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));

        res.json(rankedData);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/balance-ball/score - Submit a new score
app.post('/api/balance-ball/score', async (req, res) => {
    try {
        const { name, score, message } = req.body;

        // Validation
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (typeof score !== 'number' || score < 0) {
            return res.status(400).json({ error: 'Valid score is required' });
        }

        // Sanitize inputs
        const cleanName = name.trim().substring(0, 20);
        const cleanMessage = (message || '').trim().substring(0, 30);
        const cleanScore = Math.floor(Math.max(0, Math.min(score, 99999)));

        if (cleanName.length < 1) {
            return res.status(400).json({ error: 'Name cannot be empty' });
        }

        // Insert into database
        const { data, error } = await supabase
            .from('leaderboard')
            .insert([{
                name: cleanName,
                score: cleanScore,
                message: cleanMessage
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: 'Failed to save score' });
        }

        // Check if this score made it to top 20
        const { data: topScores } = await supabase
            .from('leaderboard')
            .select('id')
            .order('score', { ascending: false })
            .limit(20);

        const isTopScore = topScores?.some(s => s.id === data.id) || false;

        res.json({
            success: true,
            entry: data,
            isTopScore
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check if a score would make top 20
app.get('/api/balance-ball/check-score/:score', async (req, res) => {
    try {
        const score = parseInt(req.params.score);
        
        if (isNaN(score) || score < 0) {
            return res.json({ wouldRank: false, rank: null });
        }

        const { data, error } = await supabase
            .from('leaderboard')
            .select('score')
            .order('score', { ascending: false })
            .limit(20);

        if (error) {
            return res.status(500).json({ error: 'Failed to check score' });
        }

        // Find where this score would rank
        let rank = 1;
        for (const entry of data) {
            if (score > entry.score) break;
            rank++;
        }

        const wouldRank = rank <= 20 || data.length < 20;

        res.json({ wouldRank, rank: wouldRank ? rank : null });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Balance Ball API running on port ${PORT}`);
});
