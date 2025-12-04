// ==================== LEADERBOARD ====================
// API calls for online leaderboard

// API base URL - update this after deploying to Render
const API_BASE = 'https://your-render-app.onrender.com';  // TODO: Update with your Render URL

// Fetch top 20 scores
export async function fetchLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/api/balance-ball/scores`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        return await response.json();
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return null;
    }
}

// Submit a new score
export async function submitScore(name, score, message = '') {
    try {
        const response = await fetch(`${API_BASE}/api/balance-ball/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score, message })
        });
        if (!response.ok) throw new Error('Failed to submit score');
        return await response.json();
    } catch (error) {
        console.error('Score submit error:', error);
        return null;
    }
}

// Check if score would make top 20
export async function checkScore(score) {
    try {
        const response = await fetch(`${API_BASE}/api/balance-ball/check-score/${score}`);
        if (!response.ok) throw new Error('Failed to check score');
        return await response.json();
    } catch (error) {
        console.error('Score check error:', error);
        return { wouldRank: false, rank: null };
    }
}

// Format date for display
export function formatDate(dateString) {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
}
