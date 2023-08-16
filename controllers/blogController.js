const BlogPost = require('../models/Blog');


exports.getAllPost = async (req, res) => {
  try {
    const blog = await BlogPost.find();
    res.render('blog/blog', { blog: blog });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const id =req.params.id;

    const blog = await BlogPost.findOne({ _id : id });
    if(blog){
      res.render('blog/post', { blog: blog });
    }else{
      res.status(500).json({ error: "not found blog" });
    }
    

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getMyPost = async (req, res) => {
  try {
    // ตรวจสอบว่า UserId มีค่าหรือไม่ก่อนดึงข้อมูล
    if (!req.session.UserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(req.session.UserId)

    const UserId = req.session.UserId;

    const blog = await BlogPost.find({ userid: UserId });

    res.render('blog/mypost', { blog: blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.newPost = async (req, res) => {
  try {
    const { title, body } = req.body;

    const UserId = req.session.UserId; // ตั้งชื่อตามที่คุณใช้

    const newPost = new BlogPost({
      title,
      body,
      userid: UserId
    });
    await newPost.save();

    res.redirect('mypost');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deletePost = async (req, res) => {
  try {
    // รับ id ของโพสต์ที่ต้องการลบจาก request parameters
    const postId = req.params.id;

    // ค้นหาโพสต์ด้วย id และ userid เพื่อให้แน่ใจว่าโพสต์เป็นของผู้ใช้เท่านั้นที่จะลบได้
    const UserId = req.session.UserId; // ตั้งชื่อตามที่คุณใช้
    console.log("UserID")
    console.log(UserId)
    const post = await BlogPost.findOneAndDelete({ _id: postId, userid: UserId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    res.redirect('/blog/mypost');
    // res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    // ค้นหาโพสต์ด้วย id และ userid เพื่อให้แน่ใจว่าโพสต์เป็นของผู้ใช้เท่านั้นที่จะลบได้
    // const userId = req.session.userId; // ตั้งชื่อตามที่คุณใช้
   
    // ตรวจสอบว่าโพสต์นี้เป็นของผู้ใช้ที่ล็อกอินหรือไม่
    const post = await BlogPost.findOne({ _id: postId});

    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    const { title, body } = req.body;

    // ทำการอัปเดตข้อมูลโพสต์
    post.title = title;
    post.body = body;
    await post.save();

    res.redirect('/blog/mypost'); // หรือส่งข้อมูลอื่นๆ กลับไปตามที่คุณต้องการ

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

exports.preEditPost = async (req, res) => {
  try {
    const postId = req.params.id;
    // ตรวจสอบว่าโพสต์นี้เป็นของผู้ใช้ที่ล็อกอินหรือไม่
    const post = await BlogPost.findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }
    console.log(post)
    res.render('blog/editpost',{post:post})

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};