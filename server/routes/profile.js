const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/db');

const router = express.Router();

// GET /api/profile - Fetch user profile
router.get('/', auth, async (req, res) => {
    console.log('📋 Fetching profile for user:', req.user.id);
    
    try {
        const [profiles] = await db.query(
            `SELECT * FROM student_profiles WHERE user_id = ?`,
            [req.user.id]
        );
        
        const [users] = await db.query(
            `SELECT username, email, phone FROM users WHERE id = ?`,
            [req.user.id]
        );
        
        res.json({
            success: true,
            profile: profiles[0] || null,
            user: users[0] || null,
            hasProfile: profiles.length > 0
        });
        
    } catch (error) {
        console.error('Profile GET error:', error.message, error.code);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to load profile: ' + error.message
        });
    }
});

// POST /api/profile - Save/Update user profile
router.post('/', auth, async (req, res) => {
    console.log('📝 Saving profile for user:', req.user.id);
    console.log('DB available:', !!db);
    
    try {
        const {
            full_name,
            field_of_study,
            institution,
            province,
            year_of_study,
            average_mark,
            parent_income,
            gender,
            race,
            career_interests,
            skills,
            bio
        } = req.body;

        console.log('Profile data received:', { full_name, field_of_study, average_mark });

        const [existing] = await db.query(
            'SELECT id FROM student_profiles WHERE user_id = ?',
            [req.user.id]
        );
        
        console.log('Existing profile found:', existing.length > 0);

        if (existing.length > 0) {
            await db.query(
                `UPDATE student_profiles SET 
                    full_name = ?,
                    field_of_study = ?,
                    institution = ?,
                    province = ?,
                    year_of_study = ?,
                    average_mark = ?,
                    parent_income = ?,
                    gender = ?,
                    race = ?,
                    career_interests = ?,
                    skills = ?,
                    bio = ?
                WHERE user_id = ?`,
                [
                    full_name || null,
                    field_of_study || null,
                    institution || null,
                    province || null,
                    year_of_study || 1,
                    average_mark || null,
                    parent_income || null,
                    gender || null,
                    race || null,
                    career_interests || null,
                    skills || null,
                    bio || null,
                    req.user.id
                ]
            );
            console.log('✅ Profile updated');
        } else {
            await db.query(
                `INSERT INTO student_profiles (
                    user_id, full_name, field_of_study, institution, province,
                    year_of_study, average_mark, parent_income, gender, race,
                    career_interests, skills, bio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.user.id,
                    full_name || null,
                    field_of_study || null,
                    institution || null,
                    province || null,
                    year_of_study || 1,
                    average_mark || null,
                    parent_income || null,
                    gender || null,
                    race || null,
                    career_interests || null,
                    skills || null,
                    bio || null
                ]
            );
            console.log('✅ Profile created');
        }
        
        res.json({
            success: true,
            message: 'Profile saved successfully!'
        });
        
    } catch (error) {
        console.error('Profile POST error FULL:', error.message, error.code, error.errno);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save profile: ' + error.message 
        });
    }
});

module.exports = router;