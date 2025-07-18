/**
 * Helper untuk pagination query Sequelize
 * @param {Model} model - Sequelize model
 * @param {Object} options - { page, limit, ...where }
 * @returns {Promise<{data, meta}>}
 */
async function paginate(model, { page = 1, limit = 10, where }) {
  const offset = (page - 1) * limit;
  // Ambil order dari where, default ke createdAt DESC
  let order = [['createdAt', 'DESC']];
  if (where.orderBy) {
    const { orderBy, orderDir = 'DESC' } = where;
    order = [[orderBy, orderDir.toUpperCase()]];
    delete where.orderBy;
    delete where.orderDir;
  }
  const result = await model.findAndCountAll({
    where,
    limit,
    offset,
    order,
  });
  return {
    data: result.rows,
    meta: {
      total: result.count,
      page,
      limit,
      totalPages: Math.ceil(result.count / limit),
    },
  };
}

module.exports = { paginate };
