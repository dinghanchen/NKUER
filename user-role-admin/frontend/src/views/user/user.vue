<template>
  <div class="dashboard-container">
    <!-- 搜索表单 -->
    <el-form :model="tableData" label-width="80px" inline size="small">
      <el-form-item label="用户名称">
        <el-input v-model="tableData.name" placeholder="请输入用户名称" clearable />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="tableData.minCreateTime" type="datetime" placeholder="起始时间" class="date-picker" />
        <el-date-picker v-model="tableData.maxCreateTime" type="datetime" placeholder="截止时间" class="date-picker" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getUserList">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 用户操作按钮 -->
    <div>
      <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleCreateUser">新增</el-button>
      <el-button type="danger" plain icon="el-icon-delete" size="mini" @click="handleBatchDelete">删除</el-button>
      <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="handleImportUser">导入</el-button>
    </div>

    <!-- 用户列表 -->
    <el-table :data="tableData.list" @selection-change="val => tableData.selection = val" @sort-change="handleSortChange">
      <el-table-column type="index" width="60" />
      <el-table-column type="selection" width="50" />
      <el-table-column label="头像">
        <template slot-scope="scope">
          <img :id="'avatar-'+scope.row.id" class="table-avatar" :src="scope.row.avatarUrl" />
        </template>
      </el-table-column>
      <el-table-column prop="userName" label="用户名" sortable="custom" />
      <el-table-column prop="trueName" label="真实姓名" sortable="custom" />
      <el-table-column label="角色" prop="role.name" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.role ? scope.row.role.name : '未分配角色' }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" sortable="custom">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="是否激活" sortable="custom" width="100">
        <template slot-scope="scope">
          <el-switch :value="scope.row.status" :active-value="1" :inactive-value="0" @change="handleSwitch(scope.row, val)" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" size="small" icon="el-icon-delete" style="color: red;" @click="handleDelete([scope.row.id])">删除</el-button>
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
      @size-change="getUserList"
      @current-change="getUserList"
    />

    <!-- 用户编辑/创建窗口 -->
    <el-dialog class="user-edit-dialog" :title="userEditForm.id ? '编辑用户':'新增用户'" :visible.sync="userEditDialogVisible" width="50%" top="8vh">
      <el-form ref="userEditForm" status-icon :model="userEditForm" label-width="80px" :rules="userEditForm.id ? userUpdateRules : userCreateRules">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="userEditForm.userName" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="userEditForm.trueName" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userEditForm.password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userEditForm.email" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="userEditForm.gender">
            <el-radio :label="0">男</el-radio>
            <el-radio :label="1">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="userEditForm.address" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="userEditForm.introduction" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="userEditForm.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="role.id">
          <el-select v-model="userEditForm.role.id" placeholder="请选择角色">
            <el-option v-for="role in allRoles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8081/api/users/upload-avatar"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="userEditForm.avatarUrl" :src="userEditForm.avatarUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addOrUpdateUser">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 设置 axios 基础 URL
import axios from 'axios';
import { EventBus } from '@/eventBus'; 
axios.defaults.baseURL = 'http://localhost:8081'; // 根据你的后端端口配置

