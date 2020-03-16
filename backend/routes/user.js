const express = require("express");
const router = express.Router();

// import controller
const {read, update} = require('../controllers/user');
const { requireSignin, isAdminMiddleWare } = require('../controllers/auth');

router.get('/user/:id' ,requireSignin ,read);
router.put('/user/update' ,requireSignin ,update);
router.put('/admin/update' ,requireSignin ,isAdminMiddleWare ,update);

module.exports = router; // {}