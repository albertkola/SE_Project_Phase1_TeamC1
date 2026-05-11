const express = require('express');

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { submitRatingRules, userIdParam } = require('../validators/rating.validators');
const controller = require('../controllers/ratings.controller');

const router = express.Router();

router.use(auth);

router.post('/', submitRatingRules, validate, controller.submitRating);
router.get('/user/:id', userIdParam, validate, controller.getRatingsForUser);

module.exports = router;
