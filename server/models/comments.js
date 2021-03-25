'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      models.Comment.belongsTo(models.Book)
      models.Rating.belongsTo(models.User)
    }
  };
  Comment.init({
    author: {
      type: DataTypes.STRING,
    },
    // authorId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: 'users',
    //     key: 'id'
    //   }
    // },
    // bookId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'books',
    //     key: 'id'
    //   }
    // },
    text: {
      allowNull: false,
      type: DataTypes.TEXT,
    }  
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};