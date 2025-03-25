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

        // 获取用户健康信息
        const [userAnswers] = await pool.execute(`
            SELECT q.id, sa.answer 
            FROM survey_answers sa
            JOIN questions q ON sa.question_id = q.id
            WHERE user_id = ?
        `, [decoded.userId]);

        // 解析用户特征
        const userFeatures = {
            diseases: [],          // 疾病列表
            allergies: [],         // 过敏食材
            healthGoals: [],       // 健康目标
            forbiddenFoods: [],    // 需减少的食物
            dietType: '混合饮食',   // 默认饮食类型
            age: 25                // 默认年龄
        };

        userAnswers.forEach(a => {
            switch (a.id) {
                case 4: if (a.answer === '是') userFeatures.diseases.push('糖尿病'); break;
                case 5: if (a.answer === '是') userFeatures.diseases.push('高血压'); break;
                case 7:
                    if (a.answer !== '否') {
                        userFeatures.allergies = a.answer.split(/，|,/);
                    }
                    break;
                case 19: userFeatures.healthGoals = a.answer.split(/，|,/); break;
                case 20: userFeatures.forbiddenFoods = a.answer.split(/，|,/); break;
                case 11: userFeatures.dietType = a.answer; break;
                case 3: userFeatures.age = parseInt(a.answer) || 25; break;
            }
        });

        // 构建查询条件
        let query = `SELECT * FROM recipes WHERE 1=1`;
        const params = [];

        // 疾病过滤
        if (userFeatures.diseases.length > 0) {
            query += ` AND JSON_OVERLAPS(suitable_diseases, ?)`;
            params.push(JSON.stringify(userFeatures.diseases));
        }

        // 过敏过滤
        if (userFeatures.allergies.length > 0) {
            query += ` AND NOT JSON_OVERLAPS(ingredients, ?)`;
            params.push(JSON.stringify(userFeatures.allergies));
        }

        // 健康目标匹配
        if (userFeatures.healthGoals.length > 0) {
            query += ` AND JSON_OVERLAPS(health_goals, ?)`;
            params.push(JSON.stringify(userFeatures.healthGoals));
        }

        // 执行查询
        const [recipes] = await pool.execute(query, params);

        // 根据年龄调整推荐排序
        const sortedRecipes = recipes.sort((a, b) => {
            const ageFactor = userFeatures.age < 50 ? a.calories - b.calories : b.calories - a.calories;
            return ageFactor || b.create_time.localeCompare(a.create_time);
        });

        // 打印日志，方便调试
        console.log('推荐的食谱数量:', sortedRecipes.length);

        res.json(sortedRecipes.slice(0, 12)); // 返回前12个推荐结果

    } catch (error) {
        console.error('推荐失败:', error);
        res.status(500).json({ error: '推荐服务暂不可用' });
    }
});
const PORT = 3000;
app.listen(PORT, () => console.log(`后端运行在 http://localhost:${PORT}`));
