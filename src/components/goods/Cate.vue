<template>
     <div>
          <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>商品管理</el-breadcrumb-item>
              <el-breadcrumb-item>商品分类</el-breadcrumb-item>
          </el-breadcrumb>

          <el-card>
               <el-row>
                    <el-col>
                         <el-button type="primary" @click="showAddCateDialogVisible">添加分类</el-button>
                    </el-col>
               </el-row>
               <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
                    <template slot="isok" slot-scope="scope">
                         <i class="el-icon-success" style="color:green;" v-if="scope.row.cat_deleted === false"></i>
                         <i class="el-icon-error" style="color:red;" v-else></i>
                    </template>
                    <template slot="order" slot-scope="scope">
                         <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                         <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                         <el-tag type="warning" size="mini" v-else>三级</el-tag>
                    </template>
                    <template slot="opt" slot-scope="scope">
                         <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                         <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                    </template>
               </tree-table>

                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="querInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="querInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
                </el-pagination>


          </el-card>

          <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
               <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                    <el-form-item label="分类名称:" prop="">
                        <el-input v-model="addCateForm.cat_name"></el-input>
                    </el-form-item>
               <el-form-item label="父级分类:">
          <el-cascader
          v-model="selectedKeys"
          :options="parentCateList"
          :props="{ expandTrigger: 'hover',value: 'cat_id',label: 'cat_name',children: 'children' }"
          @change="parentCateChange" clearable>
          </el-cascader>
               </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
              <el-button @click="addCateDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
</el-dialog>
     </div>
</template>

<script>
export default {
     data() {
          return {
               querInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
               },
               catelist: [],
               total: 0,
               columns: [{
                    label: '分类名称',
                    prop: 'cat_name'
               },
               {
                    label: '是否有效',
                    type: 'template',
                    template: 'isok'
               },
               {
                    label: '排序',
                    type: 'template',
                    template: 'order'
               },
               {
                    label: '操作',
                    type: 'template',
                    template: 'opt'
               }
               ],
               addCateDialogVisible:false,
               addCateForm: {
                    cat_name: '',
                    cat_pid: 0,
                    cat_level: 0
               },
               addCateFormRules: {
                    cat_name: [
                         { required: true, message: '请输入分类名称', trigger: 'blur' }
                    ]
               },
               parentCateList: [],
               selectedKeys: []
          }
     },
     created() {
          this.getCateList();
     },
     methods: {
          async getCateList() {
              const {data: result} = await this.$http.get('categories',{ params: this.querInfo});

              if(result.meta.status !== 200) {
                   return this.$message.error('获取商品分类失败！');
              }
              this.catelist = result.data.result;
              this.total = result.data.total;
              console.log(result.data)
          },
          handleSizeChange(newSize) {
              this.querInfo.pagesize = newSize;
              this.getCateList();
          },
          handleCurrentChange(newPage) {
              this.querInfo.pagenum = newPage;
              this.getCateList();
          },
          showAddCateDialogVisible() {
               this.getParentCateList();
               this.addCateDialogVisible = true;
          },
          async getParentCateList() {
               const {data: result} = await this.$http.get('categories',{params: {type: 2}});
               if(result.meta.status !== 200) {
                    return this.$message.error('获取父级分类数据失败！');
               }
               console.log(result.data);
               this.parentCateList = result.data;
          },
          parentCateChange() {
               console.log(this.selectedKeys);
               if(this.selectedKeys.length > 0) {
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
                    this.addCateForm.cat_level = this.selectedKeys.length;
                    return
               } else {
                    this.addCateForm.cat_pid = 0;
                    this.addCateForm.cat_name = 0;
               }
          },
          addCate() {
               this.$refs.addCateFormRef.validate(async valid => {
                    if(!valid) return
                    const {data: result} = await this.$http.post('categories',this.addCateForm);
                    console.log(result);
                    if(result.meta.status !== 200) {
                         return this.$message.error('添加分类失败！');
                    }
                    this.$message.success('添加分类成功！');
                    this.getCateList();
                    this.addCateDialogVisible = false;
               })
          },
          addCateDialogClosed() {
               this.$refs.addCateFormRef.resetFields();
               this.selectedKeys = [];
               this.addCateForm.cat_level = 0;
               this.addCateForm.cat_pid = 0;
          }
     }
     
}
</script>

<style lang="less" scoped>
.el-row {
     margin-bottom: 15px;
}
.treeTable {
     margin-top: 15px;
}
.el-cascader {
     width: 100%;
     height: 200px;
}
</style>