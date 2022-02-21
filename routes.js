
const config = require('config.js');
const {Router} = require('express');
const router = Router();
module.exports = app => {
  app.use(Login);
  app.use('/static', express.static(process.cwd() + '/public'));
  router.post('/', (req,res)=>{
    console.log('logou')
    //res.render('../../views/index')
  })
  router.get('/', (req,res)=>{
    console.log('logou get')
    return res.render('/views/index')
  })
  app.user(router)
}