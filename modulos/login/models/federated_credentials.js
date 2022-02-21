'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class federated_credentials extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.federated_credentials.belongsTo(models.users, { as: 'users', foreignKey: 'userId' });
    }
  }
  federated_credentials.init({
    provider: DataTypes.STRING,
    subject: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'federated_credentials',
  });
  return federated_credentials;
};