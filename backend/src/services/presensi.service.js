const { presensi, kegiatan } = require('../models');
const fs = require('fs');
const path = require('path');

class PresensiService {
  // Mendapatkan data presensi berdasarkan kegiatan
  async getByKegiatan(kegiatanUuid, user_uuid) {
    return await presensi.findAll({
      where: { kegiatan_uuid: kegiatanUuid },
      include: [
        {
          model: kegiatan,
          required: true,
          where: { user_uuid }
        }
      ],
    });
  }

  // Menyimpan data presensi baru
  async createPresensi(data) {
    return await presensi.create(data);
  }

  // Menghapus data presensi berdasarkan UUID
  async deletePresensi(uuid) {
    // Ambil data presensi untuk mendapatkan path signature
    const presensiData = await presensi.findOne({
      where: { uuid },
      attributes: ['signature']
    });

    if (presensiData && presensiData.signature) {
      try {
        // Extract filename from signature path
        const filename = presensiData.signature.replace('/kegiatan/signatures/', '');
        const filePath = path.join(__dirname, '../../uploads/signatures', filename);

        // Hapus file signature jika ada
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting signature file:', error);
        // Lanjutkan proses delete presensi meskipun ada error hapus file
      }
    }

    return await presensi.destroy({
      where: { uuid },
    });
  }

  // Cek duplicate presensi berdasarkan field identifikasi
  async checkDuplicatePresensi(kegiatanUuid, fieldName, fieldValue) {
    const { Op } = require('sequelize');

    return await presensi.findOne({
      where: {
        kegiatan_uuid: kegiatanUuid,
        [Op.or]: [
          // Cek di field attendance JSON
          {
            attendance: {
              [fieldName]: fieldValue
            }
          }
        ]
      }
    });
  }

  // Cek presensi terbaru berdasarkan IP address (rate limiting)
  async checkRecentPresensiByIP(kegiatanUuid, ipAddress, timeThreshold) {
    const { Op } = require('sequelize');

    return await presensi.findOne({
      where: {
        kegiatan_uuid: kegiatanUuid,
        ip_address: ipAddress,
        created_at: {
          [Op.gte]: timeThreshold
        }
      },
      order: [['created_at', 'DESC']]
    });
  }
}

module.exports = new PresensiService();