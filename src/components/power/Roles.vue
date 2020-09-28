<template>
     <div>
          <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>权限管理</el-breadcrumb-item>
              <el-breadcrumb-item>角色列表</el-breadcrumb-item>
          </el-breadcrumb>

          <el-card>
               <el-row>
                    <el-col>
                         <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                    </el-col>
               </el-row>
               <el-table :data="roleList" border stripe>
                    <el-table-column type="expand">
                         <template slot-scope="scope">
                              <el-row :class="['bdbottom',i1 === 0? 'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                                   <el-col :span="5">
                                        <el-tag>
                                             {{item1.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                   </el-col>
                                   <el-col :span="19">
                                        <el-row :class="[i2 === 0? '' : 'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                             <el-col :span="6">
                                                  <el-tag type="success">{{item2.authName}}</el-tag>
                                                  <i class="el-icon-caret-right"></i>
                                             </el-col>
                                             <el-col :span="18">
                                                  <el-tag closable type="warning" v-for="(item3,i3) in item2.children" :key="item3.id" @close="removeRightById(scope.row,item3.id)">
                                                       {{item3.authName}}
                                                  </el-tag>
                                             </el-col>
                                        </el-row>
                                   </el-col>
                              </el-row>
                              <!-- <pre>
                                   {{scope.row}}
                              </pre> -->
                         </template>
                    </el-table-column>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="角色名称" prop="roleName"></el-table-column>
                    <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                    <el-table-column label="操作" width="300px">
                         <template slot-scope="scope">
                              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUsersById(scope.row.id)">删除</el-button>
                              <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                         </template>
                    </el-table-column>
               </el-table>
          </el-card>

          <el-dialog title="分配权限" :visible.sync="SetRightDialogVisible" width="50%">
               <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-expanded-keys="defKeys" @close="SetRightDialogCloesd" ref="treeRef"></el-tree>
               <span slot="footer" class="dialog-footer">
                   <el-button @click="SetRightDialogVisible = false">取 消</el-button>
                   <el-button type="primary" @click="allotRights">确 定</el-button>
               </span>
          </el-dialog>

          <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
               <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                  <el-form-item label="角色名称" prop="roleName">
                      <el-input v-model="addForm.roleName"></el-input>
                  </el-form-item>
                  <el-form-item label="角色描述" prop="roleDesc">
                      <el-input v-model="addForm.roleDesc"></el-input>
                  </el-form-item>
               </el-form>
                  <span slot="footer" class="dialog-footer">
                  <el-button @click="addDialogVisible = false">取 消</el-button>
                  <el-button type="primary" @click="addRoles">确 定</el-button>
              </span>
          </el-dialog>

          <el-dialog
          title="修改角色"
          :visible.sync="editDialogVisible"
          width="50%" @close="editDialogClose">
               <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                   <el-form-item label="角色名称">
                        <el-input v-model="editForm.roleName" disabled></el-input>
                   </el-form-item>
                   <el-form-item label="角色描述" prop="email">
                        <el-input v-model="editForm.roleDesc"></el-input>
                   </el-form-item>
               </el-form>
               
                   
               <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editUserInfo">确 定</el-button>
               </span>
          </el-dialog>
     </div>
</template>


<script>
export default {
     data() {
          return {
               roleList: [],
               SetRightDialogVisible: false,
               rightsList: [],
               treeProps: {
                    label: 'authName',
                    children: 'children'
               },
               defKeys: [104,115],
               roleId: '',
               addForm: {
                   roleName:'',
                   roleDesc:''
              },
              addDialogVisible:false,
              addFormRules: {
               roleName: [
                   { required: true, message: '请输入角色名', trigger: 'blur' }
              ]
              },
              editForm: {},
              editFormRules: {
               roleName: [
                   { required: true, message: '请输入角色名', trigger: 'blur' }
              ]
              },
              editDialogVisible: false
               

          }
     },
     created() {
          this.getRolesList();
     },
     methods: {
          async getRolesList() {
               const {data: result} = await this.$http.get('roles');
               if(result.meta.status !== 200) {
                    return this.$message.error('获取角色列表失败！');
               }
               this.roleList = result.data;
               console.log(this.roleList);
          },
          async removeRightById(role,rightId) {
               const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                   type: 'warning'
               }).catch(err => err)

               if(confirmResult !== 'confirm') {
                    return this.$message.info('取消删除操作');
               
               }
               const {data: result} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
               if(result.meta.status !== 200) {
                    return this.$message.error('删除权限失败！');
               }
               role.children = result.data;
          }
          ,
          async showSetRightDialog(role) {
               this.roleId = role.id;
               const {data: result} = await this.$http.get('rights/tree');
               if(result.meta.status !== 200) {
                    return this.$message.error('获取权限数据失败！');
               }
               this.rightsList = result.data;
               this.getLeafKeys(role,this.defKeys);
               this.SetRightDialogVisible = true;
          },
          getLeafKeys(node,arr) {
               if(!node.children) {
                    return arr.push(node.id);
               }

               node.children.forEach(item => 
                    this.getLeafKeys(item,arr)
               );
          },
          SetRightDialogCloesd() {
               this.defKeys = [];
          },
          async allotRights() {
               const keys = [
                    ...this.$refs.treeRef.
                    getCheckedKeys(),
                    ...this.$refs.treeRef.
                    getHalfCheckedKeys()
               ]
               const idStr = keys.join(',');
               const {data: result} = await this.$http.post(`roles/${this.roleId}/rights`,{rids: idStr})
               if(result.meta.status !== 200) {
                    return this.$message.error('分配权限失败！');
               }
               this.$message.success('分配权限成功！');
               this.getRolesList();
               this.SetRightDialogVisible = false;
          },
          addRoles() {
               this.$refs.addFormRef.validate(async valid => {
                     if(!valid) return
                     const {data:result} = await this.$http.post('roles',this.addForm);
                     if(result.meta.status !== 201) {
                         return this.$message.error('添加角色失败！');
                     }
                     this.$message.success('添加角色成功！');
                     this.addDialogVisible = false;
                     this.getRolesList();
               })
          },
          addDialogClosed() {
               this.$refs.addFormRef.resetFields();
          },
          async showEditDialog(id) {
               const {data: result} = await this.$http.get('roles/' + id);
               if(result.meta.status !== 200) {
                    return this.$message.error('查询角色信息失败！');
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
                    const {data: result} = await this.$http.put('roles/' + this.editForm.id)

                    if(result.meta.status !== 200){
                         return this.$message.error('更新角色信息失败！');
                    }
                    this.editDialogVisible = false;
                    this.getRolesList();
                    this.$message.success('更新角色信息成功');
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
               const {data: result} = await this.$http.delete('roles/' + id);
               if(result.meta.status !== 200) {
                    return this.$message.error('删除角色失败！');
               }
               this.$message.success('删除角色成功！');
               this.getRolesList();
          }
     }
}
</script>

<style lang="less" scoped>

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