<template>
  <div>
    <!-- 1.面包屑 -->
    <my-bread level1='商品管理' level2='商品列表'></my-bread>
    <!-- 2.搜索 -->
    <el-row>
      <el-col :span="6">
        <el-input
        placeholder="请输入内容"
        v-model="queryInfo.query"
        clearable
        @clear="getGoodsList"
        @keyup.enter.native="getGoodsList">
          <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
        </el-input>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="addDialogVisible = true">添加商品</el-button>
      </el-col>
    </el-row>
    
    <!-- 3.表格 -->
    <el-table :data="goodsList">
      <el-table-column type="index" label="#" width="80px"></el-table-column>
      <el-table-column prop="goods_name" label="商品名称"></el-table-column>
      <el-table-column prop="goods_price" label="商品价格(元)"></el-table-column>
      <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
      <el-table-column prop="goods_number" label="商品数量"></el-table-column>
      <el-table-column prop="add_time" label="创建时间"></el-table-column>
      <!-- 操作 -->
      <el-table-column label="操作">
        <template slot-scope="scope">
          <div class="btn-box">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              round
              title="修改"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              round
              title="删除"
              @click="removeUserById(scope.row.id)"
            ></el-button>
              <!-- 角色分配 -->
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
    <!-- 4.分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-size="queryInfo.pagesize"
      :page-sizes="[10,20,30,50]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
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
        <el-form-item label=" " prop="username">
          <el-input v-model="addUserForm.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label=" " prop="password">
          <el-input v-model="addUserForm.password" placeholder="密码" type="password"></el-input>
        </el-form-item>
        <el-form-item label=" " prop="email">
          <el-input v-model="addUserForm.email" placeholder="邮箱"></el-input>
        </el-form-item>
        <el-form-item label=" " prop="mobile">
          <el-input v-model="addUserForm.mobile" placeholder="手机"></el-input>
        </el-form-item>
        <div>
          <el-button type="primary" @click="addUser">确定</el-button>
          <el-button @click="addDialogVisible = false">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- 3.1 修改用户的对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogClosed">
      <el-form
        :model="editUserForm"
        ref="editUserFormRef"
        :rules="editUserFormRules"
        label-width="70px">
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
    }
    return {
      // goods_id	商品 ID	
      // goods_name	商品名称	
      // goods_price	价格
      // goods_weight	重量	不能为空
      // goods_number	数量	
      // add_time	添加时间	
      // upd_time	更新时间
      // goods_state	商品状态	商品状态 0: 未通过 1: 审核中 2: 已审核
      // hot_mumber	热销品数量	
      // is_promote	是否是热销品
      goodsList: [],
      // 用户添加表单数据
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
       // 修改用户表单数据
      editUserForm: {},
      // 当前需要被分配角色的用户
      userInfo: {},
      // 所有角色数据列表
      rolesLsit: [],
      // 已选中的角色Id值
      selectRoleId: '',
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      // 添加用户对话框
      addDialogVisible: false,
      // 修改用户对话框
      editDialogVisible: false,
      // 分配角色对话框
      setRoleDialogVisible: false,
      // 用户添加表单验证规则
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
      // 编辑用户表单验证
      editUserFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      }
    }
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败！")
      }
      console.log(res)
      this.goodsList = res.data.goods
      console.log(this.goodsList)
      this.total = res.data.total
      console.log(this.total)
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
        this.getGoodsList()
      })
    },
    // 关闭对话框后重置 addUserForm数据
    // resetFields() 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
    addDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    // 3.2 修改
    // 3.2.1 显示 修改用户对话框 并获取数据
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`goods/`+id)
      if (res.meta.status !== 200)return this.$message.error("查询商品信息失败")
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
        this.getGoodsList()
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
    this.getGoodsList()
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
        this.getGoodsList()
        this.setRoleDialogVisible = false
    },
    //  重置 分配角色对话框 数据
    setRoleDialogClosed () {
        this.selectRoleId = ''
        this.userInfo = {}
    },
    
    // 分页方法
    // 监听 每页显示条数 改变事件
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getGoodsList()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getGoodsList()
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