<template>
  <div class="login-container">
    <el-card class="box-card">
      <h2>登录</h2>
      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" />
        </el-form-item>
        <el-button type="primary" native-type="submit" class="submit-btn">登录</el-button>
        <el-link type="primary" @click="$router.push('/register')">没有账号？立即注册</el-link>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/login', form.value)
    localStorage.setItem('token', response.data.token)
    router.push('/survey')
  } catch (error) {
    ElMessage.error('登录失败')
  }
}
</script>

<style scoped>
.login-container {
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