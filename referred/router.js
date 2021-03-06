'use strict'; 

require('dotenv').load();

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const config = require('../config');
const router = express.Router();

const { Company, Person } = require('./models');

const jwtAuth = passport.authenticate('jwt', { session: false });

// Company endpoints

// GET all company details
router.get('/:username', jwtAuth, (req, res) => {
  Company
    .find({username:req.params.username})
    .then(companies => {
      res.json(companies);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// POST a new company
router.post('/', jwtAuth, (req, res) => {
  const requiredFields = ['username', 'companyName', 'url', 'location'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Company
    .create({
      username: req.body.username,
      companyName: req.body.companyName,
      url: req.body.url,
      location: req.body.location,
      description: req.body.description,
      notes: req.body.notes
    })
    .then(companies => res.status(201).json(companies))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
  });
});

// PUT edit a company
router.put('/:id', jwtAuth, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['companyName', 'url', 'location', 'description', 'notes'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Company
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedCompany => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});


// DELETE a website
router.delete('/:id', jwtAuth, (req, res) => {
  Company
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Person endpoints

// GET all person details
router.get('/person/:username', jwtAuth, (req, res) => {
  Person
    .find({username:req.params.username})
    .then(people => {
      res.json(people);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// POST a new person
router.post('/person', jwtAuth, (req, res) => {
  const requiredFields = ['username', 'companyId', 'status', 'statusIndex', 'name'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Person
    .create({
      username: req.body.username,
      companyId: req.body.companyId,
      status: req.body.status,
      statusIndex: req.body.statusIndex,
      name: req.body.name,
      title: req.body.title,
      url: req.body.url,
      notes: req.body.notes
    })
    .then(person => res.status(201).json(person))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
  });
});

// PUT edit a person
router.put('/person/:id', jwtAuth, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }
  const updated = {};
  const updateableFields = ['status', 'statusIndex', 'name', 'title', 'url', 'notes'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Person
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPerson => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});


// DELETE a person
router.delete('/person/:id', jwtAuth, (req, res) => {
  Person
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ 
        message: 'Success'
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

router.use('*', function(req, res) {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = { router };