<template>
  <div id="game-container" class="game-container"></div>
</template>

<!--<script>-->
<!--import Phaser from 'phaser';-->
<!--import Scene from './Scene.js';-->
<!--import {ref, watchEffect} from "vue";-->


<!--import { userTaskStore } from "../store/store.js";-->
<!--import {storeToRefs} from "pinia";-->
<!--import axios from "axios";-->


<!--export default {-->
<!--  setup() {-->

<!--    const userId = ref(localStorage.getItem("userId"));-->

<!--    const taskStore = userTaskStore();-->
<!--    const { userCoins } = storeToRefs(taskStore);-->


<!--    return { userId, userCoins };-->
<!--  },-->
<!--  data() {-->
<!--    return { game: null };-->
<!--  },-->
<!--  mounted() {-->
<!--    this.initGame();-->
<!--  },-->
<!--  methods: {-->
<!--    // async fetchUserCoins() {-->
<!--    //   if (!this.userId) return; // this.userId 是 ref，但在 data() 或 setup() 里返回了 => this.userId-->
<!--    //   try {-->
<!--    //     const response = await axios.get("http://localhost:8080/user/coins", {-->
<!--    //       params: { userId: this.userId }-->
<!--    //     });-->
<!--    //     this.userCoins = Number(response.data);-->
<!--    //     console.log("Fetched user coins:", this.userCoins);-->
<!--    //   } catch (err) {-->
<!--    //     console.error("Failed to fetch user coins:", err);-->
<!--    //   }-->
<!--    // },-->
<!--    async fetchUserCoins() {-->
<!--      if (!this.userId) return; // 记得 .value，因为 userId 是 ref-->

<!--      try {-->
<!--        const response = await axios.get("http://localhost:8080/user/coins", {-->
<!--          params: { userId: this.userId } // userId 也是 ref，取值时要 .value-->
<!--        });-->

<!--        // ✅ 确保 userCoins 始终是 ref-->
<!--        this.userCoins.value = ref(Number(response.data));-->

<!--        console.log("Fetched user coins:", this.userCoins.value);-->
<!--      } catch (err) {-->
<!--        console.error("Failed to fetch user coins:", err);-->
<!--      }-->
<!--    },-->

<!--    async initGame() {-->
<!--      await this.fetchUserCoins();-->
<!--      const config = {-->
<!--        type: Phaser.AUTO,-->
<!--        parent: 'game-container',-->
<!--        backgroundColor: '#e3f2fd',-->
<!--        pixelArt: true,-->
<!--        scene: [new Scene({userId: this.userId, userCoins: this.userCoins})],-->
<!--        scale: {-->
<!--          mode: Phaser.Scale.RESIZE,-->
<!--          autoCenter: Phaser.Scale.CENTER_BOTH-->
<!--        }-->
<!--      };-->
<!--      this.game = new Phaser.Game(config);-->
<!--    }-->


<!--  }-->

<!--};-->

<!--</script>-->

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { userTaskStore } from '../store/store.js'
import { storeToRefs } from 'pinia'
import Phaser from 'phaser'
import Scene from './Scene.js'

// 1) 在 setup 里定义/获取所有数据
const userId = ref(localStorage.getItem('userId') || '')
const taskStore = userTaskStore()
const { userCoins } = storeToRefs(taskStore) // userCoins是ref

// 2) 写方法时，直接用变量名，不用 this
async function fetchUserCoins() {
  if (!userId.value) return
  try {
    const response = await axios.get("http://localhost:8080/user/coins", {
      params: { userId: userId.value }
    })
    // 因为 userCoins 是 ref，所以直接改 .value
    userCoins.value = Number(response.data)
    console.log("Fetched user coins:", userCoins.value)
  } catch (err) {
    console.error("Failed to fetch user coins:", err)
  }
}

async function initGame() {
  await fetchUserCoins()
  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#e3f2fd',
    pixelArt: true,
    // **注意这里传“ref 对象本身”，而不是 userCoins.value**
    scene: [new Scene({ userId, userCoins })],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  }
  new Phaser.Game(config)
}

// 3) onMounted时调用
onMounted(() => {
  initGame()
})
</script>

<style scoped>
.game-container {
  width: 1600px;
  height: 750px; /* 视口高度 */
  max-height: 900px;  /* 限制最大高度，防止太大 */
  margin: 38px 38px;
  overflow: hidden;
  border-radius: 25px; /* 圆角半径，可调 */
  box-shadow: 0px 5px 10px rgba(0, 0, 0.3, 0.3);
}


/* 强制canvas尺寸同步
canvas {
  display: block;
  width: 90% !important;
  height: 90% !important;
}
*/
</style>
