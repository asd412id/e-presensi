const { successResponse, errorResponse } = require('../../helpers/response.helper');
const authMiddleware = require('../../middleware/auth.middleware');
const kegiatanService = require('../../services/kegiatan.service');
const presensiService = require('../../services/presensi.service');
const fs = require('fs');
const path = require('path');

async function presensiController(route) {
  // Serve file tanda tangan PNG
  route.get('/signatures/:filename', async (request, reply) => {
    try {
      const { filename } = request.params;
      const filePath = path.join(__dirname, '../../../uploads/signatures', filename);
      if (!fs.existsSync(filePath)) {
        return errorResponse(reply, 'File tidak ditemukan', 404);
      }
      reply.type('image/png');
      const stream = fs.createReadStream(filePath);
      return reply.send(stream);
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`);
    }
  });

  route.get('/:kegiatanUuid/presensi', { preHandler: authMiddleware }, async (req, res) => {
    try {
      const { kegiatanUuid } = req.params;
      const presensiData = await presensiService.getByKegiatan(kegiatanUuid, req.user.uuid);
      successResponse(res, presensiData, 'Data presensi berhasil diambil');
    } catch (error) {
      errorResponse(res, `Terjadi kesalahan: ${error.message}`);
    }
  });


  route.get('/presensi/:uuid', async (request, reply) => {
    try {
      const kegiatan = await kegiatanService.getByUuid(request.params.uuid);
      if (!kegiatan) {
        return errorResponse(reply, 'Kegiatan tidak ditemukan', 404);
      }

      // Always return kegiatan data, but include time validation info
      const now = new Date();
      const waktuMulai = new Date(kegiatan.waktu_mulai);
      const waktuSelesai = new Date(kegiatan.waktu_selesai);

      let timeValidation = {
        isValid: true,
        message: '',
        type: 'valid'
      };

      if (now < waktuMulai) {
        timeValidation = {
          isValid: false,
          message: 'Kegiatan belum dimulai. Presensi dapat dilakukan mulai tanggal ' + waktuMulai.toLocaleString('id-ID'),
          type: 'early'
        };
      } else if (now > waktuSelesai) {
        timeValidation = {
          isValid: false,
          message: 'Kegiatan sudah selesai. Presensi ditutup pada tanggal ' + waktuSelesai.toLocaleString('id-ID'),
          type: 'late'
        };
      }

      // Prepare response data without exposing actual PIN value
      const responseData = {
        ...kegiatan.toJSON(),
        timeValidation,
        pin: kegiatan.pin ? true : false // Only expose whether PIN is required, not the actual PIN
      };

      return successResponse(reply, responseData, 'Data kegiatan berhasil diambil');
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`, 500);
    }
  });

  route.post('/:kegiatanUuid/presensi', async (req, res) => {
    try {
      const { kegiatanUuid } = req.params;

      // Validasi kegiatan exists dan waktu
      const kegiatan = await kegiatanService.getByUuid(kegiatanUuid);
      if (!kegiatan) {
        return errorResponse(res, 'Kegiatan tidak ditemukan', 404);
      }

      // Validasi waktu kegiatan
      const now = new Date();
      const waktuMulai = new Date(kegiatan.waktu_mulai);
      const waktuSelesai = new Date(kegiatan.waktu_selesai);

      if (now < waktuMulai) {
        return errorResponse(res, 'Kegiatan belum dimulai. Presensi dapat dilakukan mulai tanggal ' + waktuMulai.toLocaleString('id-ID'), 400);
      }

      if (now > waktuSelesai) {
        return errorResponse(res, 'Kegiatan sudah selesai. Presensi ditutup pada tanggal ' + waktuSelesai.toLocaleString('id-ID'), 400);
      }

      // Validasi data request
      const { attendance, signature, waktu_presensi } = req.body;

      // Validasi attendance fields
      if (!attendance || typeof attendance !== 'object') {
        return errorResponse(res, 'Data attendance wajib diisi', 400);
      }

      // Validasi attendance fields sesuai dengan kegiatan
      const requiredFields = kegiatan.attendance_fields;
      for (const field of requiredFields) {
        if (!attendance[field] || attendance[field].trim() === '') {
          return errorResponse(res, `Field ${field} wajib diisi`, 400);
        }
      }

      // Validasi PIN jika diperlukan
      if (kegiatan.pin && kegiatan.pin.trim() !== '') {
        if (!attendance.pin || attendance.pin.trim() === '') {
          return errorResponse(res, 'PIN kegiatan wajib diisi', 400);
        }
        if (attendance.pin !== kegiatan.pin) {
          return errorResponse(res, 'PIN kegiatan tidak valid', 400);
        }
        // Remove PIN from attendance data before saving (security)
        delete attendance.pin;
      }

      // Validasi signature
      if (!signature || signature.trim() === '') {
        return errorResponse(res, 'Tanda tangan wajib diisi', 400);
      }

      // Validasi format base64 signature
      if (!signature.startsWith('data:image/')) {
        return errorResponse(res, 'Format tanda tangan tidak valid', 400);
      }

      // Validasi waktu presensi
      if (!waktu_presensi) {
        return errorResponse(res, 'Waktu presensi wajib diisi', 400);
      }

      const waktuPresensiDate = new Date(waktu_presensi);
      if (isNaN(waktuPresensiDate.getTime())) {
        return errorResponse(res, 'Format waktu presensi tidak valid', 400);
      }

      // Validasi waktu presensi tidak boleh di masa depan
      if (waktuPresensiDate > now) {
        return errorResponse(res, 'Waktu presensi tidak boleh di masa depan', 400);
      }

      // Validasi waktu presensi harus dalam rentang kegiatan
      if (waktuPresensiDate < waktuMulai || waktuPresensiDate > waktuSelesai) {
        return errorResponse(res, 'Waktu presensi harus dalam rentang waktu kegiatan', 400);
      }

      // Cek duplicate presensi berdasarkan field unik (misal: nama atau email)
      // Ambil field identifikasi utama (biasanya field pertama)
      const identificationField = requiredFields[0];
      const identificationValue = attendance[identificationField];

      if (identificationValue) {
        const existingPresensi = await presensiService.checkDuplicatePresensi(
          kegiatanUuid,
          identificationField,
          identificationValue
        );

        if (existingPresensi) {
          return errorResponse(res, `Presensi dengan ${identificationField} "${identificationValue}" sudah ada`, 400);
        }
      }

      const base64Signature = req.body.signature;

      // Validasi ukuran base64 signature
      const originalBuffer = Buffer.from(base64Signature.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      if (originalBuffer.length > 1048576) { // 1MB limit
        return errorResponse(res, 'Ukuran tanda tangan melebihi 1MB', 400);
      }

      // Validasi minimal ukuran signature (untuk mencegah signature kosong)
      if (originalBuffer.length < 100) { // Minimal 100 bytes
        return errorResponse(res, 'Tanda tangan terlalu kecil atau kosong', 400);
      }

      // Validasi rate limiting (mencegah spam)
      // Cek apakah ada presensi dari IP yang sama dalam 5 menit terakhir
      const clientIP = req.ip || req.connection.remoteAddress;
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const recentPresensi = await presensiService.checkRecentPresensiByIP(
        kegiatanUuid,
        clientIP,
        fiveMinutesAgo
      );

      if (recentPresensi) {
        return errorResponse(res, 'Harap tunggu 5 menit sebelum melakukan presensi lagi', 429);
      }

      // Sanitasi data attendance
      const sanitizedAttendance = {};
      for (const field of requiredFields) {
        sanitizedAttendance[field] = attendance[field].trim();

        // Validasi panjang field
        if (sanitizedAttendance[field].length > 255) {
          return errorResponse(res, `Field ${field} terlalu panjang (maksimal 255 karakter)`, 400);
        }

        // Validasi karakter berbahaya
        if (/<script|javascript:|data:|vbscript:/i.test(sanitizedAttendance[field])) {
          return errorResponse(res, `Field ${field} mengandung karakter yang tidak diizinkan`, 400);
        }
      }

      // Simpan file ke server
      const fileName = `${Date.now()}-${kegiatanUuid}.png`;
      const dirPath = path.join(__dirname, '../../../uploads/signatures');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const filePath = path.join(dirPath, fileName);
      fs.writeFileSync(filePath, originalBuffer);

      // Simpan path ke database dengan data yang sudah divalidasi dan disanitasi
      const presensiData = {
        kegiatan_uuid: kegiatanUuid,
        attendance: sanitizedAttendance,
        signature: `/kegiatan/signatures/${fileName}`,
        waktu_presensi: waktuPresensiDate.toISOString(),
        ip_address: clientIP,
        user_agent: req.headers['user-agent'] || '',
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };

      const newPresensi = await presensiService.createPresensi(presensiData);

      successResponse(res, newPresensi, 'Presensi berhasil dibuat', 201);
    } catch (error) {
      // Log error untuk debugging
      console.error('Error creating presensi:', error);
      errorResponse(res, `Terjadi kesalahan: ${error.message}`, 500);
    }
  });

  route.delete('/:kegiatanUuid/presensi/:uuid', { preHandler: authMiddleware }, async (req, res) => {
    try {
      const { kegiatanUuid, uuid } = req.params;

      // Validasi ownership kegiatan
      const kegiatan = await kegiatanService.getByUuid(kegiatanUuid, req.user.uuid);
      if (!kegiatan) {
        return errorResponse(res, 'Kegiatan tidak ditemukan atau Anda tidak memiliki akses', 404);
      }

      // Hapus presensi
      const deleted = await presensiService.deletePresensi(uuid);
      if (!deleted) {
        return errorResponse(res, 'Presensi tidak ditemukan', 404);
      }

      successResponse(res, null, 'Presensi berhasil dihapus');
    } catch (error) {
      req.log.error(error);
      errorResponse(res, `Terjadi kesalahan: ${error.message}`);
    }
  });
}

module.exports = presensiController;