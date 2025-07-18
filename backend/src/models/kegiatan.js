'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kegiatan extends Model {
    static associate(models) {
      kegiatan.belongsTo(models.user, {
        foreignKey: 'user_uuid',
        targetKey: 'uuid',
        as: 'pemilik'
      });
      kegiatan.hasMany(models.presensi, {
        foreignKey: 'kegiatan_uuid',
        sourceKey: 'uuid',
        as: 'presensi_list'
      });
    }
  }
  kegiatan.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deskripsi: DataTypes.TEXT,
    waktu_mulai: {
      type: DataTypes.DATE,
      allowNull: false
    },
    waktu_selesai: {
      type: DataTypes.DATE,
      allowNull: false
    },
    attendance_fields: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    lokasi: {
      type: DataTypes.STRING,
    },
    latitude: {
      type: DataTypes.DOUBLE,
    },
    longitude: {
      type: DataTypes.DOUBLE,
    },
    pin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_uuid: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'kegiatan',
    underscored: true,
  });
  return kegiatan;
};
