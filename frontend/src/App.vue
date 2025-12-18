<template>
  <router-view />
  <NotificationDisplay />
</template>

<script setup>
import NotificationDisplay from './components/common/NotificationDisplay.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
