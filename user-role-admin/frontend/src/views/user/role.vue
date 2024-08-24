<template>
  <div class="dashboard-container">
    <!-- 搜索表单 -->
    <el-form :model="tableData" label-width="80px" :inline="true" size="small">
      <el-form-item label="搜索内容">
        <el-input 
          v-model="tableData.searchContent" 
          placeholder="请输入搜索内容" 
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getRoleList">搜索</el-button>
        <el-button type="warning" icon="el-icon-refresh" size="mini" @click="resetSearch">重置</el-button>
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleCreateRole">新增</el-button>  
      </el-form-item>
    </el-form>

    <!-- 角色列表 -->
    <el-table
      :data="tableData.list"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" width="60"/>
      <!--el-table-column type="selection" width="50"/-->
      <el-table-column prop="name" label="角色名称" sortable="custom"/>
      <el-table-column prop="description" label="角色描述" sortable="custom"/>
      <el-table-column prop="createTime" label="创建时间" sortable="custom">
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" sortable="custom">
        <template slot-scope="scope">
          {{ formatDate(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" icon="el-icon-edit" @click="handleEdit(scope.row)">
            编辑</el-button>
          <el-button type="text" size="small" icon="el-icon-delete" style="color: red;" @click="handleDelete([scope.row.id])">
            删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <el-pagination
      :current-page.sync="tableData.pageNum"
      :page-sizes="[10, 20, 30, 40]"
      :page-size.sync="tableData.pageSize"
      layout="total,sizes,prev,pager,next,jumper"
      :total="tableData.total"
      @size-change="getRoleList"
      @current-change="getRoleList"
    />

    <!-- 新增角色的对话框 -->
    <el-dialog title="新增角色" :visible.sync="createRoleDialogVisible">
      <el-form :model="newRole">
        <el-form-item label="角色名称" label-width="80px">
          <el-input v-model="newRole.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="80px">
          <el-input v-model="newRole.description" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNewRole">确定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible">
      <el-form :model="editRole">
        <el-form-item label="角色名称" label-width="80px">
          <el-input v-model="editRole.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="80px">
          <el-input v-model="editRole.description" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditRole">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import { EventBus } from '@/eventBus'; 
export default {
  name: "Role",
  data() {
    return {
      tableData: {
        searchContent: '',
        list: [],
        selection: [],
        pageNum: 1,
        pageSize: 10,
        total: 0,
        sortProp: '',
        sortOrder: ''
      },
      createRoleDialogVisible: false,
      editRoleDialogVisible: false,
      newRole: {
        name: '',
        description: '',
        createTime: '',
        updateTime: ''
      },
      editRole: {
        id: null,
        name: '',
        description: '',
        createTime: '',
        updateTime: ''
      }
    };
  },
  methods: {
    formatDate(value) {
      if (!value) return '';
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    async getRoleList() {
      try {
        const response = await axios.get('/api/roles', {
          params: {
            name: this.tableData.searchContent,
            pageNum: this.tableData.pageNum,
            pageSize: this.tableData.pageSize
          }
        });
        this.tableData.list = response.data.list;
        this.tableData.total = response.data.total;
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        this.$message.error('获取角色列表失败');
      }
    },
    handleCreateRole() {
      this.createRoleDialogVisible = true;
      this.newRole = {
        name: '',
        description: ''
      };
    },
    async submitNewRole() {
      if (!this.newRole.name || !this.newRole.description) {
        this.$message.error('角色名称和描述不能为空');
        return;
      }
      try {
        const response = await axios.post('/api/roles', this.newRole);
        this.tableData.list.push(response.data);
        this.tableData.total += 1;
        this.createRoleDialogVisible = false;
        this.$message.success('新增角色成功');
        // 触发事件通知用户页面更新角色列表
        EventBus.$emit('roleUpdated');
        this.getRoleList();  // 编辑成功后，刷新角色列表
      } catch (error) {
        console.error('Failed to create role:', error);
        this.$message.error('新增角色失败');
      }
    },
    handleEdit(row) {
      this.editRole = { ...row };
      this.editRoleDialogVisible = true;
    },
    async submitEditRole() {
      if (!this.editRole.name || !this.editRole.description) {
        this.$message.error('角色名称和描述不能为空');
        return;
      }

      try {
        const response = await axios.put(`/api/roles/${this.editRole.id}`, this.editRole);
        const updatedRole = response.data; // 获取后端返回的最新数据
        const index = this.tableData.list.findIndex(role => role.id === updatedRole.id);
        if (index !== -1) {
          this.tableData.list.splice(index, 1, { ...updatedRole });
        }

        this.editRoleDialogVisible = false;
        this.$message.success('角色编辑成功');
        // 触发事件通知用户页面更新角色列表
        EventBus.$emit('roleUpdated');
      } catch (error) {
      console.error('Failed to edit role:', error);
      this.$message.error('编辑角色失败');
      }
    },
    async handleDelete(ids) {
      try {
        await Promise.all(ids.map(id => axios.delete(`/api/roles/${id}`)));
        this.getRoleList(); // 刷新列表
        this.$message.success('删除成功');
        // 触发事件通知用户页面更新角色列表
        EventBus.$emit('roleUpdated');
      } catch (error) {
        console.error('Failed to delete roles:', error);
        this.$message.error('删除角色失败');
      }
    },
    handleSortChange({ prop, order }) {
      this.tableData.sortProp = prop;
      this.tableData.sortOrder = order;

      // 根据排序规则更新角色列表
      this.getRoleList();
    },
    handleSelectionChange(selection) {
      this.tableData.selection = selection;
    },
    resetSearch() {
      this.tableData.searchContent = ''; // 清空搜索内容
      this.getRoleList(); // 重新加载角色列表，回到初始状态
    },
  },
  mounted() {
    this.getRoleList(); // 页面加载时获取角色列表数据
  }
};
</script>