<script setup>
import { toRef } from 'vue';
import { useThemeStore } from '@/stores/modules/theme';

// 主题
const useTheme = toRef(useThemeStore(), 'theme');
</script>
<template>
  <div id="starry-graph" :class="useTheme">
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" appear>
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>
<style lang="less" scoped>
#starry-graph {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#starry-graph main {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
