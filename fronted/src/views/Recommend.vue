<template>
  <div class="recommend-container">
      <el-card>
          <h1>为您随机推荐的健康食谱</h1>
          <el-card class="recipe-card">
              <div class="card-header">
                  <h3>{{ recipe.name }}</h3>
                  <div class="meta-info">
                      <el-tag type="warning">{{ recipe.meal_type }}</el-tag>
                      <span class="calories">{{ recipe.calories }}kcal</span>
                  </div>
              </div>

              <el-collapse>
                  <el-collapse-item title="📜 食材清单">
                      <ul class="ingredient-list">
                          <li v-for="(item, i) in JSON.parse(recipe.ingredients)" :key="i">
                              <el-icon><Food /></el-icon>{{ item }}
                          </li>
                      </ul>
                  </el-collapse-item>

                  <el-collapse-item title="👩🍳 制作方法">
                      <pre class="cooking-method">{{ recipe.cooking_method }}</pre>
                  </el-collapse-item>

                  <el-collapse-item title="🏷️ 健康标签">
                      <div class="tags">
                          <el-tag 
                              v-for="(tag, i) in JSON.parse(recipe.health_goals)" 
                              :key="i"
                              type="success"
                          >
                              {{ tag }}
                          </el-tag>
                      </div>
                  </el-collapse-item>
              </el-collapse>
          </el-card>
      </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Food } from '@element-plus/icons-vue';
import axios from 'axios';

const recipe = ref({});

onMounted(async () => {
  try {
      const response = await axios.get('http://localhost:3000/api/recommend', {
          headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
          }
      });
      recipe.value = response.data;
  } catch (error) {
      console.error('获取推荐失败:', error);
  }
});
</script>

<style scoped>
.recommend-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.recipe-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 15px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.calories {
  color: #666;
  font-size: 0.9em;
}

.ingredient-list {
  padding-left: 20px;
}

.ingredient-list li {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cooking-method {
  white-space: pre-wrap;
  line-height: 1.6;
  font-family: inherit;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
