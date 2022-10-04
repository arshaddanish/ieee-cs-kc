const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'cskc',
    password: process.env.DB_PASSWORD || 'cskc',
    database: process.env.DB_NAME || 'cskcdb',
  },
  listPerPage: 10,
};

module.exports = config;
