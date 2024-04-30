import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse () {
  const listening = ref(false)

  const mouseX = ref(0);
  const mouseY = ref(0);

  function update(event) {
    mouseX.value = event.pageX;
    mouseY.value = event.pageY;
  }

  function startListen () {
    if (listening.value) return
    window.addEventListener('mousemove', update)
    listening.value = true
  }

  function stopListen () {
    if (!listening.value) return
    window.removeEventListener('mousemove', update)
    listening.value = false
  }

  onMounted(() => startListen());
  onUnmounted(() => stopListen());

  return { mouseX, mouseY, startListen, stopListen }
}