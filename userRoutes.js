const express = require('express');
const userController = require('./userController');
const authController = require('./authcontroller');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/confirmregister', authController.confirmEmailCode);
router.post('/confirmlogin', authController.confirmLogin)
router.post('/verifycaptcha', authController.verifyCaptcha)

router.get('/', userController.getAllUser)
router.get('/:id', userController.getUser)


module.exports = router;
