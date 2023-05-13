<template>
    <div class="media my-1">
        <img class="feature-icon d-flex align-self-center" :src="feature.icon"/>
        <div class="media-body align-self-center text-left pl-2">
            {{ feature.name }}
        </div>
    </div>
</template>

<script>
    export default {
        props: ['feature']
    }
</script>
