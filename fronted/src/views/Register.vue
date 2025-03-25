<template>
  <div class="register-container">
    <el-card class="box-card">
      <h2>用户注册</h2>
      <el-form @submit.prevent="handleRegister">
        <el-form-item>
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-button 
          type="primary" 
          native-type="submit" 
          class="submit-btn"
          :loading="loading"
        >
          立即注册
        </el-button>
        <el-link type="primary" @click="$router.push('/login')">已有账号？立即登录</el-link>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)

const handleRegister = async () => {
  // 简单表单验证
  if (!form.value.username.trim() || !form.value.password.trim()) {
    ElMessage.warning('用户名和密码不能为空')
    return
  }

  try {
    loading.value = true
    await axios.post('http://localhost:3000/api/register', {
      username: form.value.username,
      password: form.value.password
    })
    
    ElMessage.success('注册成功！')
    router.push('/login') // 自动跳转到登录页
  } catch (error) {
    const msg = error.response?.data?.error || '注册失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.box-card {
  width: 400px;
  padding: 20px;
}
.submit-btn {
  width: 100%;
  margin-bottom: 15px;
}
</style>