
const path = require('path');
const views = path.join(__dirname, 'views/');
const User = require(path.join(__dirname,  'models')).users;
const endPoint = process.env.backEndApi ? process.env.apiEndPoint : process.env.localEndPont;
const bcrypt = require('bcrypt');

class LoginController {
  static async index(req,res){
    res.render(views+'index', { message: req.flash('message') });
  }
  static async signup(req, res){
    res.render(views+'signup', { backEnd: endPoint, message: req.flash('message')});
  }

  static async create(req, res){
    try {
      const obj = req.body;
      await LoginController.validateUser(obj)
      obj.email = obj.login;
      obj.nome = obj.name;
      obj.ativo = true;
      obj.password = await LoginController.gerarSenhaHash(obj.password);
      const resultado = await User.create(obj);

      return res.status(200).json({message:'Usuário cadastrado com sucesso!', id: resultado.id, redirect: process.env.loginRedirect})
    } catch (error) {
      req.flash( "message", error.message);
      return res.status(500).json({message: req.flash( "message")});
    }

  }

  static async recovery(req, res){
    let contexto = {inicio:true, senha:false}
    if(req.body.hash){ //se tem hash valido form senha
      contexto.inicio = false;
      //validar token
      // se valido
      if(await LoginController.validaToken(req.body.token)){
        contexto.senha = true;

      }
    }
    
    res.render(views+'recovery', contexto);
  }

  static async sendMail(req, res){
    //realizar lógica do e-mail
    res.status(200).send()
    //res.render(views+'mailsended', {error:true});
  }
  static async mailSended(req, res){
    res.render(views+'mailsended')
  }
  static async profile(req, res){
    res.locals.name = req.user.nome;
    res.render(views+'profile')
  }

  static async validaToken(hash){
    /** @todo fazer essa parte */
    return true;
  }

  static async disabled(){
    try{
      User.update({ativo:false}, {where:{id:id}}).then(()=>{
        return User.findOne({id:id, ativo:false}).then((user)=>{
          req.flash( "message", `Usuário ${user.name} foi desativado!`);
          return res.render(views+'disabled');
        })
        .then((err)=>{
          console.log('Error (login):', err);
          req.flash( "message", `Ocorreu um erro ao desativar o usuário!`);
          return res.render(views+'error');
        })
      })
    }catch(e){
      req.flash( "message", `Ocorreu um erro ao desativar o usuário!`);
      return res.render(views+'error',{message: req.flash( "message")});
    }
  }

  static async gerarSenhaHash(password) {
    const custo = 12;
    return bcrypt.hash(password, custo);

  }

  static async validateUser(obj){

    if (!obj.login) {
      throw new Error("O campo login é obrigatório!")
    }else{
      if(!LoginController.validateEmail(obj.login)){
        throw new Error("O campo login não é um e-mail válido!")
      }
    }
    if (!obj.password && !obj.id) {
      throw new Error("O campo senha é obrigatório!")
    }
    if (obj.password.length < 8) {
      throw new Error("O campo senha deve ter ao menos 8 caracteres!")
    }
    console.log(obj, 'email')
    let naoUnico = await User.findOne({where:{email:obj.login}});

    if(naoUnico){
      throw new Error(`Já existe um usuário com o e-mail ${obj.login}!`)
    }

  }

  static validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }
}
module.exports = LoginController