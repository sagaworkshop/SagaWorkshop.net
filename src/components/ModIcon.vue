<template>
    <i class="fa" aria-hidden="true"
       :title="stat.summary"
       v-if="stat.value"></i>
</template>

<script>
    export default {
        props: ['icon', 'stat']
    }
</script>
