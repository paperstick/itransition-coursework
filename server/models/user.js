'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      //models.User.hasMany(models.Book)
      models.User.hasMany(models.Comment)
      models.User.hasMany(models.Rating)
    }
  };
  User.init({
    username: { 
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: { 
      type: DataTypes.STRING,
      isEmail: true,
      allowNull: false,
      unique: true
    },
    role: DataTypes.ENUM('admin', 'user'),
    salt: DataTypes.STRING,
    password: DataTypes.STRING,
    last_login: DataTypes.DATE,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Unblocked'      
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};