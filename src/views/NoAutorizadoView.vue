<template>
  <div class="mensaje">
    <span class="grande">403</span>
    <h1>Zona de organizadores</h1>
    <p class="muted">Esta sección es solo para usuarios con rol de organizador.</p>
    <RouterLink :to="{ name: 'torneos' }" class="btn btn-primario">Volver a torneos</RouterLink>
  </div>
</template>

<style scoped>
.mensaje {
  text-align: center;
  padding: 4rem 1rem;
}

.grande {
  font-family: var(--display);
  font-size: 7rem;
  line-height: 1;
  color: var(--rojo);
}
</style>
