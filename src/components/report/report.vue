<template>
  <div>
    <my-bread level1="数据统计" level2="数据报表"></my-bread>
    <div id="main"></div>
  </div>
</template>

<script>
import echarts from "echarts"
export default {
  data() {
    return {
      options: {
        title: {
          text: "用户来源"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3"
            }
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: "value"
            }
          ]
        }
      }
    }
  },
  async mounted() {
    let myChart = echarts.init(document.getElementById("main"))
    const { data: res } = await this.$http.get("reports/type/1")
    if (res.meta.status !== 200) return this.$message("获取折线图数据失败!")
    //   assign es6 合并对象方法
    const result = Object.assign(res.data, this.options)
    myChart.setOption(result)
  }
}
</script>

<style scoped>
#main {
  width: 750px;
  height: 400px;
}
</style>