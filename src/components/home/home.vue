<template>
  <el-container>
      <aside>
        <div class="logo-box">
          <img
          src="@/assets/logo.png"
          alt="logo"
          class="aside-logo"/>
          <span>后台管理系统</span>
        </div>
        <!-- unique-opened	是否只保持一个子菜单的展开 -->
        <!-- router  导航开启路由模式 -->
        <el-menu
        unique-opened
        router
        background-color="#2c3e50"
        text-color="#ecf0f1">
        <el-submenu
          :index="item.id+''"
          v-for="item in menuList"
          :key="item.id">
          <template slot="title">
            <i :class="iconObj[item.id]"></i>
            <span>{{ item.authName }}</span>
          </template>
          <el-menu-item
            :index="'/' + subItem.path"
            v-for="subItem in item.children"
            :key="subItem.id">
            <!-- 导航开启路由模式：将index值作为导航路由 -->
            <!-- 二级菜单的模板区域 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{subItem.authName}}</span>
            </template>
          </el-menu-item>
          </el-submenu>
        </el-menu>
      </aside>
      <!-- 内容主体 -->
      <el-main>
        <el-header>
          <div>标签页</div>
          <div>头像盒子
          <el-button type="danger" @click="logout" class="logout">退 出</el-button>
          </div>
        </el-header>
        <router-view>
        </router-view>
      </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList:[],
      iconObj: {
        '125': 'el-icon-location-outline',
        '103': 'el-icon-edit-outline',
        '101': 'el-icon-goods',
        '102': 'el-icon-date',
        '145': 'el-icon-picture'
      },
    }
  },
  created () {
    this.getMenuList()
  },
  methods: {
    // 获取请求菜单
    async getMenuList () {
      const { data:res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.message.error(res.meta.msg)
      this.menuList = res.data
    },
    //  退出登录 清除token，弹出提示信息，跳转到登录页面
    logout(){
        window.sessionStorage.clear()
        this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.el-container {
  height: 100%;
}
aside{
  background-color: #2c3e50;
  color: #fff;
  width: 230px;
  font-size: 20px;
}
.logo-box{
  display: flex;
  justify-content: center;
  align-items: center;
}
.aside-logo{
  height: 60px;
}
.el-menu{
  width: 228px;
}
.el-main{
  background-color: #ecf0f1;
  color: #333;
  text-align: center;
  padding: 10px;
}
.el-header{
  display: flex;
  justify-content: space-between;
  align-content: center;
}
</style>