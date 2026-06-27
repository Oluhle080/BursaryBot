const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const db = require('../config/db');

const router = express.Router();

// ── Folders ───────────────────────────────────────────────────────────────────
const profileDir = path.join(__dirname, '../../BBot/uploads/profiles');
const docDir = path.join(__dirname, '../../BBot/uploads/documents');
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });
if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });

// ── Multer for profile pictures (images only, memory) ────────────────────────
const imageStorage = multer.memoryStorage();
const imageUpload = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// ── Multer for documents (PDF + images, disk) ────────────────────────────────
const docStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, docDir),
    filename: (req, file, cb) => {
        const userId = req.user?.id || 'unknown';
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `user-${userId}-${Date.now()}${ext}`;
        cb(null, safeName);
    }
});
const docUpload = multer({
    storage: docStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedExt = /pdf|jpeg|jpg|png/;
        const allowedMime = /pdf|jpeg|jpg|png/;
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        if (allowedExt.test(ext) && allowedMime.test(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Only PDF and image files are allowed'));
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE PICTURE ROUTES (existing — unchanged)
// ══════════════════════════════════════════════════════════════════════════════

router.post('/profile-picture', auth, imageUpload.single('profile_pic'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const filename = `user-${req.user.id}-${Date.now()}.jpg`;
        const filepath = path.join(profileDir, filename);

        await sharp(req.file.buffer)
            .resize(300, 300, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toFile(filepath);

        const imagePath = `/uploads/profiles/${filename}`;
        await db.query('UPDATE users SET profile_pic = ? WHERE id = ?', [imagePath, req.user.id]);

        res.json({ success: true, message: 'Profile picture updated', profile_pic: imagePath });
    } catch (error) {
        console.error('Profile pic upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
    }
});

router.get('/profile-picture/:userId', async (req, res) => {
    try {
        const [users] = await db.query('SELECT profile_pic FROM users WHERE id = ?', [req.params.userId]);
        res.json({ success: true, profile_pic: users[0]?.profile_pic || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/profile-picture', auth, async (req, res) => {
    try {
        const [users] = await db.query('SELECT profile_pic FROM users WHERE id = ?', [req.user.id]);
        if (users[0]?.profile_pic) {
            const oldPath = path.join(__dirname, '../../BBot', users[0].profile_pic);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        await db.query('UPDATE users SET profile_pic = NULL WHERE id = ?', [req.user.id]);
        res.json({ success: true, message: 'Profile picture deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT ROUTES (new)
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/upload/document — upload a document
router.post('/document', auth, docUpload.single('document'), async (req, res) => {
    console.log('📄 Document upload request for user:', req.user.id);
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { doc_type } = req.body; // e.g. 'id_document', 'academic_results', 'proof_of_income'
        if (!doc_type) {
            // Delete the uploaded file since we can't categorise it
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Document type is required' });
        }

        const filename = req.file.filename;
        const original_name = req.file.originalname;
        const filePath = `/uploads/documents/${filename}`;

        // Save to documents table — replace if same type already uploaded
        await db.query(
            `INSERT INTO documents (user_id, doc_type, filename, original_name)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE filename = VALUES(filename), original_name = VALUES(original_name), created_at = NOW()`,
            [req.user.id, doc_type, filename, original_name]
        );

        console.log('✅ Document saved:', filename);
        res.json({
            success: true,
            message: 'Document uploaded successfully',
            document: {
                doc_type,
                filename,
                original_name,
                file_path: filePath
            }
        });

    } catch (error) {
        console.error('Document upload error:', error);
        // Clean up file if DB save failed
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
    }
});

// GET /api/upload/documents — get all documents for logged in user
router.get('/documents', auth, async (req, res) => {
    try {
        const [docs] = await db.query(
            'SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );

        // Add file URL to each doc
        const docsWithUrls = docs.map(d => ({
            ...d,
            file_url: `/uploads/documents/${d.filename}`
        }));

        res.json({ success: true, documents: docsWithUrls });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/upload/document/:id — delete a document
router.delete('/document/:id', auth, async (req, res) => {
    try {
        const [docs] = await db.query(
            'SELECT * FROM documents WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!docs.length) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const doc = docs[0];

        // Delete file from disk
        const filePath = path.join(docDir, doc.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        // Delete from DB
        await db.query('DELETE FROM documents WHERE id = ?', [doc.id]);

        res.json({ success: true, message: 'Document deleted' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;