<!-- App.vue de Preuba para Vuetify -->
<script setup lang="ts">
import { ref } from 'vue'

const rating = ref(4.5)
</script>

<template>
  <v-container>
    <v-btn color="primary">
      Test Button
    </v-btn>
    <v-rating
      v-model="rating"
      color="orange"
      half-increments
    />
  </v-container>
</template>

<style scoped></style>
