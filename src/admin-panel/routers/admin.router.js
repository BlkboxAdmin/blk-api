const express = require('express');

const authController = require('../controllers/auth.controller.js');
const adminUsersController = require('../controllers/admin_users.controller.js');
const usersController = require('../controllers/users.controller.js');
const templatesController = require('../controllers/templates.controller.js');
const booksController = require('../controllers/books.controller.js');
const commentController = require('../controllers/comments.controller.js');
const storiesController = require('../controllers/stories.controller.js');
const timeStoriesController = require('../controllers/time_stories.controller.js');

const router = express.Router();

router.post('/login', authController.login);

// Endpoint for Admin Users
router.post('/admin_users/add_user', authController.validateToken, adminUsersController.addUser);
router.post('/admin_users/list/:page', authController.validateToken, adminUsersController.getUsers);
router.put('/admin_users/status/:id', authController.validateToken, adminUsersController.updateUser);
router.delete('/admin_users/delete/:id', authController.validateToken, adminUsersController.deleteUser);

// Endpoint for Users
router.post('/users/list/:page', authController.validateToken, usersController.getUsers);
router.put('/users/verification_status/:userId', authController.validateToken, usersController.updateUser);
router.put('/users/status/:userId', authController.validateToken, usersController.updateUser);
router.delete('/users/delete/:userId', authController.validateToken, usersController.deleteUser);
//router.post('/users/book_followings/:page', authController.validateToken, templatesController.getTemplates);
//router.post('/users/blockList/:page', authController.validateToken, templatesController.getTemplates);

// Endpoint for Friends
//router.post('/friends/list/:page', authController.validateToken, templatesController.getTemplates);
//router.put('/friends/status/:id', authController.validateToken, usersController.addUser);
//router.delete('/friends/delete/:id', authController.validateToken, usersController.addUser);

// Endpoint for Talks
//router.post('/threads/list/:page', authController.validateToken, templatesController.getTemplates);
//router.post('/threads/messages/:id', authController.validateToken, usersController.addUser);

// Endpoint for Blk books
router.post('/blkbooks/list/:page', authController.validateToken, booksController.getBooks);
router.put('/blkbooks/status/:id', authController.validateToken, booksController.updateBook);
router.delete('/blkbooks/delete/:id', authController.validateToken, booksController.deleteBook);

// Endpoint for Comments
router.post('/comments/list/:page', authController.validateToken, commentController.getComments);
router.put('/comments/status/:id', authController.validateToken, commentController.updateComment);
router.delete('/comments/delete/:id', authController.validateToken, commentController.deleteComment);

// Endpoint for Stories
router.post('/stories/list/:page', authController.validateToken, storiesController.getStories);
router.put('/stories/status/:id', authController.validateToken, storiesController.updateStory);
router.delete('/stories/delete/:id', authController.validateToken, storiesController.deleteStory);

// Endpoint for TimesStories
router.post('/timestories/list/:page', authController.validateToken, timeStoriesController.getStories);
router.put('/timestories/status/:id', authController.validateToken, timeStoriesController.updateStory);
router.delete('/timestories/delete/:id', authController.validateToken, timeStoriesController.deleteStory);

// Endpoint for template
router.post('/templates/list/:page', authController.validateToken, templatesController.getTemplates);
router.post('/templates/new', authController.validateToken, templatesController.addTemplate);
router.put('/templates/:id', authController.validateToken, templatesController.updateTemplate);

module.exports = router;