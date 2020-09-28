<template>
     <div>
          <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>商品管理</el-breadcrumb-item>
              <el-breadcrumb-item>添加商品</el-breadcrumb-item>
          </el-breadcrumb>

          <el-card>
               <el-alert
               title="添加商品信息"
               type="info"
               center
               show-icon
               :closable="false">
               </el-alert>

               <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                   <el-step title="基本信息"></el-step>
                   <el-step title="商品参数"></el-step>
                   <el-step title="商品属性"></el-step>
                   <el-step title="商品图片"></el-step>
                   <el-step title="商品内容"></el-step>
                   <el-step title="完成"></el-step>
               </el-steps>
               <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
               <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                   <el-tab-pane label="基本信息" name="0">
                   <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                   </el-form-item>
                   <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price" type="number"></el-input>
                   </el-form-item>
                   <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight" type="number"></el-input>
                   </el-form-item>
                   <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model="addForm.goods_number" type="number"></el-input>
                   </el-form-item>
                   <el-form-item label="商品分类" prop="">
                         <el-cascader
                          v-model="addForm.goods_cat"
                          :options="catelist"
                          :props="{ expandTrigger: 'hover',cateProps }" prop="goods_cat"
                          @change="handleChange"></el-cascader>
                   </el-form-item>
                   </el-tab-pane>
                   <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                              <el-checkbox-group 
                              v-model="item.attr_vals">
                                   <el-checkbox border v-for="(cb,i) in item.attr_vals" :label="cb" :key="i">{{cb}}</el-checkbox>
                              </el-checkbox-group>
                        </el-form-item>
                   </el-tab-pane>
                   
                   <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                             <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                   </el-tab-pane>
                   
                   <el-tab-pane label="商品图片" name="3">
                        <el-upload
                        :action="uploadURL"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        list-type="picture"
                        :headers="headerObj" :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
  
                        </el-upload>
                   </el-tab-pane>
                   
                   <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                   </el-tab-pane>
               </el-tabs>
               </el-form>
          </el-card>

          <el-dialog
          title="图片预览"
          :visible.sync="previewVisible"
          width="50%">
              <img :src="previewPath" class="previewImg">
          </el-dialog>
     </div>
</template>
<script>
import _ from 'lodash'
export default {
     data() {
          return {
               activeIndex: '0',
               addForm: {
                    goods_name: '',
                    goods_price: 0,
                    goods_weight: 0,
                    goods_number: 0,
                    goods_cat: [],
                    pics: [],
                    goods_introduce: '',
                    attrs: []
               },
               addFormRules: {
                    goods_name: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' }
                    ],
                    goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' }
                    ],
                    goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' }
                    ],
                    goods_number: [
                    { required: true, message: '请输入商品数量', trigger: 'blur' }
                    ],
                    goods_cat: [
                    { required: true, message: '请选择商品分类', trigger: 'blur' }
                    ]
               },
               catelist: [],
               cateProps: {
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children'
               },
               manyTableData: [],
               onlyTableData: [],
               uploadURL: 'http://47.115.124.102:8888/api/private/v1/upload',
               headerObj: {
                    Authorization: window.sessionStorage.getItem('token')
               },
               previewPath: '',
               previewVisible: false
          }
     },
     created() {
          this.getCateList();
     },
     methods: {
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
               const {data: result} = await this.$http.get('categories');

               if(result.meta.status !== 200) {
                    return this.$message.error('获取商品分类数据失败！');
               }
               this.catelist = result.data;
               for (const node of this.catelist) {
                   changes(node);
                   change(node);
               }
               console.log(this.catelist);
          },
          handleChange() {
               console.log(this.addForm.goods_cat);
               if(this.addForm.goods_cat.length !== 3) {
                    this.addForm.goods_cat = [];
               }
          },
          beforeTabLeave(activeName,oldActiveName) {
               if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                    this.$message.error('请选择商品分类');
                    return false;
               }
          },
          async tabClicked() {
               if(this.activeIndex === '1') {
                    const {data: result} = await this.$http.get(`categories/${this.addForm.goods_cat[2]}/attributes`,
                    {params: {sel: 'many'}})

                    if(result.meta.status !== 200) {
                    return this.$message.error('获取动态参数列表失败！');
                    }
                    console.log(result.data);
                    result.data.forEach(item => {
                         item.attr_vals.length === 0?
                         [] : item.attr_vals.split(' ');
                    });
                    this.manyTableData = result.data;
               } else if(this.activeIndex === '2')
               {
                    const {data: result} = await this.$http.get(`categories/${this.addForm.goods_cat[2]}/attributes`,
                    {params: {sel: 'only'}})
                    if(result.meta.status !== 200) {
                        return this.$message.error('获取静态参数列表失败！');
                    }
                     console.log(result.data);
                     this.onlyTableData = result.data;

               }
               
          },
          handlePreview(file) {
               console.log(file)
               this.previewPath = file.response.data.url;
               console.log('xx'+this.previewPath);
               this.previewVisible = true;
          },
          handleRemove(flie) {
               console.log(flie)
               const filePath = 
               file.response.data.temp_path;
               const i = 
               this.addForm.pics.findIndex(x => 
               x.pic === filePath)
               this.addForm.pics.splice(i,1);
               console.log(this.addForm)
          },
          handleSuccess(response) {
               console.log(response);
               const picInfo = {pic: response.data.tmp_path }
               this.addForm.pics.push(picInfo);
               console.log(this.addForm);
          },
          add() {
               this.$refs.addFormRef.validate
               (async valid => {
                    if(!valid) {
                         return this.$message.error('请填写必要的表单项！');
                    }
                    const form = _.cloneDeep(this.addForm);
                    form.goods_cat = 
                    form.goods_cat.join(',');
                    this.manyTableData.forEach(item => {
                         const newInfo = {
                              attr_id: item.attr_id,
                              attr_value: item.attr_vals
                         }
                         this.addForm.attrs.push(newInfo);

                    })
                    this.onlyTableData.forEach(item => {
                         const newInfo = {
                              attr_id: item.attr_id,
                              attr_value: item.attr_vals
                         }
                         this.addForm.attrs.push(newInfo);

                    })
                    form.attrs = this.addForm.attrs;
                    console.log(form)
                    const {data: result} = await this.$http.post('goods',form);
                    if(result.meta.status !== 201) {
                         return this.$message.error('添加商品失败！');
                    }
                    this.$message.success('添加商品成功！');
                    this.$router.push('/goods');
               })
          }

     },
     computed: {
          ceteId() {
               if(this.addForm.goods_cat.length === 3) {
                    return this.addForm.goods_cat[2];
               }
               return null
          }
     }
}
</script>

<style lang="less" scoped>
.el-checkbox {
     margin: 0 10px 0 0 !important;
}
.previewImg {
     width: 100%;
}
.btnAdd {
     margin-top: 15px;
}
</style>