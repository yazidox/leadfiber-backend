'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    idUSERS: DataTypes.INTEGER,
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    attachement: DataTypes.STRING,
    likes: DataTypes.INTEGER
  }, {});
  Message.associate = function(models) {
    // associations can be defined here

    models.Message.belongsTo(models.User, {
      foreignKey: {
        allowNull: false,
      }
    })
  };
  return Message;
};