<template>
  <div>
    <!-- 面包屑 -->
    <my-bread level1='权限管理' level2='权限列表'></my-bread>
    <!-- 2.表格视图 -->
    <el-table :data="rightsList">
        <el-table-column type="index" label="#" width="80px"></el-table-column>
        <el-table-column label="权限名称" prop="authName" :span='3'></el-table-column>
        <el-table-column label="路径" prop="path" :span='3'></el-table-column>
        <el-table-column label="权限等级" prop="level" :span=3>
            <template slot-scope="scope">
                <el-tag
                v-if="scope.row.level === '0'">一级</el-tag>
                <el-tag
                v-else-if="scope.row.level === '1'"
                type="success">二级</el-tag>
                <el-tag
                v-else
                type="danger">三级</el-tag>
            </template>
        </el-table-column>
    </el-table>
  </div> 
</template>

<script>
export default {
    data () {
        return {
            rightsList:[],
        }
    },
    created () {
        this.getRightsList()
    },
    methods: {
        async getRightsList () {
            const { data:res } = await this.$http.get('rights/list')
            if(res.meta.status !== 200)return this.$message.error('获取权限列表失败！')
            this.rightsList = res.data
            // console.log(res)
        }
    }
}
</script>

<style scoped>

</style>