'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      models.Book.hasMany(models.Chapter)
      models.Book.hasMany(models.Comment)
      models.Book.hasMany(models.Rating)
    }
  };
  Book.init({
    title: { 
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true
    },
    author: {
      type: DataTypes.STRING,
    },
    authorId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    description: { 
      type: DataTypes.TEXT,
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }  
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'books'
  });
  return Book;
};