const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/db');

const router = express.Router();

// ── Bursary data (hardcoded — no DB table needed) ────────────────────────────
const bursaries = [
    { id: 1, name: 'NSFAS Bursary', provider: 'NSFAS', field_of_study: 'All Fields', province: 'All', deadline: '2026-11-30', apply_link: 'https://www.nsfas.org.za', description: 'Financial support for South African students from low-income households.', min_average: 50, income_limit: 350000, tags: ['financial aid', 'government', 'all fields'] },
    { id: 2, name: 'Funza Lushaka Teaching Bursary', provider: 'Department of Education', field_of_study: 'Education', province: 'All', deadline: '2026-10-01', apply_link: 'https://www.funzalushaka.doe.gov.za', description: 'Teaching bursary for future educators.', min_average: 60, income_limit: 300000, tags: ['teaching', 'education', 'government'] },
    { id: 3, name: 'Sasol Engineering Bursary', provider: 'Sasol', field_of_study: 'Engineering', province: 'Gauteng', deadline: '2026-09-15', apply_link: 'https://www.sasolbursaries.com', description: 'Bursary for engineering students with strong academic records.', min_average: 65, income_limit: 400000, tags: ['engineering', 'stem', 'corporate'] },
    { id: 4, name: 'Sasol Foundation Bursary', provider: 'Sasol', field_of_study: 'IT', province: 'All', deadline: '2026-12-31', apply_link: 'https://www.sasol.com/bursaries', description: 'For students in Science, Technology, Engineering, and Mathematics.', min_average: 65, income_limit: 400000, tags: ['stem', 'engineering', 'it', 'science'] },
    { id: 5, name: 'Transnet Bursary', provider: 'Transnet', field_of_study: 'Engineering', province: 'KwaZulu-Natal', deadline: '2026-08-20', apply_link: 'https://www.transnet.net', description: 'Funding for transport and logistics studies.', min_average: 60, income_limit: 350000, tags: ['transport', 'logistics', 'engineering'] },
    { id: 6, name: 'MTN Bursary Programme', provider: 'MTN South Africa', field_of_study: 'IT', province: 'All', deadline: '2026-12-31', apply_link: 'https://www.mtn.co.za/bursaries', description: 'For students in IT, Data Science, Telecommunications, and Business.', min_average: 65, income_limit: 350000, tags: ['it', 'telecommunications', 'data science'] },
    { id: 7, name: 'Vodacom Bursary', provider: 'Vodacom', field_of_study: 'IT', province: 'All', deadline: '2026-11-30', apply_link: 'https://www.vodacom.co.za/bursaries', description: 'For students in IT, Data Science, and Telecommunications.', min_average: 65, income_limit: 350000, tags: ['it', 'telecommunications', 'data'] },
    { id: 8, name: 'Old Mutual Bursary', provider: 'Old Mutual', field_of_study: 'IT', province: 'All', deadline: '2027-01-31', apply_link: 'https://www.oldmutual.com/bursaries', description: 'For students in IT, Actuarial Science, Finance, and Business.', min_average: 68, income_limit: 400000, tags: ['finance', 'it', 'business', 'actuarial'] },
    { id: 9, name: 'Standard Bank Bursary', provider: 'Standard Bank', field_of_study: 'IT', province: 'All', deadline: '2027-01-31', apply_link: 'https://www.standardbank.com/bursaries', description: 'For students in IT, Finance, Economics, and Business Management.', min_average: 65, income_limit: 400000, tags: ['banking', 'it', 'finance', 'business'] },
    { id: 10, name: 'BANKSETA IT Bursary', provider: 'Banking Sector Education Authority', field_of_study: 'IT', province: 'All', deadline: '2026-11-30', apply_link: 'https://www.bankseta.org.za/', description: 'For IT students in banking technology, software development, and data science.', min_average: 65, income_limit: 350000, tags: ['it', 'technology', 'software', 'banking'] },
    { id: 11, name: 'IT Excellence Bursary', provider: 'TechSA', field_of_study: 'IT', province: 'All', deadline: '2026-12-15', apply_link: 'https://techsa.co.za', description: 'For IT students with 65%+ average.', min_average: 65, income_limit: 350000, tags: ['it', 'technology', 'excellence'] },
    { id: 12, name: 'Agriculture Development Fund', provider: 'AgriSA', field_of_study: 'Agriculture', province: 'All', deadline: '2026-11-30', apply_link: 'https://agrisa.co.za/bursary', description: 'Supporting future farmers and agricultural specialists.', min_average: 60, income_limit: 250000, tags: ['agriculture', 'farming', 'agri'] },
    { id: 13, name: 'LGSETA Public Management Bursary', provider: 'Local Government SETA', field_of_study: 'Public Management', province: 'All', deadline: '2026-11-30', apply_link: 'https://www.lgseta.org.za/', description: 'For students in Public Management, Administration, and Local Government.', min_average: 60, income_limit: 350000, tags: ['public management', 'administration', 'government'] },
    { id: 14, name: 'Mpumalanga Provincial Bursary', provider: 'Mpumalanga Government', field_of_study: 'All', province: 'Mpumalanga', deadline: '2026-10-31', apply_link: 'https://www.mpg.gov.za/', description: 'For Mpumalanga residents. Priority to students from rural areas.', min_average: 55, income_limit: 250000, tags: ['provincial', 'mpumalanga', 'all fields'] },
    { id: 15, name: 'Garden Route Bursary', provider: 'Garden Route District Municipality', field_of_study: 'All', province: 'Western Cape', deadline: '2026-11-30', apply_link: 'https://www.gardenroute.gov.za/', description: 'For residents of Garden Route area. Supports various fields.', min_average: 60, income_limit: 300000, tags: ['municipal', 'western cape', 'all fields'] },
    { id: 16, name: 'KZN Provincial Bursary', provider: 'KwaZulu-Natal Government', field_of_study: 'All', province: 'KwaZulu-Natal', deadline: '2026-10-31', apply_link: 'https://www.kzntreasury.gov.za/bursaries', description: 'For KZN residents pursuing higher education.', min_average: 55, income_limit: 250000, tags: ['provincial', 'kzn', 'all fields'] },
    { id: 17, name: 'Western Cape Bursary', provider: 'Western Cape Government', field_of_study: 'All', province: 'Western Cape', deadline: '2026-11-30', apply_link: 'https://www.westerncape.gov.za/bursaries', description: 'For Western Cape residents. Supports various fields.', min_average: 60, income_limit: 300000, tags: ['provincial', 'western cape', 'all fields'] },
    { id: 18, name: 'Gauteng City Region Bursary', provider: 'Gauteng Government', field_of_study: 'IT', province: 'Gauteng', deadline: '2026-12-31', apply_link: 'https://www.gauteng.gov.za/bursaries', description: 'For Gauteng residents in scarce skills qualifications.', min_average: 65, income_limit: 350000, tags: ['provincial', 'gauteng', 'scarce skills'] }
];

