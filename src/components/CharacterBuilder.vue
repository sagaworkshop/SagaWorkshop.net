<template>
    <div>
        <transition name="component-fade" mode="out-in">
            <router-view></router-view>
        </transition>
        <ability-modal></ability-modal>
        <defense-modal></defense-modal>
        <feature-modal></feature-modal>
        <feature-select-modal></feature-select-modal>
        <skill-modal></skill-modal>
    </div>
</template>

<script>
    import AbilityModal from './AbilityModal.vue';
    import DefenseModal from './DefenseModal.vue';
    import FeatureModal from './FeatureModal.vue';
    import FeatureSelectModal from './FeatureSelectModal.vue';
    import SkillModal from './SkillModal.vue';

    export default {
        components: {
            AbilityModal,
            DefenseModal,
            FeatureModal,
            FeatureSelectModal,
            SkillModal
        }
    }
</script>

<style>
    .component-fade-enter-active, .component-fade-leave-active {
        transition: opacity .3s ease;
    }

    .component-fade-enter, .component-fade-leave-to {
        opacity: 0;
    }
</style>
