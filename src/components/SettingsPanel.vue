<template>
    <div class="text-right">
        <a href="#" class="btn fa fa-cogs text-primary"
           data-toggle="modal" data-target="#settings-modal" title="Settings"
           @click.prevent=""></a>
        <div id="settings-modal" class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Settings</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body text-left small">
                        <p>
                            All settings changes take effect immediately.
                            Note that some settings can only be changed at character creation time.
                        </p>
                        <div class="form-row align-middle mb-3">
                            <div class="col text-right">
                                <label for="settings-max-point-buy" class="mt-1">Max point buy</label>
                            </div>
                            <div class="col form-inline">
                                <input id="settings-max-point-buy" class="form-control form-control-sm"
                                       type="number"
                                       :disabled="character.created"
                                       v-model.number.lazy="character.settings.maxPointBuy"/>
                            </div>
                        </div>
                        <div class="text-center mt-4">
                            <button class="btn btn-primary" type="button" @click.prevent="closeSettings">
                                Close Settings
                            </button>
                        </div>
                        <hr/>
                        <p>If you made a mistake, you can undo your character's last level up.</p>
                        <div class="text-center">
                            <button class="btn btn-danger" type="button"
                                    :disabled="!character.levelledUp"
                                    @click.prevent="undoLastLevel">Undo Level {{ character.level }}
                            </button>
                        </div>
                        <hr/>
                        <p>You can permanently delete your character using this button.</p>
                        <div class="text-center">
                            <button class="btn btn-danger" type="button"
                                    @click.prevent="deleteCharacter">Delete {{ character.name }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {db} from '../lib/firebase';

    export default {
        props: ['character'],
        methods: {
            closeSettings() {
                $('.modal').modal('hide');
            },
            undoLastLevel() {
                if (confirm('Are you sure you wish to undo your last level? This can not be undone.')) {
                    this.closeSettings();
                    this.character.undoLastLevel();
                }
            },
            deleteCharacter() {
                if (confirm('Delete this character permanently? This can not be undone.')) {
                    this.closeSettings();
                    this.$router.push({name: 'home'});
                    this.character.permanentlyDelete();
                }
            }
        }
    }
</script>
