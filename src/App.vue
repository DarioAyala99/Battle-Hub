<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastList from '@/components/ToastList.vue'
</script>

<template>
  <AppHeader />
  <main class="contenedor principal">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
  <ToastList />
</template>

<style scoped>
.principal {
  flex: 1;
  padding-block: 2rem 3rem;
}
</style>
