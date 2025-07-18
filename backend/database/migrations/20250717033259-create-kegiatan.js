'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kegiatans', {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deskripsi: {
        type: Sequelize.TEXT
      },
      waktu_mulai: {
        type: Sequelize.DATE,
        allowNull: false
      },
      waktu_selesai: {
        type: Sequelize.DATE,
        allowNull: false
      },
      attendance_fields: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      lokasi: {
        type: Sequelize.STRING,
        allowNull: true
      },
      latitude: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      longitude: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      pin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      user_uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'uuid'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('kegiatans', ['nama']);
    await queryInterface.addIndex('kegiatans', ['user_uuid']);
    await queryInterface.addIndex('kegiatans', ['waktu_mulai']);
    await queryInterface.addIndex('kegiatans', ['waktu_selesai']);
    await queryInterface.addIndex('kegiatans', ['latitude']);
    await queryInterface.addIndex('kegiatans', ['longitude']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kegiatans');
  }
};
