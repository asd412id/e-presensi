const { successResponse, errorResponse } = require("../../helpers/response.helper");
const authMiddleware = require("../../middleware/auth.middleware");
const kegiatanService = require("../../services/kegiatan.service");

function kegiatanController(route) {
  route.addHook('preHandler', authMiddleware);

  route.get('/', async (request, reply) => {
    const { page, limit, search } = request.query;
    try {
      const data = await kegiatanService.getAll({ page, limit, search, user_uuid: request.user.uuid });
      return successResponse(reply, data, 'Data kegiatan berhasil diambil');
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`);
    }
  });

  route.get('/count', async (request, reply) => {
    try {
      const count = await kegiatanService.getCountByUser(request.user.uuid);
      return successResponse(reply, { total: count }, 'Total kegiatan berhasil diambil');
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`);
    }
  });

  // Get kegiatan hari ini
  route.get('/today/count', async (request, reply) => {
    try {
      const count = await kegiatanService.getTodayCountByUser(request.user.uuid);
      return successResponse(reply, { total: count }, 'Total kegiatan hari ini berhasil diambil');
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`);
    }
  });

  // Get total presensi
  route.get('/presensi/total', async (request, reply) => {
    try {
      const total = await kegiatanService.getTotalPresensiByUser(request.user.uuid);
      return successResponse(reply, { total }, 'Total presensi berhasil diambil');
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`);
    }
  });

  // Get kegiatan by uuid
  route.get('/:uuid', async (request, reply) => {
    try {
      const kegiatan = await kegiatanService.getByUuid(request.params.uuid, request.user.uuid);
      if (!kegiatan) {
        return errorResponse(reply, 'Kegiatan tidak ditemukan', 404);
      }
      kegiatan.pin = kegiatan.pin || false; // Ensure pin is always a boolean
      return successResponse(reply, kegiatan, 'Data kegiatan berhasil diambil');
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`, 404);
    }
  });

  // Create kegiatan
  route.post('/', async (request, reply) => {
    try {
      const { nama, deskripsi, waktu_mulai, waktu_selesai, lokasi, attendance_fields } = request.body;
      const errors = [];
      if (!nama || !nama.trim()) errors.push('Nama kegiatan wajib diisi');
      if (!deskripsi || !deskripsi.trim()) errors.push('Deskripsi wajib diisi');
      if (!waktu_mulai) errors.push('Waktu mulai wajib diisi');
      if (!waktu_selesai) errors.push('Waktu selesai wajib diisi');
      if (!lokasi || !lokasi.trim()) errors.push('Lokasi wajib diisi');
      if (!attendance_fields || !Array.isArray(attendance_fields) || attendance_fields.length === 0) errors.push('Minimal satu field presensi harus dipilih');
      if (waktu_mulai && waktu_selesai) {
        const start = new Date(waktu_mulai);
        const end = new Date(waktu_selesai);
        if (end <= start) errors.push('Waktu selesai harus lebih besar dari waktu mulai');
      }
      if (errors.length > 0) return errorResponse(reply, errors.join(', '), 400);
      const kegiatan = await kegiatanService.store({ ...request.body, user_uuid: request.user.uuid });
      return successResponse(reply, kegiatan, 'Kegiatan berhasil dibuat');
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Gagal membuat kegiatan: ${error.message}`);
    }
  });

  // Update kegiatan
  route.put('/:uuid', async (request, reply) => {
    try {
      const { nama, deskripsi, waktu_mulai, waktu_selesai, lokasi, attendance_fields } = request.body;
      const errors = [];
      if (!nama || !nama.trim()) errors.push('Nama kegiatan wajib diisi');
      if (!deskripsi || !deskripsi.trim()) errors.push('Deskripsi wajib diisi');
      if (!waktu_mulai) errors.push('Waktu mulai wajib diisi');
      if (!waktu_selesai) errors.push('Waktu selesai wajib diisi');
      if (!lokasi || !lokasi.trim()) errors.push('Lokasi wajib diisi');
      if (!attendance_fields || !Array.isArray(attendance_fields) || attendance_fields.length === 0) errors.push('Minimal satu field presensi harus dipilih');
      if (waktu_mulai && waktu_selesai) {
        const start = new Date(waktu_mulai);
        const end = new Date(waktu_selesai);
        if (end <= start) errors.push('Waktu selesai harus lebih besar dari waktu mulai');
      }
      if (errors.length > 0) return errorResponse(reply, errors.join(', '), 400);
      const kegiatan = await kegiatanService.update(request.params.uuid, { ...request.body, user_uuid: request.user.uuid });
      return successResponse(reply, kegiatan, 'Kegiatan berhasil diperbarui');
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Gagal memperbarui kegiatan: ${error.message}`);
    }
  });

  // Delete kegiatan
  route.delete('/:uuid', async (request, reply) => {
    try {
      await kegiatanService.delete(request.params.uuid, request.user.uuid);
      return successResponse(reply, null, 'Kegiatan berhasil dihapus');
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Gagal menghapus kegiatan: ${error.message}`);
    }
  });

  // Download PDF presensi
  route.get('/:uuid/presensi/pdf', async (request, reply) => {
    try {
      const { uuid } = request.params;
      const pdfBuffer = await kegiatanService.generatePresensiPDF(uuid, request.user.uuid);

      if (!pdfBuffer) {
        return errorResponse(reply, 'Gagal menggenerate PDF', 500);
      }

      // Get kegiatan name for filename
      const kegiatan = await kegiatanService.getByUuid(uuid, request.user.uuid);
      const filename = `presensi-${kegiatan.nama.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(pdfBuffer);
    } catch (error) {
      request.log.error(error);
      errorResponse(reply, `Gagal menggenerate PDF: ${error.message}`);
    }
  });


}

module.exports = kegiatanController;