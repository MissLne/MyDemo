<template>
     <div>
          <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>用户管理</el-breadcrumb-item>
              <el-breadcrumb-item>用户列表</el-breadcrumb-item>
          </el-breadcrumb>

          <el-card>
               <el-row :gutter="20">

                    <el-col :span="7">
                         <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                         </el-input>
                    </el-col>
                    <el-col :span="4">
                         <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                    </el-col>
               </el-row>
               <el-table :data="userList" border stripe>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column label="姓名" prop="username"></el-table-column>
                    <el-table-column label="邮箱" prop="email"></el-table-column>
                    <el-table-column label="电话" prop="mobile"></el-table-column>
                    <el-table-column label="角色" prop="role_name"></el-table-column>
                    <el-table-column label="状态">
                         <template slot-scope="scope">
                              <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
                              </el-switch>
                         </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180px">
                         <template slot-scope="scope">
                              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUsersById(scope.row.id)"></el-button>
                              <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                                   <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
                              </el-tooltip> 
                         </template>
                    </el-table-column>
               </el-table>
               <el-pagination
               @size-change="handleSizeChange"
               @current-change="handleCurrentChange"
               :current-page="queryInfo.pagenum"
               :page-sizes="[1, 2, 5, 10]"
               :page-size="queryInfo.pagesize"
               layout="total, sizes, prev, pager, next, jumper"
               :total="total">
               </el-pagination>
          </el-card>
          <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
               <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                  <el-form-item label="用户名" prop="username">
                      <el-input v-model="addForm.username"></el-input>
                  </el-form-item>
                  <el-form-item label="密码" prop="password">
                      <el-input v-model="addForm.password"></el-input>
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                      <el-input v-model="addForm.email"></el-input>
                  </el-form-item>
                  <el-form-item label="手机" prop="mobile">
                      <el-input v-model="addForm.mobile"></el-input>
                  </el-form-item>
               </el-form>
                  <span slot="footer" class="dialog-footer">
                  <el-button @click="addDialogVisible = false">取 消</el-button>
                  <el-button type="primary" @click="addUser">确 定</el-button>
              </span>
          </el-dialog>

          <el-dialog
          title="修改用户"
          :visible.sync="editDialogVisible"
          width="50%" @close="editDialogClose">
               <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                   <el-form-item label="用户名">
                        <el-input v-model="editForm.username" disabled></el-input>
                   </el-form-item>
                   <el-form-item label="邮箱" prop="email">
                        <el-input v-model="editForm.email"></el-input>
                   </el-form-item>
                   <el-form-item label="手机" prop="mobile">
                        <el-input v-model="editForm.mobile"></el-input>
                   </el-form-item>
               </el-form>
               
                   
               <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editUserInfo">确 定</el-button>
               </span>
          </el-dialog>
          
          <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
               <div>
                    <p>当前的用户：{{userInfo.username}}</p>
                    <p>当前的角色：{{userInfo.role_name}}</p>
                    <p>分配新角色：
                         <el-select v-model="selectRoleId" placeholder="请选择">
                              <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
                              </el-option>
                         </el-select>
                    </p>

               </div>
               <span slot="footer" class="dialog-footer">
                    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
               </span>
          </el-dialog>
     </div>
