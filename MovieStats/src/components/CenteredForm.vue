<script setup lang="ts">
</script>

<template>
  <v-container fluid class="fill-height" style="background-color: #0D1117;">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-6" style="background-color: #1f2937; color: white;" elevation="0" rounded="lg">
          <slot />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
