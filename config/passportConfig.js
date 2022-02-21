
const User = require('../modulos/login/models').users;
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oidc');

passport.use(new FacebookStrategy({
    clientID: process.env['FACEBOOK_APP_ID'],
    clientSecret: process.env['FACEBOOK_APP_SECRET'],
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName','emails'],
    passReqToCallback : true
  },
  async function(req,accessToken, refreshToken, profile, next) {
    return auth(req, 'facebook', profile, next);
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: '/oauth2/redirect/google',
    passReqToCallback : true
  },
  async function(req, issuer, profile, next) {
    return auth(req, 'google', profile, next);
  }
))

passport.use( new LocalStrategy({
  usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
  passwordField: 'password',
  passReqToCallback : true
}, 
async function verify(req, email, senha, next) {
    try {
      const u = await User.findOne({ where: {email: email} })
      if (!u) {
        req.flash( "message","Usuário não encontrado!");
        return next(null, false);
      }
      const senhaValida = await bcrypt.compare(senha, u.password);
      if (!senhaValida) {
        req.flash( "message",'Usuário e/ou senha incorretos.');
        return next(null, false)
      }
      return next(null, u);
    } catch (e) {
      req.flash( "message","Ocorreu um erro ao efetuar o login!");
      return next(e, null);
    }

}));

passport.serializeUser(function(user, next) {
  next(null, user.id);
});

passport.deserializeUser(function(id, next) {
  User.findOne({  where: {id: id}, attributes: ['id', 'nome', 'email'] }).then((user)=> {
    return next(null, user.dataValues)
  });
});

const auth = async function(req, issuer, profile, next){
  try{
    let w = {};
    w[issuer+'Id'] = profile.id;
    console.log(profile, 'profile', w, issuer)
    if(!profile.emails){
      req.flash( "message",`Ocorreu um erro ao vincular sua conta do ${issuer}!`);
      return next(null, false);
    }
    let dados = w;
    dados.email = profile.emails[0].value;
    let user_local = await User.findOne({where: w});
    if(!user_local){
      user_local = await User.findOne({where:{email: email}});
      dados.nome = profile.displayName;
      if(!user_local){
        const [u, created] = await User.findOrCreate({
          where: { email: email },
          defaults: dados
        });
        if (!u) {
          req.flash( "message",`Ocorreu um erro ao vincular sua conta do ${issuer}!`);
          return next(null, false);
        }
        user_local = u;
      }else{
        await User.update(dados, {where:{email: email}});
        user_local = await User.findOne({where:w});
      }
    }
    return next(null, user_local);
  }catch(e){
    req.flash( "message",`Ocorreu um erro ao efetuar o login com o ${issuer}! `);
    return next(e, null);
  }
}
module.exports = passport