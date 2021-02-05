const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const Story = require('../Models/Story');

// @desc Login/ Landing Page
// @route GET / 
router.get('/', ensureGuest, (req, res) => {
  res.render('index', {
    title: 'StoryBooks'
  });
});

// @desc Dashboard
// @route GET /dashboard 

router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    res.render('dashboard', {
      title: 'Dashboard',
      name: req.user.firstName,
      profilePic: req.user.image,
      stories
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router;