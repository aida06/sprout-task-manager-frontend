<template>
  <div id="game-container" class="game-container"></div>
</template>

<script>
import Phaser from 'phaser';
import Scene from './Scene.js';

export default {
  data() {
    return { game: null };
  },
  mounted() {
    this.initGame();
  },
  methods: {
    initGame() {
      const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        backgroundColor: '#e3f2fd',
        pixelArt: true,
        scene: [Scene], // 这里直接放我们的自定义场景
        // input: {
        //   activePointers: 3 // 允许同时追踪几个指针
        // },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };
      this.game = new Phaser.Game(config);
    }
  }
};
</script>

<style scoped>
.game-container {
  width: 1600px;
  height: 750px; /* 视口高度 */
  max-height: 900px;  /* 限制最大高度，防止太大 */
  margin: 35px 35px;
  overflow: hidden;
}

/* 强制canvas尺寸同步
canvas {
  display: block;
  width: 90% !important;
  height: 90% !important;
}
*/
</style>
