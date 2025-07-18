'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('presensis', {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      kegiatan_uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'kegiatans',
          key: 'uuid'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      waktu_presensi: {
        type: Sequelize.DATE,
        allowNull: false
      },
      attendance: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      latitude: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      longitude: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      signature: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.addIndex('presensis', ['kegiatan_uuid']);
    await queryInterface.addIndex('presensis', ['waktu_presensi']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('presensis');
  }
};
