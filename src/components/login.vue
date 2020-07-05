<template>
  <div class="container">
    <div class="box">
      <span>用户登录</span>
      <!-- 登录表单 -->      
      <el-form 
        ref="loginFormRef"
        :model="loginForm" 
        :rules="loginFormRules">
          <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            maxlength=10
            placeholder="用户名"
            clearable
            @keyup.enter.native="login">
          </el-input>
          </el-form-item>
          <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            maxlength=18
            placeholder="密码"
            clearable
            @keyup.enter.native="login">
          </el-input>
          </el-form-item>
          <el-button type="primary" @click.prevent="login">登 录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456"
      },
      // 表单验证
      loginFormRules: {
        username: [
          // required 属性规定必需在提交之前填写输入字段
          // trigger 触发方式，blur失去焦点
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符",trigger: "blur"}
        ],
        password:[
          {required: true, message:'请输入用户密码',trigger:'blur'},
          {min:6, max:18, message:'长度在 6 到 18 个字符',trigger: "blur"}
        ]
      }
    }
  },
  methods:{
    login(){
      // 表单预验证
      // valid：bool类型
      this.$refs.loginFormRef.validate(async valid =>{
      if(!valid)return false
      const {data:res} = await this.$http.post('login',this.loginForm)
      if(res.meta.status !== 200)return this.$message.error('登录失败,账号或密码错误!')
      this.$message.success(`${this.loginForm.username} 你好`)
      // 1、将登陆成功之后的token, 保存到客户端的sessionStorage中; localStorage中是持久化的保存
      //   1.1 项目中出现了登录之外的其他API接口，必须在登陆之后才能访问
      //   1.2 token 只应在当前网站打开期间生效，所以将token保存在sessionStorage中
      window.sessionStorage.setItem('token',res.data.token)
      this.$router.push('/home')
      })
    }
  }
}
</script>

<style scoped>
/* scoped vue的指令，只在当前组件生效  */
.container{
  background-color: #2c3e50;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.box{
  width: 450px;
  height: 360px;
  background-color: #fff;
  border-radius: 15px;
  display: flex; 
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: center;
}
span{
  font-size: 25px;
  font-weight: bold;
  margin: 40px 0;
}

.el-form{
  width: 60%;
  display: flex;
  flex-flow: column nowrap;
  /* justify-content: space-between; */
  margin-bottom: 60px;
}
.el-button{
  font-size: 20px;
}
</style>