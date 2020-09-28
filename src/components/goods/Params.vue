<template>
     <div>
          <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>商品管理</el-breadcrumb-item>
              <el-breadcrumb-item>参数列表</el-breadcrumb-item>
          </el-breadcrumb>

          <el-card>
               <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
               <el-row class="cat_opt">
                    <el-col>
                         <span>选择商品分类：</span>
                         <el-cascader v-model="selectedCateKeys" 
                         :options="myCateList" :props="{expandTrigger: 'hover',cateProp}" @change="handleChange">
                         </el-cascader>
                    </el-col>
               </el-row>

               <el-tabs v-model="activeName" @tab-click="handleTabClick">
                   <el-tab-pane label="动态参数" name="many">
                        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
                        <el-table :data="manyTableData" border stripe>
                             <el-table-column type="expand">
                                  <template slot-scope="scope">
                                       <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i,scope.row)">{{item}}</el-tag>
                                       <el-input
                                       class="input-new-tag"
                                       v-if="scope.row.inputVisible"
                                       v-model="scope.row.inputValue"
                                       ref="saveTagInput"
                                       size="small"
                                       @keyup.enter.native="handleInputConfirm(scope.row)"
                                       @blur="handleInputConfirm(scope.row)"
                                       >
                                       </el-input>
                                       <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                                  </template>
                             </el-table-column>
                             <el-table-column type="index"></el-table-column>
                             <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                             <el-table-column label="操作">
                                  <template slot-scope="scope">
                                       <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                       <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                                  </template>
                             </el-table-column>
                        </el-table>
                   </el-tab-pane>
                   <el-tab-pane label="静态属性" name="only">
                        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                        <el-table :data="onlyTableData" border stripe>
                             <el-table-column type="expand">
                                  <template slot-scope="scope">
                                       <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i,scope.row)">{{item}}</el-tag>
                                       <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                        >
                                      </el-input>
                                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                                  </template>
                             </el-table-column>
                             <el-table-column type="index"></el-table-column>
                             <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                             <el-table-column label="操作">
                                  <template slot-scope="scope">
                                       <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                       <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                                  </template>
                             </el-table-column>
                        </el-table>
                   </el-tab-pane>
               </el-tabs>
          </el-card>

          <el-dialog
          :title="'添加' + titleText"
          :visible.sync="addDialogVisible"
          width="50%" @close="addDialogClosed">
               <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
               <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
               </el-form-item>
               </el-form>
                <span slot="footer" class="dialog-footer">
                   <el-button @click="addDialogVisible = false">取 消</el-button>
                   <el-button type="primary" @click="addParams">确 定</el-button>
                </span>
</el-dialog>

     <el-dialog
     :title="'修改' + titleText"
     :visible.sync="editDialogVisible"
     width="50%" @close="editDialogClosed">
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
              <el-button @click="editDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editParams">确 定</el-button>
          </span>
     </el-dialog>
     </div>
</template>

