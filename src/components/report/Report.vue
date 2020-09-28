<template>
     <div>
          <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>数据统计</el-breadcrumb-item>
              <el-breadcrumb-item>数据报表</el-breadcrumb-item>
          </el-breadcrumb>

          <el-card>
               <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
               <div id="main" style="width: 750px;height:400px;"></div>
          </el-card>
     </div>
</template>

<script>

import echarts from 'echarts'
import _ from 'lodash'
export default {
     data() {
          return {
            option: {
            title: {
                text: '数据报表'
            },
            tooltip: {},
            legend: {
                data:['销量']
            },
            xAxis: {
                data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
            },
            yAxis: {},
            series: [{
                name: '销量',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20]
            }]
            } 
          }
     },
     created() {},
     async mounted() {
          // 基于准备好的dom，初始化echarts实例
         var myChart;
         myChart = echarts.init(document.getElementById('main'));
         const {data: result} = await this.$http.get('reports/type/1');
         if(result.meta.status !== 200) {
              return this.$message.error('获取折线图数据失败！');
         }
         const res = _.merge(result.data,this.option)
         myChart.setOption(res);
     
     },
     methods: {}

}
</script>

<style lang="less" scoped>

</style>