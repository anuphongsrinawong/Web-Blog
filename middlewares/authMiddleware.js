
const authMiddleware = (req, res, next) => {

  if (!loggedIn) {
    req.session.returnTo = req.originalUrl; // บันทึก URL หน้าปัจจุบัน
    return res.redirect('/auth/login');
  }

  try {
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid loggedIn' });
  }
};

module.exports = authMiddleware;
