const express = require('express');

const authController = require('../controllers/auth.controller');
const apiController = require('../controllers/api.controller');
const booksController = require('../controllers/books.controller');
const commentsController = require('../controllers/comments.controller');
const storiesController = require('../controllers/stories.controller');
const friendsController = require('../controllers/friends.controller');
const messagesController = require('../controllers/messages.controller');
const timeStoriesController = require('../controllers/time_stories.controller');
const activityController = require('../controllers/activity.controller');
const notificationController = require('../controllers/notifications.controller');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();

// Endpoint for auth
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Endpoint for User
router.post('/user/profile/:userId', authController.validateToken, apiController.singleUser);
router.put('/user/profile/update', authController.validateToken, apiController.updateUser);
router.put('/user/profile/settings', authController.validateToken, apiController.updateSettings);
router.put('/user/profile/change_password', authController.validateToken, apiController.changePassword);
router.post('/user/report', authController.validateToken, apiController.reportIssue);
//router.delete('/user/profile/delete', authController.validateToken, apiController.deleteUser);

router.post('/user/blockList', authController.validateToken, apiController.blockedUsers);
router.post('/user/blockList/new', authController.validateToken, apiController.blockUser);
router.delete('/user/blockList/delete', authController.validateToken, apiController.removeBlockUser);

// Endpoint for Activities
router.post('/activities/:page', authController.validateToken, activityController.getActivity);

// Endpoint for Notifications
router.post('/notifications/:page', authController.validateToken, notificationController.getNotifications);

// Endpoint for Friends
router.post('/user/invite', authController.validateToken, friendsController.invite);
router.put('/user/answer_invite/:id', authController.validateToken, friendsController.answerInvite);
router.delete('/user/unfriend', authController.validateToken, friendsController.unFriend);

// Endpoint for Talks
router.post('/blktalks/search_recipients', authController.validateToken, messagesController.searchRecipients);
router.post('/blktalks/thread', authController.validateToken, messagesController.openThread);
//router.put('/blktalks/thread/:id', authController.validateToken, friendsController.answerInvite);

router.post('/blktalks/thread_messages/:page', authController.validateToken, messagesController.messageList);
router.post('/blktalks/thread_new_message', authController.validateToken, messagesController.checkNewMessages);
router.post('/blktalks/message', authController.validateToken, messagesController.compose);

// Endpoint for Books
router.post('/blkbooks/listing/:page', authController.validateToken, booksController.getBooks);
router.post('/blkbooks/new', authController.validateToken, booksController.addBook);
router.post('/blkbooks/single/:id', authController.validateToken, booksController.singleBook);
router.route('/blkbooks/:id')
    .put(authController.validateToken, booksController.updateBook)
    .delete(authController.validateToken, booksController.deleteBook);
router.put('/blkbooks/like/:bookId', authController.validateToken, booksController.like);
router.put('/blkbooks/dislike/:bookId', authController.validateToken, booksController.disLike);

router.route('/blkbooks/follow/:bookId')
    .put(authController.validateToken, booksController.follow)
    .delete(authController.validateToken, booksController.follow);

// Endpoint for Comments
router.post('/comments/listing/:page', authController.validateToken, commentsController.getComments);
router.post('/comments/new', authController.validateToken, commentsController.addComment);
router.route('/comments/:id')
    .delete(authController.validateToken, commentsController.deleteComment);

// Endpoint for BLK Top Stories
router.post('/stories/listing/:page', authController.validateToken, storiesController.getStories);
router.post('/stories/listing_by_user/:page', authController.validateToken, storiesController.getMyStories);
router.post('/stories/blkboard_by_user/:page', authController.validateToken, storiesController.getBlkBoardStories);
router.post('/stories/new', authController.validateToken, storiesController.addStory);
router.post('/stories/single/:id', authController.validateToken, storiesController.singleStory);
router.route('/stories/:id')
    .put(authController.validateToken, storiesController.updateStory)
    .delete(authController.validateToken, storiesController.deleteStory);
router.put('/stories/fav/:storyId', authController.validateToken, storiesController.fav);
router.put('/stories/repost/:storyId', authController.validateToken, storiesController.repost);

// Endpoint for BLK Time Stories
router.post('/time_stories/listing/:page', authController.validateToken, timeStoriesController.getStories);
router.post('/time_stories/listing_by_user/:page', authController.validateToken, timeStoriesController.getMyStories);
router.post('/time_stories/user_profile/:userId', authController.validateToken, apiController.singleUserVideoProfile);
router.post('/time_stories/new', authController.validateToken, timeStoriesController.addStory);
router.post('/time_stories/single/:id', authController.validateToken, timeStoriesController.singleStory);
router.put('/time_stories/viewed/:id', authController.validateToken, timeStoriesController.viewedStory);
router.route('/time_stories/:id')
    .put(authController.validateToken, timeStoriesController.updateStory)
    .delete(authController.validateToken, timeStoriesController.deleteStory);
router.put('/time_stories/fav/:storyId', authController.validateToken, timeStoriesController.fav);
router.put('/time_stories/repost/:storyId', authController.validateToken, timeStoriesController.repost);

// Endpoint for Image Upload URL
router.post('/upload/image/url', authController.validateToken, uploadController.getImageUploadUrl);
router.post('/upload/video/url', authController.validateToken, uploadController.getVideoUploadUrl);

// Endpoint for getting all the records
//router.post('/', authController.validateToken, apiController.getUsers);

// Endpoint for User Signup
router.post('/new', apiController.addUser);
router.post('/email-verification', authController.emailVerification);

module.exports = router;
