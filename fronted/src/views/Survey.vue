<template>
  <div class="survey-container">
    <el-card>
      <h1>健康调查问卷</h1>
      <el-form @submit.prevent="handleSubmit">
        <!-- 遍历所有问题 -->
        <div v-for="q in questions" :key="q.id" class="question-item">
          <h3>{{ q.content }}</h3>
          
          <!-- 文本输入问题 -->
          <el-input 
            v-if="needsTextInput(q.id)"
            v-model="answers[q.id]"
            :placeholder="getPlaceholder(q.id)"
            clearable
          />

          <!-- 单选问题 -->
          <el-radio-group 
            v-else-if="needsRadio(q.id)"
            v-model="answers[q.id]"
          >
            <el-radio 
              v-for="opt in getOptions(q.id)" 
              :key="opt" 
              :label="opt"
              border
            />
          </el-radio-group>

          <!-- 多选问题（第12题） -->
          <el-checkbox-group
            v-else-if="q.id === 12"
            v-model="answers[q.id]"
          >
            <el-checkbox
              v-for="opt in getOptions(q.id)"
              :key="opt"
              :label="opt"
              border
            />
          </el-checkbox-group>
        </div>

        <el-button 
          type="primary" 
          native-type="submit"
          :disabled="!isFormValid"
        >
          提交问卷
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router';

const router = useRouter();
const questions = ref([])
const answers = ref({
  // 初始化多选问题为数组
  12: []
})

// 获取问题列表
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/questions')
    questions.value = response.data
  } catch (error) {
    ElMessage.error('加载问题失败')
  }
})

// 表单验证
const isFormValid = computed(() => {
  return questions.value.every(q => {
    const answer = answers.value[q.id]
    if (q.id === 12) return answer.length > 0  // 多选至少选一项
    return !!answer?.toString().trim()
  })
})

// 问题类型判断
const needsTextInput = (id) => [1,3,7,8,9,10,19,20,21].includes(id)
const needsRadio = (id) => [2,4,5,6,11,13,14,15,16,17,18].includes(id)

// 获取选项
const getOptions = (id) => {
  const optionsMap = {
    2: ['男', '女'],
    4: ['是', '否'],
    5: ['是', '否'],
    6: ['是', '否'],
    11: ['素食', '非素食', '混合饮食'],
    12: ['蔬菜', '水果', '肉类', '海鲜', '甜食', '快餐', '辣味食品', '其他'],
    13: ['喜欢', '不喜欢', '不确定'],
    14: ['是', '否'],
    15: ['喜欢', '不喜欢'],
    16: ['是', '否'],
    17: ['是', '否'],
    18: ['米饭', '面条', '馒头', '包子', '粥']
  }
  return optionsMap[id] || []
}

// 占位符提示
const getPlaceholder = (id) => {
  const placeholders = {
    1: '请输入您的姓名',
    3: '请输入年龄（数字）',
    7: '例如：海鲜、花生等',
    8: '例如：高血压、哮喘等',
    9: '例如：阿司匹林、胰岛素等',
    10: '例如：糖尿病、心脏病等',
    19: '例如：减肥、改善睡眠等',
    20: '例如：油炸食品、甜食等',
    21: '例如：清真、无麸质等'
  }
  return placeholders[id] || '请输入'
}

// 提交处理
const handleSubmit = async () => {
  try {
    // 格式化多选答案（第12题）
    const formattedAnswers = Object.entries(answers.value).map(([id, value]) => ({
      questionId: parseInt(id),
      answer: Array.isArray(value) ? value.join(', ') : value.toString()
    }));

    const response = await axios.post('http://localhost:3000/api/survey', 
      { answers: formattedAnswers },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.status === 201) {
      router.push('/recommend');
    }
    
    ElMessage.success('提交成功！')
    // 清空表单
    answers.value = { 12: [] }
  } catch (error) {
    ElMessage.error('提交失败：' + (error.response?.data?.error || '服务器错误'))
  }
}
</script>

<style scoped>
.survey-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.question-item {
  margin-bottom: 25px;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.el-radio,
.el-checkbox {
  margin: 5px 15px 5px 0 !important;
}

.el-input {
  width: 100%;
  max-width: 400px;
}
</style>