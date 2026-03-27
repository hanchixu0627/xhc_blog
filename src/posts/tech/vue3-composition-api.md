---
title: Vue 3 Composition API 最佳实践
icon: pen-to-square
date: 2026-03-20
category:
  - 技术
tag:
  - Vue.js
  - JavaScript
  - 前端
---

# Vue 3 Composition API 最佳实践

Composition API 是 Vue 3 最重要的新特性之一，它让我们可以更灵活地组织组件逻辑。

<!-- more -->

## 为什么用 Composition API

Options API 在小型组件中工作良好，但当组件逻辑复杂时，相关代码会被分散在 `data`、`methods`、`computed` 等多个选项中，难以维护。

Composition API 允许我们将同一逻辑关注点的代码组织在一起。

## 基础用法

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('组件已挂载')
})
</script>

<template>
  <button @click="increment">{{ count }} * 2 = {{ doubled }}</button>
</template>
```

## 抽取可复用逻辑

将逻辑抽取为 Composable 函数：

```ts
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubled = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function reset() {
    count.value = initialValue
  }

  return { count, doubled, increment, reset }
}
```

在组件中使用：

```vue
<script setup>
import { useCounter } from '@/composables/useCounter'

const { count, doubled, increment, reset } = useCounter(10)
</script>
```

## 最佳实践

1. **命名规范**：Composable 函数以 `use` 开头
2. **单一职责**：每个 Composable 只处理一类逻辑
3. **返回响应式数据**：确保返回的数据保持响应性
4. **避免嵌套调用**：Composable 应在 `setup` 顶层调用，不要在条件语句中调用
