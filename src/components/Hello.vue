<template>
  <h1>{{ message }}</h1>
</template>

<script lang="ts">
import { Vue, Prop } from 'vue-property-decorator';

export default class Hello extends Vue {
  @Prop({ default: 'hello', required: false }) readonly message: string | undefined;

  todos: [{text: string; done: boolean}] = [{ text: 'hello', done: false }];

  addTodos(text: string) {
    this.todos.push({ text, done: false });
  }

  get uncompletedTodos() {
    return this.todos.filter(todo => todo.done === false);
  }
}

</script>

<style>

</style>
