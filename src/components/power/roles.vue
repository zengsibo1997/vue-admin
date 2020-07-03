<template>
  <div>
    <!-- 面包屑 -->
    <my-bread level1="权限管理" level2="角色列表"></my-bread>
    <!-- 添加角色按钮 -->
    <el-row>
      <el-col :span="2">
        <el-button type="primary" @click="AddRoleDialogVisible=true">添加角色</el-button>
      </el-col>
    </el-row>
    <!-- 角色列表 -->
    <el-table :data="rolesList">
      <!-- 1.展开列 -->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <!-- 循环显示 当前角色的所有一级权限行 -->
          <!-- n行两列(行数 = 角色一级权限数) -->
            <el-row
            :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            v-for="(item1, i1) in scope.row.children"
            :key="item1.id">
            <!-- 第一列 -->
            <el-col :span="3">
              <el-tag
                closable
                @close="removeRightById(scope.row, item1.id)"
                >
                {{ item1.authName }}
              </el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 第二列 -->
            <el-col :span="21">
              <!-- 循环显示 二级权限行 -->
              <!-- n行两列(行数 = 二级权限数)-->
              <el-row
                :class="[i2 == 0 ? '' : 'bdtop', 'vcenter']"
                v-for="(item2, i2) in item1.children"
                :key="item2.id">
                <!-- 每行的二级权限 -->
                <el-col :span="4">
                  <el-tag
                    type="success"
                    closable
                    @close="removeRightById(scope.row, item2.id)">
                        {{ item2.authName }}
                  </el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 对应二级权限的所有三级权限 -->
                <el-col :span="17">
                  <!-- 三级权限在当前二级权限行，直接循环显示所有三级标签 -->
                  <el-tag
                    type="danger"
                    v-for="item3 in item2.children"
                    :key="item3.id"
                    closable
                    @close="removeRightById(scope.row, item3.id)"
                  >{{ item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- 2.索引列 -->
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
            <el-button round type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row.id)" title="编辑"></el-button>
            <el-button round type="danger" icon="el-icon-delete" size="small" @click="removeRoleById(scope.row.id)" title="删除"></el-button>
            <el-button
              round
              type="info"
              icon="el-icon-setting"
              size="small"
              title="分配权限"
              @click="showSetRightDialog(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 默认隐藏的对话框 -->
    <!-- 1.添加角色对话框 -->
    <el-dialog
    title="添加角色"
    :visible.sync="AddRoleDialogVisible"
    width="40%"
    @close="addRoleDialogClosed">
        <el-form
        :model="addRoleForm"
        ref="addRoleFormRef"
        :rules="addRoleFormRules"
        label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="addRoleForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="addRoleForm.roleDesc" @keyup.enter.native="addRoles"></el-input>
            </el-form-item>
        </el-form>
        <el-button type="primary" @click="addRoles">确 定</el-button>
        <el-button @click="AddRoleDialogVisible = false">取 消</el-button>
    </el-dialog>
    <!-- 2.编辑角色对话框 -->
    <el-dialog
    title="编辑角色"
    :visible.sync="editRoleDialogVisible"
    @close="editRoleDialogClosed"
    width="40%">
        <el-form
        :model="editRoleForm"
        ref="editRoleFormRef"
        :rules="editRoleFormRules"
        label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName" @keyup.enter.native="editRoles"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc" @keyup.enter.native="editRoles"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="editRoles">确 定</el-button>
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
    </el-dialog>
    <!-- 3.分配权限对话框 -->
    <el-dialog
    title="分配权限"
    :visible.sync="setRightDialogVisible"
    width="40%"
    @close="setRightDialogClosed">
      <el-tree
      :data="rightsList"
      :props="treeProps"
      ref="treeRef"
      show-checkbox
      node-key="id"
      default-expand-all
      :default-expanded-keys="defKeys">
      </el-tree>
      <el-button type="primary" @click="allotRights">确 定</el-button>
      <el-button @click="setRightDialogVisible = false">取 消</el-button>
    </el-dialog>
</div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表
      rolesList: [],
      // 分配权限框
      setRightDialogVisible: false,
      // 权限列表
      rightsList: [],
      //  树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      //   默认选中节点ID值
      defKeys: [],
      //   添加用户对话框
      AddRoleDialogVisible: false,
      // 添加角色表单
      addRoleForm: {},
      //   添加角色表单验证
      addRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      },
      //   编辑角色信息
      editRoleForm: {},
      editRoleDialogVisible: false,
      editRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      },
      // 当前即将分配权限的Id
      roleId: 0
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles")
      if (res.meta.status !== 200)return this.$message.error("获取角色列表失败！")
      this.rolesList = res.data
      // console.log(res)
    },
    // 添加角色
    addRoles () {
        this.$refs.addRoleFormRef.validate(async valid => {
            if(!valid)return
            const {data:res} = await this.$http.post('roles',this.addRoleForm)
            if(res.meta.status !== 201){
                this.$message.error('添加角色失败！')
            }
            this.$message.success('添加角色成功！')
            this.AddRoleDialogVisible = false
            this.getRolesList()
        })
    },
    // 通过递归 获取角色下三级权限的 id, 并保存到defKeys数组
    getLeafkeys (node, arr) {
        if(!node.children) {
            return arr.push(node.id)
        }
        node.children.forEach(item => this.getLeafkeys(item,arr))
    },
    // 在展开列 删除所点击的角色的对应权限 role 对应角色 rightId 对应权限
    async removeRightById (role,rightId){
        const confirmResult = await this.$confirm(
            '此操作将删除该权限',
            '提示',
            {confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'}
        ).catch(err => err)
        // 点击确定 返回值为：confirm
        // 点击取消 返回值为： cancel
        if(confirmResult !== 'confirm') return
        const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status !== 200)return this.$message.error('删除权限失败！')
        this.$message.success('删除权限成功！')
        this.rolesList = res.data
        this.getRolesList()
    },
    // 显示 编辑角色对话框
    async showEditDialog (id) {
        const {data:res} = await this.$http.get('roles/' + id)
        if(res.meta.status !== 200)return this.$message.error('查询角色信息失败！')
        this.editRoleForm = res.data
        this.editRoleDialogVisible = true
    },
    // 编辑角色
    editRoles () {
        this.$refs.editRoleFormRef.validate(async valid => {
            if(!valid)return
            const {data:res} = await this.$http.put('roles/'+this.editRoleForm.roleId,
            {
                roleName:this.editRoleForm.roleName,
                roleDesc:this.editRoleForm.roleDesc
            })
            if(res.meta.status !== 200) {
                this.$message.error('更新角色信息失败！')
            }
            this.editRoleDialogVisible = false
            this.$message.success('更新角色信息成功！')
            this.getRolesList()
        })
    },
    // 删除角色
    async removeRoleById (id) {
        const confirmResult = await this.$confirm(
            '此操作将永久删除该角色, 是否继续?',
            '提示',
            {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }
        ).catch(error => error)
        if(confirmResult !== 'confirm'){
            return this.$message.info('已取消删除')
        }
        const {data:res} = await this.$http.delete('roles/' +id)
        if(res.meta.status !==200)return this.$message.error('删除角色失败！')
        this.$message.success('删除用户成功！')
        this.getRolesList()
    },
    // 显示 分配权限对话框 
    async showSetRightDialog (role) {
        this.roleId = role.id
        const {data:res} = await this.$http.get('rights/tree')
        if(res.meta.status !==200){
            return this.$message.error('获取权限数据失败!')
        }
        this.rightsList = res.data
        this.getLeafkeys(role,this.defKeys)
        this.setRightDialogVisible = true
    },
    // 分配权限
    async allotRights (roleId) {
        const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,
        {rids:idStr})
        if(res.meta.status !== 200)return this.$message.error('分配权限失败！')
        this.$message.success('分配权限成功!')
        this.getRolesList()
        this.setRightDialogVisible = false
    },
    // 关闭事件
    // 添加角色对话框
    addRoleDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
     // 编辑角色对话框
    editRoleDialogClosed () {
      this.editRoleForm = {}
    },
    // 权限对话框
    setRightDialogClosed () {
      this.rightsList = []
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}

</style>