</template>
<script>
export default {
     data() {
          var checkEmail = (rule,value,cb) => {
               const regEmail = /^([a-zA-z0-9_-])+@([a-zA-z0-9_-])+(\.[a-zA-z0-9_-])+/

               if(regEmail.test(value)) return cb();
               cb(new Error('请输入合法邮箱'))
          }
          var checkMobile = (rule,value,cb) => {
               const regMobile = /(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

               if(regMobile.test(value)) return cb();
               cb(new Error('请输入合法手机号'))
          }
          return {
              queryInfo: {
                   query:'',
                   pagenum:1,
                   pagesize:2
              },
              userList: [],
              total:0,
              addDialogVisible:false,
              addForm: {
                   username:'',
                   password:'',
                   email:'',
                   mobile:''
              },
              addFormRules: {
               username: [
                   { required: true, message: '请输入用户名', trigger: 'blur' },
                   { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
              ],
               password: [
                    { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
                ],
               email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { min: 3, max: 30, message: '长度在 3 个字符以上', trigger: 'blur' },
                    { validator:checkEmail,trigger: 'blur' }
                ],
               mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { min: 3, max: 15, message: '长度为 11 个字符', trigger: 'blur' },
                    { validator:checkMobile,trigger: 'blur' }
                ]
              },
              editDialogVisible: false,
          //     查询到的用户信息对象
              editForm: {},
              editFormRules: {
                   email: [
                    { required: true, message: '请输入用户邮箱', trigger: 'blur' },
                    { validator: checkEmail,trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入用户手机号', trigger: 'blur' },
                    { validator: checkMobile,trigger: 'blur' }
                ]
              },
              setRoleDialogVisible:false,
              userInfo: {},
              rolesList: [],
              selectRoleId: ''
          }
     },
     created() {
          this.getUserList()
     },
     methods: {
          async getUserList() {
               const { data: result } = await this.$http.get('users',{params: this.queryInfo })
               console.log(result);
               if(result.meta.status !== 200) return this.$message.error('获取用户列表失败！');
               this.userList = result.data.users;
               this.total = result.data.total;
          },
          handleSizeChange(newSize) {
               this.queryInfo.pagesize = newSize;
               this.getUserList();
          },
          handleCurrentChange(newPage) {
               this.queryInfo.pagenum = newPage;
               this.getUserList();
          },
          async userStateChange(userInfo) {
               console.log(userInfo)
               const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
               if(res.meta.status !== 200) {
                    userInfo.mg_state = !userInfo.mg_state;
                    return this.$message.error('更新用户状态失败！');
               }
               this.$message.success('更新用户状态成功！');
          },
          addDialogClosed() {
               this.$refs.addFormRef.resetFields();
          },
          addUser() {
               this.$refs.addFormRef.validate(async valid => {
                     if(!valid) return
                     const {data:result} = await this.$http.post('users',this.addForm);
                     if(result.meta.status !== 201) {
                         return this.$message.error('添加用户失败！');
                     }
                     this.$message.success('添加用户成功！');
                     this.addDialogVisible = false;
                     this.getUserList();
               })
          },
          async showEditDialog(id) {
               const {data: result} = await this.$http.get('users/' + id);
               if(result.meta.status !== 200) {
                    return this.$message.error('查询用户信息失败！');
               }
               this.editForm = result.data;
               this.editDialogVisible = true;
          },
          editDialogClose() {
               this.$refs.editFormRef.resetFields();
          },
          editUserInfo() {
               this.$refs.editFormRef.validate(async valid => {
                    if(!valid) return;
                    const {data: result} = await this.$http.put('users/' + this.editForm.id,{email: 
                    this.editForm.email,mobile: this.editForm.mobile
                    })

                    if(result.meta.status !== 200){
                         return this.$message.error('更新用户信息失败！');
                    }
                    this.editDialogVisible = false;
                    this.getUserList();
                    this.$message.success('更新用户信息成功');
               })
          },
          async removeUsersById(id) {
               const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
               confirmButtonText: '确定',
               cancelButtonText: '取消',
               type: 'warning'
               }).catch(err => err)
               console.log(confirmResult);
               if(confirmResult !== 'confirm') {
                    return this.$message.info('已取消删除');
               }
               const {data: result} = await this.$http.delete('users/' + id);
               if(result.meta.status !== 200) {
                    return this.$message.error('删除用户失败！');
               }
               this.$message.success('删除用户成功！');
               this.getUserList();
          },
          async setRole(userInfo) {
               this.userInfo = userInfo;
               const {data: result} = await this.$http.get('roles');

               if(result.meta.status !== 200) {
                    return this.$message.error('获取角色列表失败！');
               }
               this.rolesList = result.data;
               this.setRoleDialogVisible = true;

          },
          async saveRoleInfo() {
               if(!this.selectRoleId) {
                    return this.$message.error('请选择要分配的角色！');
               }
               console.log(this.userInfo.id);
               const {data: result} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid: this.selectRoleId});
               console.log(result);
               if(result.meta.status !== 200) {
                    return this.$message.error('更新角色失败！');
               }
               this.$message.success('更新角色成功！');
               this.getUserList();
               this.setRoleDialogVisible = false;
          },
          setRoleDialogClosed() {
               this.selectRoleId = '';
               this.userInfo = {};
          }
     }
}
</script>
<style lang="less" scoped>

</style>