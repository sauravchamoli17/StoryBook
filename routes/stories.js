const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Story = require('../Models/Story');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// @desc    Show add page
// @route   GET /stories/add

router.get('/add', ensureAuth, (req, res) => {
   res.render('add', {
      title: 'Add Stories'
   });
});

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, urlencodedParser, async (req, res) => {
   try {
      req.body.user = req.user.id;

      await Story.create(req.body);
      res.redirect('/dashboard');
   } catch (err) {
      console.error(err);
      res.render('error/500');
   }
});

// @desc    Show public stories
// @route   GET /stories

router.get('/', ensureAuth, async (req, res) => {
   try {
    const stories = await Story.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
         .lean()  

     res.render('public_stories', {
      title: 'Public Stories',
      stories
    })
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});  

// @desc    Show edit page
// @route   GET /stories/edit/:id

router.get('/edit/:id', ensureAuth, async (req, res) => {
   const story = await Story.findOne({
      _id: req.params.id
   }).lean() 

   if(!story){
      return res.render('error/404'); 
   }

   if (story.user != req.user.id) {
      res.redirect('/stories');
   } else{
      res.render('edit', {
         title: 'Edit Story',
         story
      });
   }
});

// @desc    Update story
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, urlencodedParser, async (req, res) => {
   try {
      let story = await Story.findById(req.params.id).lean();

      if (!story) {
         return res.render('error/404');
      }

      if (story.user != req.user.id) {
         res.redirect('/stories');
      } else {
         story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true,
            runValidators: true,
         })
         res.redirect('/dashboard');
      }
   } catch (err) {
      console.error(err);
      return res.render('error/500');
   }
});

// @desc    Delete story
// @route   DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user != req.user.id) {
      res.redirect('/stories')
    } else {
      await Story.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Show single story
// @route   GET /stories/:id

router.get('/:id', ensureAuth, async (req, res) => {
   try {
      let story = await Story.findById(req.params.id)
                  .populate('user')
                  .lean();
      if (!story) {
         return res.render('error/404');
      }
      res.render('story', {
         story
      })
   } catch (err) {
      console.error(err);
      res.render('error/404');
   }
});

module.exports = router;