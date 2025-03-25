﻿# bishelianxi
数据库结构
mysql> use survey;
Database changed
mysql> CREATE TABLE users (
    ->   id INT PRIMARY KEY AUTO_INCREMENT,
    ->   username VARCHAR(50) UNIQUE NOT NULL,
    ->   password VARCHAR(100) NOT NULL,
    ->   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    -> );
Query OK, 0 rows affected (0.06 sec)

mysql> CREATE TABLE questions (
    ->   id INT PRIMARY KEY,
    ->   content TEXT NOT NULL
    -> );
Query OK, 0 rows affected (0.02 sec)

mysql>
mysql> -- 插入固定问题
mysql> INSERT INTO questions (id, content) VALUES
    -> (1, '姓名:'),
    -> (2, '性别:（男/女）'),
    -> (3, '年龄:'),
    -> (4, '是否有糖尿病:（是/否）'),
    -> (5, '是否有高血压:（是/否）'),
    -> (6, '是否有高胆固醇:（是/否）'),
    -> (7, '是否有食物过敏:（是/否）（如果是，请注明过敏的食物）'),
    -> (8, '是否有慢性病史:（是/否）（如果是，请列举相关疾病）'),
    -> (9, '是否正在服用药物:（是/否）（如果是，请列举药物）'),
    -> (10, '是否有家族遗传病史:（是/否）（如果是，请列举家族遗传病史）'),
    -> (11, '日常饮食类型:（素食/非素食/混合饮食）'),
    -> (12, '常吃的食物类型（可多选）:（蔬菜/水果/肉类/海鲜/甜食/快餐/辣味食品/其他）'),
    -> (13, '是否喜欢辣味:（喜欢/不喜欢/不确定）'),
    -> (14, '是否常吃甜食:（是/否）'),
    -> (15, '是否喜欢油炸食品:（喜欢/不喜欢）'),
    -> (16, '是否吃过多的红肉:（是/否）'),
    -> (17, '是否常吃快餐或外卖:（是/否）'),
    -> (18, '最喜欢的主食:（米饭/面条/馒头/包子/粥）'),
    -> (19, '希望改善的健康问题:'),
    -> (20, '需要减少的食物类型:'),
    -> (21, '有特别的饮食限制吗?');
Query OK, 21 rows affected (0.01 sec)
Records: 21  Duplicates: 0  Warnings: 0

mysql> CREATE TABLE survey_answers (
    ->   id INT PRIMARY KEY AUTO_INCREMENT,
    ->   user_id INT NOT NULL,
    ->   question_id INT NOT NULL,
    ->   answer TEXT NOT NULL,
    ->   submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ->   FOREIGN KEY (user_id) REFERENCES users(id),
    ->   FOREIGN KEY (question_id) REFERENCES questions(id)
    -> );
Query OK, 0 rows affected (0.04 sec)
mysql> CREATE TABLE recipes (
    ->   id INT PRIMARY KEY AUTO_INCREMENT,
    ->   name VARCHAR(100) NOT NULL,
    ->   calories FLOAT NOT NULL,
    ->   ingredients JSON NOT NULL,
    ->   forbidden_ingredients JSON,
    ->   cooking_method TEXT NOT NULL,
    ->
    ->   -- 原JSON列
    ->   health_goals JSON NOT NULL,
    ->   suitable_diseases JSON,
    ->
    ->   -- 添加生成列用于索引
    ->   health_goal_first VARCHAR(50) GENERATED ALWAYS AS (health_goals->>'$[0]') VIRTUAL,
    ->   suitable_disease_first VARCHAR(50) GENERATED ALWAYS AS (suitable_diseases->>'$[0]') VIRTUAL,
    ->
    ->   meal_type ENUM('早餐', '午餐', '晚餐', '加餐'),
    ->   create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ->
    ->   -- 在生成列上创建索引
    ->   INDEX idx_health (health_goal_first),
    ->   INDEX idx_disease (suitable_disease_first)
    -> ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
Query OK, 0 rows affected (0.04 sec)