// ── Matching function ─────────────────────────────────────────────────────────
function matchBursaries(profile) {
    const studentField = (profile.field_of_study || '').toLowerCase().trim();
    const studentProvince = (profile.province || '').toLowerCase().trim();
    const studentMark = parseFloat(profile.average_mark) || 0;
    const studentIncome = parseFloat(profile.parent_income) || 0;

    return bursaries
        .map(b => {
            let score = 0;
            const reasons = [];
            const bField = (b.field_of_study || '').toLowerCase();
            const bProvince = (b.province || '').toLowerCase();

            // Field of study — 40 points
            if (bField === 'all' || bField === 'all fields') {
                score += 30;
                reasons.push('Open to all fields');
            } else if (studentField && (bField.includes(studentField) || studentField.includes(bField))) {
                score += 40;
                reasons.push('Matches your field of study');
            } else {
                // Check tags too
                const tagMatch = b.tags && b.tags.some(t => t.toLowerCase().includes(studentField) || studentField.includes(t.toLowerCase()));
                if (tagMatch) {
                    score += 35;
                    reasons.push('Related to your field');
                } else {
                    score -= 20; // Wrong field — penalise
                }
            }

            // Academic mark — 30 points
            if (b.min_average && studentMark > 0) {
                if (studentMark >= b.min_average) {
                    score += 30;
                    reasons.push(`Your ${studentMark}% meets the ${b.min_average}% minimum`);
                } else {
                    score -= 30; // Below minimum — heavy penalty
                    reasons.push(`Your ${studentMark}% is below the ${b.min_average}% minimum`);
                }
            } else {
                score += 15; // No mark restriction
            }

            // Income — 20 points
            if (b.income_limit && studentIncome > 0) {
                if (studentIncome <= b.income_limit) {
                    score += 20;
                    reasons.push('Meets income requirement');
                } else {
                    score -= 20;
                    reasons.push('Income exceeds limit');
                }
            } else {
                score += 10;
            }

            // Province — 10 points
            if (bProvince === 'all' || bProvince === 'south africa') {
                score += 10;
            } else if (studentProvince && bProvince.includes(studentProvince)) {
                score += 10;
                reasons.push('Available in your province');
            } else {
                score -= 10; // Wrong province
            }

            const match_score = Math.min(100, Math.max(0, score));
            return { ...b, match_score, reasons };
        })
        .filter(b => b.match_score >= 40)
        .sort((a, b) => b.match_score - a.match_score);
}

