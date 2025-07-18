const { paginate } = require("../helpers/pagination.helper");
const db = require("../models");
const fs = require('fs');
const path = require('path');

class KegiatanService {
  constructor() {
    this.model = db.kegiatan
  }

  async getAll(options) {
    const { page, limit, search, user_uuid } = options;
    const where = { user_uuid };
    if (search) {
      where[db.Sequelize.Op.or] = [
        { nama: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { deskripsi: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { lokasi: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    const result = await paginate(this.model, { page, limit, where });
    return result;
  }

  async getByUuid(uuid, user_uuid = null) {
    const where = { uuid };
    if (user_uuid) where.user_uuid = user_uuid;
    return await this.model.findOne({ where });
  }

  async getCountByUser(user_uuid) {
    return this.model.count({ where: { user_uuid } });
  }

  async getTodayCountByUser(user_uuid) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return this.model.count({
      where: {
        user_uuid,
        [db.Sequelize.Op.or]: [
          {
            waktu_mulai: {
              [db.Sequelize.Op.gte]: startOfDay,
              [db.Sequelize.Op.lt]: endOfDay
            }
          },
          {
            waktu_selesai: {
              [db.Sequelize.Op.gte]: startOfDay,
              [db.Sequelize.Op.lt]: endOfDay
            }
          }
        ]
      }
    });
  }

  async getTotalPresensiByUser(user_uuid) {
    const presensiCount = await db.presensi.count({
      include: [{
        model: this.model,
        where: { user_uuid },
        attributes: []
      }]
    });
    return presensiCount;
  }

  async store(data) {
    const kegiatan = await this.model.create(data);
    return kegiatan;
  }

  async update(uuid, data) {
    const kegiatan = await this.model.findOne({ where: { uuid, user_uuid: data.user_uuid } });
    if (!kegiatan) throw new Error("Kegiatan tidak ditemukan atau bukan milik Anda");
    await kegiatan.update(data);
    return kegiatan;
  }

  async delete(uuid, user_uuid) {
    const kegiatan = await this.model.findOne({ where: { uuid, user_uuid } });
    if (!kegiatan) throw new Error("Kegiatan tidak ditemukan atau bukan milik Anda");

    // Hapus file signature presensi terkait kegiatan ini
    try {
      const presensiList = await db.presensi.findAll({
        where: { kegiatan_uuid: uuid },
        attributes: ['signature']
      });

      for (const presensi of presensiList) {
        if (presensi.signature) {
          // Extract filename from signature path
          const filename = presensi.signature.replace('/kegiatan/signatures/', '');
          const filePath = path.join(__dirname, '../../uploads/signatures', filename);

          // Hapus file jika ada
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      // Hapus semua presensi terkait kegiatan
      await db.presensi.destroy({ where: { kegiatan_uuid: uuid } });
    } catch (error) {
      console.error('Error deleting signature files:', error);
      // Lanjutkan proses delete kegiatan meskipun ada error hapus file
    }

    // Hapus kegiatan
    await kegiatan.destroy();
    return true;
  }

  async generatePresensiPDF(uuid, user_uuid) {
    const wkhtmltopdf = require('wkhtmltopdf');
    const kegiatan = await this.getByUuid(uuid, user_uuid);
    if (!kegiatan) throw new Error("Kegiatan tidak ditemukan");

    // Get presensi data
    const presensiList = await db.presensi.findAll({
      where: { kegiatan_uuid: uuid },
      order: [['created_at', 'ASC']]
    });

    // Calculate total columns: No + attendance_fields + Waktu Presensi + Tanda Tangan
    const totalColumns = 1 + kegiatan.attendance_fields.length + 2;
    const isLandscape = totalColumns >= 8;

    // Generate HTML content
    const html = this.generateHTMLContent(kegiatan, presensiList, isLandscape);

    // wkhtmltopdf options
    const options = isLandscape ? {
      pageWidth: '215mm',
      pageHeight: '330mm',
      orientation: 'Landscape',
      marginTop: '0',
      marginBottom: '0',
      marginLeft: '0',
      marginRight: '0',
      encoding: 'UTF-8',
      disableSmartShrinking: true
    } : {
      pageWidth: '215mm',
      pageHeight: '330mm',
      orientation: 'Portrait',
      marginTop: '0',
      marginBottom: '0',
      marginLeft: '0',
      marginRight: '0',
      encoding: 'UTF-8',
      disableSmartShrinking: true
    };

    return new Promise((resolve, reject) => {
      const buffers = [];
      const stream = wkhtmltopdf(html, options);

      stream.on('data', (chunk) => {
        buffers.push(chunk);
      });

      stream.on('end', () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          if (pdfBuffer.length === 0) {
            reject(new Error('PDF generation failed: Empty buffer'));
            return;
          }
          console.log(`PDF generated successfully: ${pdfBuffer.length} bytes`);
          resolve(pdfBuffer);
        } catch (error) {
          console.error('Error concatenating PDF buffer:', error);
          reject(error);
        }
      });

      stream.on('error', (error) => {
        console.error('wkhtmltopdf stream error:', error);
        reject(error);
      });

      // Add timeout protection
      setTimeout(() => {
        reject(new Error('PDF generation timeout after 30 seconds'));
      }, 30000);
    });
  }

  generateHTMLContent(kegiatan, presensiList, isLandscape) {
    const formatDateTime = (dateStr) => {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      const pad = (n) => n.toString().padStart(2, "0");
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    // Generate table headers
    const headers = ['No', ...kegiatan.attendance_fields, 'Waktu Presensi', 'Tanda Tangan'];

    // Generate table rows with base64 encoded images
    const rows = presensiList.map((item, index) => {
      const attendanceData = kegiatan.attendance_fields.map(field =>
        item.attendance[field] || '-'
      );

      // Convert signature to base64 for embedding in PDF
      let signatureImg = '-';
      if (item.signature) {
        try {
          const filename = item.signature.replace('/kegiatan/signatures/', '');
          const filePath = path.join(__dirname, '../../uploads/signatures', filename);

          if (fs.existsSync(filePath)) {
            const imageBuffer = fs.readFileSync(filePath);
            const base64Image = imageBuffer.toString('base64');
            signatureImg = `<img src="data:image/png;base64,${base64Image}" style="max-width: 80px; max-height: 40px; object-fit: contain;" alt="signature" />`;
          }
        } catch (error) {
          console.error('Error reading signature file:', error);
          signatureImg = '-';
        }
      }

      return [
        index + 1,
        ...attendanceData,
        formatDateTime(item.waktu_presensi),
        signatureImg
      ];
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Daftar Hadir - ${kegiatan.nama}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: bold;
        }
        .header .details {
          text-align: left;
        }
        .header p {
          font-size: 11px;
          margin: 1px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px 6px;
          text-align: center;
          vertical-align: middle;
          word-wrap: break-word;
          font-size: 11px;
          line-height: 1rem;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
          font-size: 11px;
        }
        .attendance-field {
          text-align: left !important;
        }
        .signature-cell {
          width: ${isLandscape ? '80px' : '100px'};
          min-height: ${isLandscape ? '35px' : '45px'};
        }
        .signature-cell img {
          max-width: ${isLandscape ? '75px' : '95px'};
          max-height: ${isLandscape ? '30px' : '40px'};
          object-fit: contain;
        }
        .no-col {
          width: ${isLandscape ? '30px' : '40px'};
        }
        .waktu-col {
          width: ${isLandscape ? '80px' : '100px'};
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>DAFTAR HADIR</h1>
        <div class="details">
          <p><strong>Kegiatan:</strong> ${kegiatan.nama}</p>
          <p><strong>Total Presensi:</strong> ${presensiList.length} orang</p>
          <p><strong>Tanggal Export:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            ${headers.map((header, index) => {
      let className = '';
      if (index === 0) className = 'no-col';
      else if (index === headers.length - 2) className = 'waktu-col';
      else if (index === headers.length - 1) className = 'signature-cell';
      else className = 'header'; // Attendance fields get left alignment

      return `<th class="${className}">${header}</th>`;
    }).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map((cell, index) => {
      let className = '';
      if (index === 0) className = 'no-col';
      else if (index === row.length - 2) className = 'waktu-col';
      else if (index === row.length - 1) className = 'signature-cell';
      else className = 'attendance-field'; // Attendance fields get left alignment

      return `<td class="${className}">${cell}</td>`;
    }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
    `;
  }


}

module.exports = new KegiatanService();