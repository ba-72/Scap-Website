// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_FILE = path.join(__dirname, 'votes.json');

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

// 如果数据文件不存在，初始化
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    options: { A:0, B:0, C:0 },
    voters: []  // 存储所有已投票的 voterId
  }, null, 2));
}

// 读取/写入帮助函数
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 中间件：确保每个访客有一个唯一 voterId 存在 cookie
app.use((req, res, next) => {
  if (!req.cookies.voterId) {
    const id = randomUUID();
    // 一年后过期
    res.cookie('voterId', id, { httpOnly: true, maxAge: 365*24*60*60*1000 });
    req.cookies.voterId = id;
  }
  next();
});

// 获取当前投票状态
app.get('/api/votes', (req, res) => {
  const data = readData();
  const hasVoted = data.voters.includes(req.cookies.voterId);
  res.json({
    options: data.options,
    hasVoted
  });
});

// 提交一票
app.post('/api/vote', (req, res) => {
  const { option } = req.body;
  const voterId = req.cookies.voterId;
  const data = readData();

  // 检查是否已投
  if (data.voters.includes(voterId)) {
    return res.status(400).json({ success:false, message:'您已投过票了' });
  }
  // 验证选项
  if (!(option in data.options)) {
    return res.status(400).json({ success:false, message:'无效选项' });
  }

  // 记录投票
  data.options[option]++;
  data.voters.push(voterId);
  writeData(data);

  res.json({ success:true, options: data.options });
});

// 启动
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
