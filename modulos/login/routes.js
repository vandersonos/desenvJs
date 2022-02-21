const { Router } = require('express');
const LoginController = require('./index');
const passport = require('../../config/passportConfig');
const router = Router();

const isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

router.all('*', (req, res, next)=> {
  res.locals.message='';
  next()
})

/**
 * Facebook
*/
router.get('/auth/facebook', passport.authenticate('facebook',{scope:['email']}));
router.get('/auth/facebook/callback', passport.authenticate('facebook',{
  passReqToCallback : true, failureFlash : true, successRedirect: '/login/profile', failureRedirect: '/login' 
}));
/** fim facebook */
/** google */
router.get('/login/federated/google', passport.authenticate('google',{
  scope: [ 'email', 'profile' ]
}));
router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/login/profile',
  failureRedirect: '/login',
  failureFlash : true
}));
/** fim google */
/** local */
router.get('/login', LoginController.index);
router.post('/login', passport.authenticate('local', {
  passReqToCallback : true, failureFlash : true, successRedirect: '/login/profile', failureRedirect: '/login'
}));
/** fim local */
router.get('/login/signup', LoginController.signup);
router.post('/login/create', LoginController.create);
router.get('/login/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});
router.get('/login/passwordrecovery', LoginController.recovery);
router.get('/login/passwordrecovery/:hash', LoginController.recovery);
router.post('/login/passwordrecovery', LoginController.sendMail);
router.get('/login/mailsended', LoginController.mailSended);
router.get('/login/profile/', isAuthenticated ,LoginController.profile);
// router.delete('/login/:id', isAuthenticated, LoginController.disabled);

module.exports = router;