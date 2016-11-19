var express = require('express');
var path = require('path');
var router = express.Router();
const pgp = require('pg-promise')();
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '/../config/config.json'))[env];
const db = pgp(process.env[config.use_env_variable]);
const models = require('../models');
//classes
var Food = require('../class/food');

function getTimestamp() {
  return new Date(new Date().getTime() + (new Date().getTimezoneOffset()
    * 60000) + (3600000 * 2));
}

// Get all food
router.get('/', function(req, res, next) {
  models.Food.findAll({
    order: [
      ['created_at', 'DESC'],
    ],
    include: [{ model: models.Restaurant, attributes: ['rest_name', 'login']}]
  }).then(function(data) {
    res.setHeader('Content-Type', 'application/json');
    var Foods = data.map((elem) => new Food(
      elem.id,
      elem.uuid,
      elem.Restaurant.rest_name,
      elem.Restaurant.login,
      elem.description,
      elem.hashtags,
      elem.photo,
      elem.likes,
      elem.dislikes,
      elem.created_at,
      elem.updated_at
    ));
    res.json(Foods);
  }).catch(function(error) {
    res.status(404).send();
  });
});

// Get single food
router.get('/:uuid', function(req, res, next) {
  var _uuid = req.params.uuid;
  models.Food.findAll({
    where: {
      uuid: _uuid
    },
    include: [
      {
        model: models.Restaurant,
        attributes: ['rest_name', 'login']
      }
    ]
  }).then(function(data) {
    res.setHeader('Content-Type', 'application/json');
    var newFood = data.map((elem) => new Food(
      elem.id,
      elem.uuid,
      elem.Restaurant.rest_name,
      elem.Restaurant.login,
      elem.description,
      elem.hashtags,
      elem.photo,
      elem.likes,
      elem.dislikes,
      elem.created_at,
      elem.updated_at
    ));
    res.json(newFood);
  }).catch(function(error) {
    res.status(404).send();
  });
});


// Save food
router.post('/', function(req, res, next) {
  req.accepts('application/json');
  models.Restaurant.findOne({
    where: {
      login: req.body[0].login
    },
    attributes: ['id']
  }).then(function(user) {
    var newFood = new Food(
      0,
      req.body[0].uuid,
      user.rest_name,
      user.login,
      req.body[0].description,
      req.body[0].hashtags,
      req.body[0].photo,
      0,
      0,
      getTimestamp(),
      getTimestamp());
    models.Food.create({
      uuid: newFood.getUuid(),
      description: newFood.getDescription(),
      hashtags: newFood.getHashtags(),
      photo: newFood.getPhoto(),
      likes: 0,
      dislikes: 0,
      created_at: newFood.getCreatedAt(),
      updated_at: newFood.getUpdatedAt(),
      restaurant_id: user.id
    }, {})
      .then(function() {
        res.status(201).send();
      })
      .catch(function(error) {
        res.status(404).send();
      });
  });
});

// Update food
router.put('/', function(req, res, next) {
  req.accepts('application/json');
  var _id = req.body[0].uuid;
  var UpdatedFood = new Food(
    req.body[0].id,
    _id,
    null,
    req.body[0].description,
    req.body[0].hashtags,
    req.body[0].photo,
    req.body[0].likes,
    req.body[0].dislikes,
    null,
    getTimestamp());
  db.query('UPDATE "Food" SET "description" = $2, "hashtags" = $3, "photo" = $4, "likes" = $5, "dislikes" = $6, "updated_at" = $7 WHERE "uuid" = $1',
    [
      _id,
      UpdatedFood.getDescription(),
      UpdatedFood.getHashtags(),
      UpdatedFood.getPhoto(),
      UpdatedFood.getLikes(),
      UpdatedFood.getDislikes(),
      UpdatedFood.getUpdatedAt()
    ])
    .then(function() {
      res.status(201).send();
    })
    .catch(function(error) {
      res.status(404).send();
    });
});

// Update food description
router.put('/description', function(req, res, next) {
  req.accepts('application/json');
  var _id = req.body[0].uuid;
  db.query('UPDATE "Food" SET "description" = $2, "updated_at" = $3 WHERE "uuid" = $1',
    [
      _id,
      req.body[0].description,
      getTimestamp()
    ])
    .then(function() {
      res.status(201).send();
    })
    .catch(function(error) {
      res.status(404).send();
    });
});

// Update food hashtags
router.put('/hashtags', function(req, res, next) {
  req.accepts('application/json');
  var _id = req.body[0].uuid;
  db.query('UPDATE "Food" SET "hashtags" = $2, "updated_at" = $3 WHERE "uuid" = $1',
    [
      _id,
      req.body[0].hashtags,
      getTimestamp()
    ])
    .then(function() {
      res.status(201).send();
    })
    .catch(function(error) {
      res.status(404).send();
    });
});

// Update food photo
router.put('/photo', function(req, res, next) {
  req.accepts('application/json');
  var _id = req.body[0].uuid;
  db.query('UPDATE "Food" SET "photo" = $2, "updated_at" = $3 WHERE "uuid" = $1',
    [
      _id,
      req.body[0].photo,
      getTimestamp()
    ])
    .then(function() {
      res.status(201).send();
    })
    .catch(function(error) {
      res.status(404).send();
    });
});

// Update food likes
router.put('/likes', function(req, res, next) {
  req.accepts('application/json');
  var _id = req.body[0].uuid;
  db.query('UPDATE "Food" SET "likes" = "likes" + 1, "updated_at" = $2 WHERE "uuid" = $1',
    [
      _id,
      getTimestamp()
    ])
    .then(function() {
      res.status(201).send();
    })
    .catch(function(error) {
      res.status(404).send();
    });
});

router.put('/likes/decrement', function(req, res, next) {
  req.accepts('application/json');
  var _id = req.body[0].uuid;
  db.query('UPDATE "Food" SET "likes" = "likes" - 1, "updated_at" = $2 WHERE "uuid" = $1',
    [
      _id,
      getTimestamp()
    ])
    .then(function() {
      res.status(201).send();
    })
    .catch(function(error) {
      res.status(404).send();
    });
});

// Update food dislikes
router.put('/dislikes', function(req, res, next) {
  req.accepts('application/json');
  var _id = req.body[0].uuid;
  db.query('UPDATE "Food" SET "dislikes" = "dislikes" + 1, "updated_at" = $2 WHERE "uuid" = $1',
    [
      _id,
      getTimestamp()
    ])
    .then(function() {
      res.status(201).send();
    })
    .catch(function(error) {
      res.send(error);
      res.status(404).send();
    });
});

router.put('/dislikes/decrement', function(req, res, next) {
  req.accepts('application/json');
  var _id = req.body[0].uuid;
  db.query('UPDATE "Food" SET "dislikes" = "dislikes" - 1, "updated_at" = $2 WHERE "uuid" = $1',
    [
      _id,
      getTimestamp()
    ])
    .then(function() {
      res.status(201).send();
    })
    .catch(function(error) {
      res.send(error);
      res.status(404).send();
    });
});

// Delete food
router.delete('/', function(req, res, next) {
  req.accepts('application/json');
  var _id = req.body[0].uuid;
  db.none('DELETE FROM "Food" WHERE "uuid" = $1', _id)
    .then(function() {
      res.status(204).send();
    })
    .catch(function(error) {
      res.status(409).send();
    });
});

module.exports = router;