// ── GET /api/external-bursaries/match — REAL matching against student profile ──
router.get('/match', auth, async (req, res) => {
    try {
        const [profiles] = await db.query(
            'SELECT * FROM student_profiles WHERE user_id = ?',
            [req.user.id]
        );

        if (!profiles.length) {
            return res.status(404).json({
                success: false,
                message: 'No profile found. Please complete your profile first.'
            });
        }

        const profile = profiles[0];
        const matches = matchBursaries(profile);

        // Profile completeness
        const fields = ['field_of_study', 'institution', 'average_mark', 'parent_income', 'province'];
        const filled = fields.filter(f => profile[f] && profile[f] !== '').length;
        const profileComplete = Math.round((filled / fields.length) * 100);

        // Saved bursary count
        let savedCount = 0;
        try {
            const [[row]] = await db.query(
                'SELECT COUNT(*) as count FROM saved_bursaries WHERE user_id = ?',
                [req.user.id]
            );
            savedCount = row.count;
        } catch {}

        res.json({
            success: true,
            matches,
            totalMatches: matches.length,
            profileComplete,
            savedCount
        });

    } catch (error) {
        console.error('Match error:', error.message);
        res.status(500).json({ success: false, message: 'Matching failed: ' + error.message });
    }
});

// ── GET /api/external-bursaries/notifications — expiring within 14 days ──────
router.get('/notifications', auth, async (req, res) => {
    try {
        const today = new Date();
        const in14 = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

        const expiring = bursaries
            .filter(b => {
                const d = new Date(b.deadline);
                return d >= today && d <= in14;
            })
            .map(b => {
                const daysLeft = Math.ceil((new Date(b.deadline) - today) / (1000 * 60 * 60 * 24));
                return { ...b, days_left: daysLeft };
            })
            .sort((a, b) => a.days_left - b.days_left);

        res.json({ success: true, notifications: expiring });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load notifications' });
    }
});

// ── POST /api/external-bursaries/save ────────────────────────────────────────
router.post('/save', auth, async (req, res) => {
    try {
        const { bursary_id } = req.body;
        await db.query(
            'INSERT IGNORE INTO saved_bursaries (user_id, bursary_id) VALUES (?, ?)',
            [req.user.id, bursary_id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save bursary' });
    }
});

// ── GET /api/external-bursaries — all bursaries (browse) ─────────────────────
router.get('/', async (req, res) => {
    try {
        const { field, province } = req.query;
        let filtered = [...bursaries];
        if (field && field !== 'all') filtered = filtered.filter(b => b.field_of_study.toLowerCase().includes(field.toLowerCase()));
        if (province && province !== 'all') filtered = filtered.filter(b => b.province.toLowerCase().includes(province.toLowerCase()));
        res.json({ success: true, bursaries: filtered, count: filtered.length, total: bursaries.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch bursaries' });
    }
});

// ── GET /api/external-bursaries/search ───────────────────────────────────────
router.get('/search', async (req, res) => {
    try {
        const { q, field, province } = req.query;
        let filtered = [...bursaries];
        if (q) {
            const s = q.toLowerCase();
            filtered = filtered.filter(b =>
                b.name.toLowerCase().includes(s) ||
                b.provider.toLowerCase().includes(s) ||
                b.description.toLowerCase().includes(s) ||
                (b.tags && b.tags.some(t => t.toLowerCase().includes(s)))
            );
        }
        if (field && field !== 'all') filtered = filtered.filter(b => b.field_of_study.toLowerCase().includes(field.toLowerCase()));
        if (province && province !== 'all') filtered = filtered.filter(b => b.province.toLowerCase().includes(province.toLowerCase()));
        res.json({ success: true, total: filtered.length, results: filtered, query: q || '' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});

// ── GET /api/external-bursaries/:id ──────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const bursary = bursaries.find(b => b.id === parseInt(req.params.id));
        if (!bursary) return res.status(404).json({ success: false, message: 'Bursary not found' });
        res.json({ success: true, bursary });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch bursary' });
    }
});

module.exports = router;