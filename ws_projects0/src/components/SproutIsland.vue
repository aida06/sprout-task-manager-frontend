<template>
  <div id="game-container" class="game-container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { userTaskStore } from '../store/store.js'
import { storeToRefs } from 'pinia'
import Phaser from 'phaser'
import SproutIslandScene from './SproutIslandScene.js'

const userId = ref(localStorage.getItem('userId') || '')
const taskStore = userTaskStore()
const { userCoins } = storeToRefs(taskStore) // userCoins是ref

async function fetchUserCoins() {
  if (!userId.value) return
  try {
    const response = await axios.get("http://localhost:8080/user/coins", {
      params: { userId: userId.value }
    })

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

    scene: [new SproutIslandScene({ userId, userCoins })],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  }
  new Phaser.Game(config)
}


onMounted(() => {
  initGame()
})
</script>

<style scoped>
.game-container {
  width: 1600px;
  height: 750px;
  max-height: 900px;
  margin: 38px 38px;
  overflow: hidden;
  border-radius: 25px;
  box-shadow: 0px 5px 10px rgba(0, 0, 0.3, 0.3);
}


/*
canvas {
  display: block;
  width: 90% !important;
  height: 90% !important;
}
*/

</style>
