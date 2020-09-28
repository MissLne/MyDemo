<template>
     <el-container class="home-container">
          <el-header>
               <img src="../assets/lala.png" class="home-logo">
               <span>电商后台管理系统</span>
               <el-button type="info" @click="logout">退出</el-button>
          </el-header>
          <el-container>
              <el-aside :width="isCollapse? '64px':'200px'">
                   <div class="toggle-button" @click="toggleCollapse">|||</div>
                   <el-menu background-color="#333744" text-color="#fff" active-text-color="#569CD6" :unique-opened="true" :collapse="isCollapse" :collapse-transition="false"  router :default-active="activePath">
                        <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                              <template slot="title">
                                  <i :class="iconsObj[item.id]" id="mylogo"></i>
                                  <span>{{item.authName}}</span>
                              </template>
                              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                                  <template slot="title">
                                       <i class="el-icon-menu"></i>
                                       <span>{{subItem.authName}}</span>
                                  </template>
                              </el-menu-item>
                         </el-submenu>
                    </el-menu>
              </el-aside>
              <el-main>
                   <router-view></router-view>
              </el-main>
          </el-container>
     </el-container>
</template>

<script>
export default {
     data() {
         return {
              menulist: [],
              iconsObj: {
                   "125": 'iconfont icon-haoyou',
                   "103": 'iconfont icon-tijikongjian',
                   "101": 'iconfont icon-shangpin',
                   "102": 'iconfont icon-danju-tianchong',
                   "145": 'iconfont icon-baobiao'
              },
              isCollapse:false,
              activePath:''
          }
     },
     methods: {
          logout() {
               window.sessionStorage.clear();
               this.$router.push('/login');
          },
          async getMenuList(){
          const {data: result} = await this.$http.get('menus');
          if(result.meta.status !== 200) return this.$message.error(result.meta.msg);
          this.menulist = result.data;
          console.log(result);
          },
          toggleCollapse() {
              this.isCollapse = !this.isCollapse;
          },
          saveNavState(activePath) {
               window.sessionStorage.setItem('activePath',activePath);
               this.activePath = activePath;
          }
     },
     created() {
          this.getMenuList();
          this.activePath = window.sessionStorage.getItem('activePath');
     }
}
</script>

<style lang="less" scoped>
#mylogo {
     margin-right: 10px;
}
.home-container {
     height: 100%;
}
.el-header {
     background: #373d41;
     display: flex;
     justify-content: space-between;
     padding-left: 0;
     align-items: center;
     color: #fff;
     font-size: 20px;
}
.home-logo {
     width: 50px;
     height: 60px;
}
.el-menu {
     border-right: 0;
}
.el-aside {
     background: #333744;
}
.el-main {
     background: #eaedf1;
}
.toggle-button {
     background: #4A5064;
     font-size: 10px;
     line-height: 24px;
     color: #fff;
     text-align: center;
     letter-spacing: 0.2em;
     cursor: pointer;
}
</style>