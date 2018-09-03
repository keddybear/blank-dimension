const express 		= require('express');
const path			= require('path');
const bodyParser 	= require('body-parser');
const csurf	= require('csurf');

const router = express.Router();

const parseJson = bodyParser.json();
const parseUrlencoded = bodyParser.urlencoded({ extended: false });

const csrfProtection = csurf();

// Security
const { getCSRF, csrfCheck, getSession } = require('./api/Security/csrf');

// Users
const { createUser, authUser, logout } = require('./db/controllers/UserController');

// ====== Routing ====== //

// Security
router.get('/session', csrfProtection, getSession);
router.get('/csrf', csrfProtection, getCSRF);

// Users
router.post('/user/new', [parseJson, parseUrlencoded, csrfCheck], createUser);
router.post('/user/auth', [parseJson, parseUrlencoded, csrfCheck], authUser);
router.post('/user/logout', logout);

module.exports = router;
