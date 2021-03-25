'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      models.Rating.belongsTo(models.Book)
      models.Rating.belongsTo(models.User)
    }
  };
  Rating.init({
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
    rating: {
      type: DataTypes.FLOAT,
    }  
  }, {
    sequelize,
    modelName: 'Rating',
  });
  return Rating;
};