<template>
  <button class="opera-wrapper">
    <slot></slot>
  </button>
</template>

<style lang="less" scoped>
.opera-wrapper {
  position: relative;
  padding: 0.5rem 0.2rem;
  transform: rotateX(35deg) rotateZ(-35deg);
  transform-style: preserve-3d;
  border: 0.0625rem solid var(--color-line);
  transition: all 150ms;
  background-color: var(--color-tool-bg);
  cursor: pointer;
}

.opera-wrapper::before {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 99%;
  border: 0.0625rem solid var(--color-line);
  top: 0;
  left: 0;
  transform-origin: left;
  transform: rotateY(90deg);
  transition: all var(--starry-sky-transition-time);
  background-color: var(--color-tool-bg-1);
}

.opera-wrapper::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 1.5rem;
  border: 0.0625rem solid var(--color-line);
  bottom: 0;
  left: 0;
  transform-origin: bottom;
  transform: rotateX(90deg);
  transition: all var(--starry-sky-transition-time);
  background-color: var(--color-tool-bg-2);
}

.opera-wrapper:active {
  transform: rotateX(35deg) rotateZ(-35deg) translateZ(-1.5rem);
}

.opera-wrapper:active::before {
  width: 0;
}

.opera-wrapper:active::after {
  height: 0;
}
</style>
