const bcrypt = require('bcrypt');
const User = require('../models/User');
var nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.register = async (req, res) => {
    console.log(req.body)
    const { username, password, email } = req.body;
    const role = "user"

    // ตรวจสอบว่ามีชื่อผู้ใช้นี้ในฐานข้อมูลแล้วหรือไม่
    const existingUser = await User.findOne({ username: username });

    if (existingUser) {
        return res.render('auth/register', { error: `id ${username} มีคนใช้แล้ว`, message: '' });
    }

     // ตรวจสอบว่ามีชื่อผู้ใช้นี้ในฐานข้อมูลแล้วหรือไม่
     const existingEmail = await User.findOne({ email: email });

     if (existingEmail) {
         return res.render('auth/register', { error: `email ${email} มีคนใช้แล้ว`, message: '' });
     }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await User.create({
            username: username,
            password: hashedPassword,
            email:email,
            role: role
        });

        res.render('auth/register', { message: `succes create id ${newUser.username}`, error: '' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)
    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            // return res.status(401).json({ error: "Username not found" });
            return res.render('auth/login', { error: "Username not found", message: '' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            // return res.status(401).json({ error: "Incorrect password" });
            return res.render('auth/login', { error: "Incorrect password", message: '' });
        }

        req.session.UserId = user._id;

        // ตรวจสอบว่ามี URL ก่อนหน้าที่ต้องกลับไปหรือไม่
        const returnTo = req.session.returnTo;
        if (returnTo) {
            delete req.session.returnTo; // ลบ URL ที่บันทึกไว้หลังใช้งาน
            return res.redirect(returnTo);
        }
        res.redirect('/')
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.logout = async (req, res) => {
    req.session.UserId = null;
    // req.session.destroy(); // ลบข้อมูล session ออก
    req.session.message = 'Logout successful';
    res.redirect('/');
};

exports.account = async (req, res) => {
    try {
        const UserID = req.session.UserId;
        const user = await User.findOne({ _id: UserID });

        if (!user) {
            res.status(500).json({ error: error.message });
        }
        console.log(user);

        res.render('auth/account', { user: user, message: '' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.changepassword = async (req, res) => {
    try {

        const { password, confirmpassword } = req.body;

        if (!(password === confirmpassword)) {
            res.render('auth/changepassword', { error: "รหัสไม่ตรงกัน" });
        }

        const UserID = req.session.UserId;
        const user = await User.findOne({ _id: UserID });

        const hashedPassword = await bcrypt.hash(password, 10);

        if (!user) {
            res.status(500).json({ error: error.message });
        }
        console.log(user);

        // ทำการอัปเดตข้อมูลโพสต์
        user.password = hashedPassword;
        await user.save();

        res.render('auth/account', { user: user, message: 'เปลี่ยนรหัสเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.forgotpassword = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.gmail,
                pass: process.env.password
            }
        });

        const { email } = req.body;
    
        // สร้างรหัสผ่านรองสุ่ม
        const token = crypto.randomBytes(20).toString('hex');
    
        // หาผู้ใช้จากอีเมล
        const user = await User.findOne({ email });
    
        if (!user) {
            return res.status(400).send('User not found');
        }
    
        // บันทึก token และเวลาหมดอายุในฐานข้อมูล
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // หมดอายุใน 1 ชั่วโมง
        await user.save();
    
        // ส่งอีเมลยืนยันการเปลี่ยนรหัสผ่าน
        const mailOptions = {
            from: process.env.gmail,
            to: email,
            subject: 'Reset Password',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/auth/reset-password/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                // res.status(500).send('Error sending email');
                res.render('auth/forgotpassword', { user: user, message: '',error:'Error sending email'});
            } else {
                console.log(`Email sent: ${info.response}`);
                // res.status(200).send('Email sent');
                res.render('auth/forgotpassword', { user: user, message: 'โปรดดู link ในemail',error:''});
            }
        });

        // res.render('auth/forgotpassword', { user: user, message: 'โปรดดู link ในemail',error:''});
    } catch (error) {
        // res.status(500).json({ error: error.message });
        res.render('auth/forgotpassword', { user: user, message: '',error:error.message});
    }
};

exports.getlinkpassword = async (req, res) => {
    const token = req.params.token;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    const users = await User.find();
    if(users){
        console.log("usersss");
        console.log(users);
    }


    console.log(token);

    if (!user) {
        return res.status(400).send('Password reset token is invalid or has expired');
    }

    // แสดงหน้าเปลี่ยนรหัสผ่าน
    res.render('auth/reset-password', { token ,error:'',message:''});
};


exports.resetpassword = async (req, res) => {
    const token = req.params.token;
    const { password } = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).send('Password reset token is invalid or has expired');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // อัปเดตรหัสผ่านใหม่และลบข้อมูลเกี่ยวกับการรีเซ็ตรหัสผ่าน
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.render('auth/reset-password', { token ,error:'',message:'password ถูกเปลี่ยนเรียบร้อยแล้ว'});
};