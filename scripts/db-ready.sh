#!/bin/bash

# Dùng Node trực tiếp để kiểm tra MongoDB
node - <<'EOF'
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' }); // load .env

// Lấy URL từ .env
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI chưa được thiết lập trong .env');
  process.exit(1);
}

// Kết nối Mongoose
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB is connected!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
EOF