<script>
export default {
     data() {
      return {
           myCateList: [],
           selectedCateKeys: [],
           cateProp: {
               value: 'value',
               label: 'cat_name',
               children: 'children'
           },
          //  被激活的页签的名称
           activeName: 'many',
           manyTableData: [],
           onlyTableData: [],
           addDialogVisible: false,
           addForm: {
                attr_name: ''
           },
           addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
           },
           editDialogVisible: false,
           editForm: {},
           editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
           }
      }
     },
     created() {
          this.getCateList();

//           function change(node){
//                    node.label=node['cat_name'];
//                    if(!node.children){ //叶节点 -> 出口
//                        return;
//                    }
//                    for (const child of node.children) {
//                        change(child);
//                    }
//                }
               
     },
     methods: {
          async getParamsData() {
                if(this.selectedCateKeys.length !== 3) {
                    this.selectedCateKeys = [];
                    this.manyTableData = [];
                    this.onlyTableData = [];
                    return
               }
               console.log(this.selectedCateKeys)
               const {data: result} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{ sel: this.activeName}});
               if(result.meta.status !== 200) {
                    return this.$message.error('获取参数列表失败！');
               }
               console.log(result.data);
               result.data.forEach(item => {
                    item.attr_vals = item.attr_vals ?
                    item.attr_vals.split(' ') : [];
                    item.inputVisible = false;
                    item.inputValue = '';
               });
               if(this.activeName === 'many') {
                    this.manyTableData = result.data;
               } else {
                    this.onlyTableData = result.data;
               }
          },
          async getCateList() {
               function changes(node){
                   node.value=node['cat_id'];
                   if(!node.children){ //叶节点 -> 出口
                       return;
                   }
                   for (const child of node.children) {
                       changes(child);
                   }
               }
               function change(node){
                   node.label=node['cat_name'];
                   if(!node.children){ //叶节点 -> 出口
                       return;
                   }
                   for (const child of node.children) {
                      change(child);
                   }
               } 
               const {data: result} = await this.$http.get('categories',{params: {type: 3}});
               if(result.meta.status !== 200) {
                   return this.$message.error('获取商品分类失败！');
               }
               console.log(result.data)
               this.myCateList = result.data;
               for (const node of this.myCateList) {
                   changes(node);
                   change(node);
               }
               console.log(this.myCateList)
          },
          handleChange() {
               this.getParamsData(); 
              
          },
          handleTabClick() {
               console.log(this.activeName);
               this.getParamsData();                     
          },
          addDialogClosed() {
               this.$refs.addFormRef.resetFields();
          },
          addParams() {
               this.$refs.addFormRef.validate(async valid => {
                    if(!valid) return
                    const {data: result} = await this.$http.post(`categories/${this.cateId}/attributes`,
                    {attr_name: this.addForm.attr_name,
                     attr_sel: this.activeName})
                    if(result.meta.status !== 201) {
                         return this.$message.error('添加参数失败！');
                    }
                    this.$message.success('添加参数成功！');
                    this.addDialogVisible = false;
                    this.getParamsData();
               })
          },
          async showEditDialog(attr_id) {
               const {data: result} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
               {params: { attr_sel: this.activeName }})
               if(result.meta.status !== 200) {
                    return this.$message.error('获取参数信息失败！');
               }
               this.editForm = result.data;
               this.editDialogVisible = true;
          },
          editDialogClosed() {
               this.$refs.editFormRef.resetFields();
          },
          editParams() {
               this.$refs.editFormRef.validate(async valid => {
                   if(!valid) return
                   const {data: result} =  await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                   {    
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.activeName
                   })

                   if(result.meta.status !== 200) {
                        return this.$message.error('修改参数失败！');
                   }
                   this.$message.success('修改参数成功！');
                   this.getParamsData();
                   this.editDialogVisible = false;
               })
          },
          async removeParams(attr_id) {
               const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm') {
             return this.$message.info('已取消删除！');
        }
        const {data: result} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`);
          if(result.meta.status !== 200) {
               return this.$message.error('删除参数失败！');
          }
          this.$message.success('删除参数成功！');
          this.getParamsData();
          },
          async handleInputConfirm(row) {
               // 文本框失去焦点或者按下enter
               // if(row.inputVisible.x(/^\s+|\s+$/gm,'').length === 0) {
               //      row.inputVisible = '';
               //      row.inputVisible = false;
               //      return
               // }
               row.attr_vals.push(row.inputValue);
               row.inputValue = '';
               row.inputVisible = false;
               this.saveAttrVals(row);
          },
          async saveAttrVals(row) {
               const {data: result} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
               {
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(' ')
               })
               if(result.meta.status !== 200) {
                    return this.$message.error('修改参数项失败！');
               }
               this.$message.success('修改参数项成功！');
          },
          showInput(row) {
               row.inputVisible = true;
               this.inputVisible = true;
               this.$nextTick(_ => {
               this.$refs.saveTagInput.$refs.input.focus();
               });
          },
          handleClosed(i,row) {
               row.attr_vals.splice(i,1);
               this.saveAttrVals(row);
          }

     },
     computed: {
          isBtnDisabled() {
               if(this.selectedCateKeys.length !== 3) {
                    return true;
               }
               return false;
          },
          cateId() {
               if(this.selectedCateKeys.length === 3) {
                    return this.selectedCateKeys[2]
               }
               return null;
          },
          titleText() {
               if(this.activeName === 'many') {
                    return '动态参数';
               }
               return '静态属性';
          }
          
     }
}
</script>
<style lang="less" scoped>
.cat_opt {
     margin: 15px 0;
}
.el-tag {
     margin: 10px;
}
.button-new-tag {
     width: 100px;
     height: 30px;
}

</style>