export default {
  name: 'User',
  data() {
    return {
      tableData: {
        name: '',
        minCreateTime: '',
        maxCreateTime: '',
        list: [],
        selection: [],
        pageNum: 1,
        pageSize: 10,
        total: 0,
      },
      userEditForm: {
        id: '',
        userName: '',
        trueName: '',
        password: '',
        email: '',
        gender: '',
        address: '',
        introduction: '',
        phone: '',
        role: {
          id:'',
          name:''
        },
        avatarUrl: '', // 头像 URL
      },
      userCreateRules: {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
        ]
        // 其他验证规则
      },
      userEditDialogVisible: false,
      allRoles: [], // 存储所有角色
    };
  },
  methods: {
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-'); // 将默认的斜线替换为短横线
    },
    // 获取角色列表的方法
    async getAllRoles() {
      try {
        const response = await axios.get('/api/roles/all');
        this.allRoles = response.data;
        console.log('已获取的角色:', this.allRoles);
      } catch (error) {
        console.error('Error fetching roles:', error);
        this.$message.error('获取角色列表失败');
      }
    },
    // 获取用户列表
    getUserList() {
      const params = {
        name: this.tableData.name,
        minCreateTime: this.tableData.minCreateTime ? new Date(this.tableData.minCreateTime).toISOString().slice(0, 19) : null,
        maxCreateTime: this.tableData.maxCreateTime ? new Date(this.tableData.maxCreateTime).toISOString().slice(0, 19) : null,
        pageNum: this.tableData.pageNum,
        pageSize: this.tableData.pageSize,
      };

      axios.get('/api/users', { params })
        .then(response => {
          const { list, total } = response.data;
          this.tableData.list = list;
          this.tableData.total = total;
        })
        .catch(error => {
          console.error('Error fetching user list:', error);
          this.$message.error('获取用户列表失败');
        });
    },

    // 处理新增用户
    handleCreateUser() {
      this.userEditForm = {
        id: '',
        userName: '',
        trueName: '',
        password: '',
        email: '',
        gender: '',
        address: '',
        introduction: '',
        phone: '',
        role: {
          id:'',
          name:''
        },
        avatarUrl: '',
      };
      this.userEditDialogVisible = true;
    },

    // 处理编辑用户
    handleEdit(row) {
      this.userEditForm = { ...row };
      this.userEditDialogVisible = true;
      // 检查role是否为null，如果是，初始化为空对象
      if (!this.userEditForm.role) {
        this.userEditForm.role = { id: '', name: '未设置角色' };
      }
    },

    // 新增或编辑用户
    addOrUpdateUser() {
      if (!this.userEditForm.userName || !this.userEditForm.password) {
        this.$message.error('用户名和密码不能为空');
        return;
      }
      // 添加角色校验
      if (!this.userEditForm.role) {
        this.$message.error('请选择一个角色');
        return;
      }
      // 如果是新增用户，设置创建时间
      if (!this.userEditForm.id) {
        this.userEditForm.createdAt = new Date().toISOString(); // 赋值当前时间
      }
      console.log('即将发送的数据:', this.userEditForm);

      const userData = {
        ...this.userEditForm
      };

      const request = userData.id
        ? axios.put(`/api/users/${userData.id}`, userData)
        : axios.post('/api/users', userData);
      // const request = this.userEditForm.id
        // ? axios.put(`/api/users/${this.userEditForm.id}`, this.userEditForm)
        // : axios.post('/api/users', this.userEditForm);

      request.then(response => {
        this.$message.success(this.userEditForm.id ? '用户编辑成功' : '新增用户成功');
        this.getUserList(); // 刷新列表
        this.userEditDialogVisible = false;
      }).catch(error => {
        console.error('Error saving user:', error);
        this.$message.error(this.userEditForm.id ? '用户编辑失败' : '新增用户失败');
      });
    },

    // 处理删除用户
    handleDelete(ids) {
      if (!ids || ids.length === 0) {
        this.$message.error('请选择要删除的用户');
        return;
      }

      this.$confirm('确定删除选中的用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        axios.delete('/api/users',{data: ids})
          .then(response => {
            this.$message.success('删除用户成功');
            this.getUserList(); // 刷新列表
          })
          .catch(error => {
            console.error('Error deleting user:', error);
            this.$message.error('删除用户失败');
          });
      });
    },

    // 处理批量删除用户
    handleBatchDelete() {
      const ids = this.tableData.selection.map(user => user.id);
      this.handleDelete(ids);
    },

    // 处理导入用户
    handleImportUser() {
      // TODO: 实现用户导入功能
      this.$message.warning('导入用户功能待实现');
    },

    // 处理排序变化
    handleSortChange({ prop, order }) {
      // TODO: 处理表格排序
      console.log(`属性 ${prop} 的排序方式变为 ${order}`);
    },

    // 处理开关切换
    handleSwitch(row) {
      const newStatus = row.status ? 0 : 1; // 切换状态
      axios.patch(`/api/users/${row.id}`, { status: newStatus })
        .then(response => {
          this.$message.success('状态更新成功');
          this.getUserList(); // 刷新列表
        })
        .catch(error => {
          console.error('Error updating status:', error);
          this.$message.error('状态更新失败');
        });
    },

    // 处理头像上传成功
    handleAvatarSuccess(response, file) {
      // 将文件转换为Base64编码
      const reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.onload = () => {
        this.userEditForm.avatarUrl = reader.result; // 直接将Base64字符串赋值给avatarUrl
        console.log('Base64 encoded image:', this.userEditForm.avatarUrl);
      };
      // TODO: 上传头像成功后，更新用户信息
      console.log('上传头像成功:', response);
    },

    // 处理头像上传前的校验
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG && !isPNG) {
        this.$message.error('头像图片只能是 JPG 或 PNG 格式');
      }
      if (!isLt2M) {
        this.$message.error('头像图片大小不能超过 2MB');
      }
      return isJPG || isPNG && isLt2M;
    },

    // 重置查询条件
    resetQuery() {
      this.tableData.name = '';
      this.tableData.minCreateTime = '';
      this.tableData.maxCreateTime = '';
      this.getUserList();
    },
  },
  created() {
    this.getUserList(); // 初始化获取用户列表
    this.getAllRoles(); // 获取所有角色
    // 监听角色更新事件，更新角色列表和用户列表
    EventBus.$on('roleUpdated', () => {
      this.getAllRoles();
      this.getUserList();
    });
  },
  beforeDestroy() {
    // 组件销毁前移除监听
    EventBus.$off('roleUpdated', () => {
      this.getAllRoles();
      this.getUserList();
    });
  },
  activated() {
    this.getAllRoles();
    this.getUserList();
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.date-picker {
  width: 160px;
}
.table-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.user-edit-dialog {
  overflow: auto;
}
.avatar-uploader {
  display: inline-block;
  text-align: center;
}
.avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  line-height: 120px;
}
</style>