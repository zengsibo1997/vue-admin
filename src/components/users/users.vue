<template>
  <div>
    <!-- 1.面包屑 -->
    <my-bread level1='用户管理' level2='用户列表'></my-bread>
    <!-- 2.搜索 -->
    <el-row>
      <el-col :span="6">
        <el-input
        placeholder="请输入内容"
        v-model="queryInfo.query"
        clearable
        @clear="getUserList"
        @keyup.enter.native="getUserList">
          <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
        </el-input>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
      </el-col>
    </el-row>
    <!-- 2.1 添加用户的对话框 -->
    <el-dialog
    title="添加用户"
    :visible.sync="addDialogVisible"
    width="40%"
    @close="addDialogClosed">
      <el-form
        :model="addUserForm"
        ref="addUserFormRef"
        :rules="addUserFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
        <div>
          <el-button type="primary" @click="addUser">确定</el-button>
          <el-button @click="addDialogVisible = false">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- 3.表格 -->
    <el-table :data="userlist">
      <el-table-column type="index" label="#" width="80px"></el-table-column>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <!-- 状态开关 -->
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch
          v-model="scope.row.mg_state"
          @change="userStateChanged(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column label="操作">
        <template slot-scope="scope">
          <div class="btn-box">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              round
              title="修改"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              round
              title="删除"
              @click="removeUserById(scope.row.id)"
            ></el-button>
              <!-- 角色分配设置按钮 -->
              <el-button
                type="info"
                icon="el-icon-setting"
                size="small"
                round
                title="角色分配"
                @click="showSetRole(scope.row)"
              ></el-button>
              </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 3.1 修改用户的对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogClosed"
    >
      <!-- 内容主体 -->
      <el-form
        :model="editUserForm"
        ref="editUserFormRef"
        :rules="editUserFormRules"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
        <el-button type="primary" @click="editUser">确 定</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </el-form>
      
    </el-dialog>
    <!-- 3.2 分配角色对话框 -->
    <el-dialog
    title="分配角色"
    :visible.sync="setRoleDialogVisible"
    width="40%"
    @close="setRoleDialogClosed">
    <p>当前用户:{{ userInfo.username }}</p>
    <p>当前角色:{{ userInfo.role_name }}</p>
    <p>分配角色:
          <el-select
          v-model="selectRoleId"
          placeholder="请选择角色">
              <el-option
              v-for="item in rolesLsit"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
              </el-option>
          </el-select>
      </p>
      <el-button type="primary" @click="saveRoleInfo">确定</el-button>
      <el-button @click="setRoleDialogVisible = false">取消</el-button>
    
    </el-dialog>

    <!-- 4.分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-size="queryInfo.pagesize"
      :page-sizes="[5,10,20,50]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        // 合法邮箱
        return callback()
      }
      callback(new Error("请输入合法邮箱"))
    };
    // 自定义手机号规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      // 返回一个错误提示
      callback(new Error("请输入合法的手机号码"))
    };
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      userlist: [],
      total: 0,
      // 2. 添加用户对话框 默认隐藏
      addDialogVisible: false,
      // 2.1 用户添加表单数据
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 2.2 用户添加表单验证规则
      addUserFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "用户名的长度在2～10个字",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
          {
            min: 6,
            max: 18,
            message: "用户密码的长度在6～18个字",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      // 3.1 修改用户对话框 默认隐藏
      editDialogVisible: false,
      // 修改用户表单数据
      editUserForm: {},
      // 3.2 编辑用户表单验证
      editUserFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      // 分配角色对话框
      setRoleDialogVisible: false,
      // 当前需要被分配角色的用户
      userInfo: {},
      // 所有角色数据列表
      rolesLsit: [],
      // 已选中的角色Id值
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList();
  },
  methods: {
    // 获取列表信息
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败！")
      }
      this.userlist = res.data.users;
      this.total = res.data.total;
      // console.log(res);
    },
    // 2.1 添加用户
    // 在添加用户对话框，点击 确定按钮后执行的方法
    addUser() {
      // 表单预验证
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addUserForm);
        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败")
        }
        this.$message.success("添加用户成功")
        // 添加用户成功后隐藏 添加用户页面
        this.addDialogVisible = false
        // 更新用户列表
        this.getUserList()
      })
    },
    // 关闭对话框后重置 addUserForm数据
    // resetFields() 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
    addDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    // 3.表格方法
    // 3.1 状态 switch开关
    async userStateChanged (userInfo) {
      const {data:res} = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200){
        return this.$message.error('更新用户状态失败')
        userInfo.mg_state = !userInfo.mg_state
      }
      this.$message.success('更新用户状态成功！')
    },

    // 3.2 修改
    // 3.2.1 显示 修改用户对话框 并获取数据
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("users/" + id)
      if (res.meta.status !== 200)return this.$message.error("查询用户信息失败");
      this.editUserForm = res.data
      this.editDialogVisible = true
    },
    // 3.2.2 修改用户信息
    editUser() {
      // 表单预验证
      this.$refs.editUserFormRef.validate(async valid => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        const { data: res } = await this.$http.put(
          "users/" + this.editUserForm.id,
          {
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error("更新用户信息失败！")
        }
        // 隐藏添加用户对话框
        this.editDialogVisible = false
        this.$message.success("更新用户信息成功！")
        this.getUserList()
      })
    },
    // 3.2.3 重置 editUserForm数据
    editDialogClosed() {
      this.$refs.editUserFormRef.resetFields();
    },
    // 3.3 删除用户
    async removeUserById (id) {
        const confirmRes = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
            type: 'warning'
        }
    ).catch(err => err)
    if (confirmRes !=='confirm')return 
    const { data:res } = await this.$http.delete('users/' + id)
    if (res.meta.status !== 200) return this.$message.error('删除用户失败')
    this.$message.success('删除用户成功')
    this.getUserList()
 },
    // 3.4 分配角色
    // 显示分配角色的对话框
    async showSetRole (role) {
        this.userInfo = role
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
        this.rolesLsit = res.data
        this.setRoleDialogVisible = true
    },
    // 分配角色
    async saveRoleInfo () {
        if (!this.selectRoleId)return this.$message.error('请选择要分配的角色')
        const { data:res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectRoleId })
        if (res.meta.status !== 200)return this.$message.error('更新用户角色失败！')
        this.$message.success('更新角色成功!')
        this.getUserList()
        this.setRoleDialogVisible = false
    },
    //  重置 分配角色对话框 数据
    setRoleDialogClosed () {
        this.selectRoleId = ''
        this.userInfo = {}
    },
    
    // 4.分页方法
    // 监听 每页显示条数 改变事件
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
      this.getUserList();
    },
    // 监听 页码值 改变事件
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
      this.getUserList();
    }
  }
};
</script>

<style scoped>
.btn-box {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}
</style>