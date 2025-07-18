'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class presensi extends Model {
    static associate(models) {
      presensi.belongsTo(models.kegiatan, {
        foreignKey: 'kegiatan_uuid',
        targetKey: 'uuid',
      });
    }
  }
  presensi.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    kegiatan_uuid: {
      type: DataTypes.UUID,
      allowNull: false
    },
    waktu_presensi: {
      type: DataTypes.DATE,
      allowNull: false
    },
    attendance: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'presensi',
    underscored: true,
  });
  return presensi;
};
