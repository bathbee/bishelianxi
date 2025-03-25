require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 数据库连接池（根据你的MySQL配置修改）
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'survey',
    waitForConnections: true,
    connectionLimit: 10
});

const JWT_SECRET = '8x!A%D*G-KaPdSgVkYp3s6v9y$B?E(H+MbQeThWmZq4t7w!z%C&F)J@NcRfUjXn2';

// 注册接口
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(400).json({ error: '用户名已存在' });
    }
});

// 登录接口
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) return res.status(401).json({ error: '用户不存在' });

        const valid = await bcrypt.compare(password, rows[0].password);
        if (!valid) return res.status(401).json({ error: '密码错误' });

        const token = jwt.sign({ userId: rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: '登录失败' });
    }
});

// 获取问题列表
app.get('/api/questions', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM questions ORDER BY id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: '获取问题失败' });
    }
});

// 提交问卷
app.post('/api/survey', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '未授权' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { answers } = req.body;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            for (const { questionId, answer } of answers) {
                await connection.execute(
                    'INSERT INTO survey_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
                    [decoded.userId, questionId, answer]
                );
            }
            await connection.commit();
            res.status(201).json({ message: '提交成功' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(401).json({ error: '无效令牌' });
    }
});

// 新增推荐接口
app.get('/api/recommend', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '未授权' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // 直接从 recipes 表中随机选取一个食谱
        const [recipes] = await pool.execute('SELECT * FROM recipes ORDER BY RAND() LIMIT 1');

        if (recipes.length === 0) {
            return res.status(404).json({ error: '未找到食谱' });
        }

        res.json(recipes[0]);

    } catch (error) {
        console.error('推荐失败:', error);
        res.status(500).json({ error: '推荐服务暂不可用' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`后端运行在 http://localhost:${PORT}`));
