// ============================================================
// server.js — Backend ka MAIN file. Server yahin se start hota hai.
// Start karne ki command:  npm run dev
// ============================================================

const express = require('express'); // Express = web server banane ke liye
const cors    = require('cors');    // CORS = phone ki app ko server se baat karne ki ijazat deta hai
const os      = require('os');      // os = is computer ka IP address maloom karne ke liye

// Database se connect karne wala function (config/db.js se)
const { connectDB } = require('./config/db');

// Har feature ki apni routes file hai
const authRoutes          = require('./routes/authRoutes');          // Login
const studentRoutes       = require('./routes/studentRoutes');       // Students (directory, profile)
const adminRoutes         = require('./routes/adminRoutes');         // Admin profile
const noticeRoutes        = require('./routes/noticeRoutes');        // Notices
const noticeRequestRoutes = require('./routes/noticeRequestRoutes'); // Student ki notice requests
const commentRoutes       = require('./routes/commentRoutes');       // Notice ke comments

const app = express();

app.use(cors());         // app ko server use karne ki ijazat
app.use(express.json()); // app jo JSON bheje usay samajhne ke liye

// Neeche har URL ke saamne likha hai ke kaun si screen use karti hai
app.use('/api/auth',            authRoutes);          // LoginScreen
app.use('/api/students',        studentRoutes);       // StudentDirectory, StudentProfile, StudentEditProfile
app.use('/api/admin',           adminRoutes);         // AdminProfile
app.use('/api/notices',         noticeRoutes);        // StudentDashboard, StudentNoticeBoard, AdminNoticeBoard, AdminPostNotice
app.use('/api/notice-requests', noticeRequestRoutes); // PostRequest (student), AdminApprovals (admin)
app.use('/api',                 commentRoutes);       // Notice ke comments (abhi app me hide hain)

// Server chal raha hai ya nahi, browser me test karne ke liye
app.get('/', (req, res) => {
  res.json({ message: 'BIIT Portal API is running!' });
});

// Is computer ka IP address nikalta hai (phone ko yehi IP chahiye hota hai)
function getComputerIPs() {
  const ips = [];
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const item of interfaces[name]) {
      const isIPv4 = item.family === 'IPv4' || item.family === 4;
      if (isIPv4 && !item.internal) ips.push(item.address);
    }
  }
  return ips;
}

const PORT = 3000;

// Pehle database connect hota hai, phir server start hota hai
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    getComputerIPs().forEach((ip) => {
      console.log(`Phone se is IP par try karo: http://${ip}:${PORT}`);
    });
  });
});
