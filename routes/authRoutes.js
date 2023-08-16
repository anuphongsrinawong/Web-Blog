const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // เพิ่มส่วนนี้


router.get('/register', (req, res) => {
    res.render('auth/register', { message: '', error: '' });
});
router.post('/register', authController.register);



router.get('/login', (req, res) => {
    if (!loggedIn) {
        res.render('auth/login', { message: '', error: '' });
    }
    else {
        res.redirect('/blog');
    }

});
router.post('/login', authController.login);



router.post('/logout', authController.logout);


router.get('/account', authMiddleware, authController.account);

router.get('/changepassword', authMiddleware, (req, res) => {
    res.render('auth/changepassword', { error: '', message: '' });
});

router.post('/changepassword', authController.changepassword);


router.get('/forgotpassword', (req, res) => {
    res.render('auth/forgotpassword', { error: '', message: '' });
});

router.post('/forgotpassword', authController.forgotpassword);

// เข้าไปที่ลิงก์เพื่อเปลี่ยนรหัสผ่านใหม่
router.get('/reset-password/:token',authController.getlinkpassword);

// บันทึกรหัสผ่านใหม่
router.post('/reset-password/:token',authController.resetpassword);

module.exports = router;
