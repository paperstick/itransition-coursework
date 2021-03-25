'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chapter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Chapter.belongsTo(models.Book)
    }
  };
  Chapter.init({
    chapterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      allowNull: false,
      type: DataTypes.TEXT,
    }
  },
    {
      sequelize,
      modelName: 'Chapter',
      tableName: 'chapters'
    });
  return Chapter;
};