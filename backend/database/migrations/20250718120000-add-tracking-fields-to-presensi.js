module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('presensis', 'ip_address', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'IP address pengguna saat melakukan presensi'
    });

    await queryInterface.addColumn('presensis', 'user_agent', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'User agent browser pengguna saat melakukan presensi'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('presensis', 'ip_address');
    await queryInterface.removeColumn('presensis', 'user_agent');
  }
};
