<template>
  <div class="mensaje">
    <span class="grande">K.O.</span>
    <h1>Página no encontrada</h1>
    <p class="muted">La ruta que buscás no existe.</p>
    <RouterLink :to="{ name: 'home' }" class="btn btn-primario">Ir al inicio</RouterLink>
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
  font-style: italic;
}
</style>
