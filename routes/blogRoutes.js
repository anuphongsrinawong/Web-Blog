const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middlewares/authMiddleware'); // เพิ่มส่วนนี้


router.get('/mypost', authMiddleware, blogController.getMyPost);

router.get('/newpost',authMiddleware,(req,res)=>{
    res.render('blog/newpost')
});

router.post('/newpost',authMiddleware,blogController.newPost);

router.post('/newpost',authMiddleware,blogController.newPost);

router.post('/deletepost/:id',authMiddleware,blogController.deletePost);

router.post('/preeditpost/:id',authMiddleware,blogController.preEditPost);

router.post('/editpost/:id',authMiddleware,blogController.editPost);

router.get('/:id', blogController.getPost);

router.get('/', blogController.getAllPost);

module.exports = router;