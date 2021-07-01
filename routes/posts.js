const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');

const Post = require('../models/Post');
const Profile = require('../models/Profile');
const User = require('../models/User');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [auth, [body('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      await newPost.save();

      return res.json(newPost);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/posts
// @desc    Get all post
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.json(posts);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/:id
// @desc    Get single post by id
// @access  Private
router.get('/:postid', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    return res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    return res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: 'You are not authorized to delete this post' });
    }

    await post.remove();

    return res.json({ msg: 'Post has been removed successfully.' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    return res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post has already been liked
    const isLiked =
      post.likes.filter((like) => like.user.toString() == req.user.id).length >
      0;

    if (isLiked) {
      //Removing liked if again liked button is clicked
      // const likedIndex = post.likes.findIndex(
      //   (x) => x.user.toString() === req.user.id
      // );

      // post.likes.splice(likedIndex, 1);

      // await post.save();

      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.json(post.likes);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    Like a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post has already been liked
    const isNotLiked =
      post.likes.filter((like) => like.user.toString() == req.user.id)
        .length === 0;

    if (isNotLiked) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    //Removing liked if again liked button is clicked
    const likedIndex = post.likes.findIndex(
      (x) => x.user.toString() === req.user.id
    );

    post.likes.splice(likedIndex, 1);

    await post.save();

    await post.save();

    return res.json(post.likes);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/comment/:postid
// @desc    Create a comment on a post
// @access  Private
router.post(
  '/comment/:postid',
  [auth, [body('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const post = await Post.findById(req.params.postid);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      console.log(post, 'POST');

      post.comments.unshift(newComment);

      await post.save();

      return res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/posts/comment/:postid/:commentid
// @desc    Delete a comment on the post
// @access  Private
router.delete('/comment/:postid/:commentid', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid);

    const comment = post.comments.find(
      (comment) => comment.id === req.params.commentid
    );

    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'You are not authorized' });
    }

    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    return res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});
module.exports = router;
