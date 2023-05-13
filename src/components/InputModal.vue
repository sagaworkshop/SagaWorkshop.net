<template>
    <div :id="id" :ref="id" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ title }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form>
                        <slot>
                            <div class="row">
                                <div class="col text-left">
                                    <div class="form-group mx-sm-3">
                                        <input :name="inputName ? inputName : 'amount'"
                                               :type="inputType ? inputType : 'number'" class="form-control"
                                               :placeholder="placeholder">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col text-center">
                                    <button type="submit" class="btn btn-primary" @click.prevent="submit">
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </slot>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {serializeForm} from '../lib/util';

    export default {
        props: [
            'callback',
            'id',
            'placeholder',
            'title',
            'input-name',
            'input-type'
        ],
        methods: {
            submit() {
                let modal = $('#' + this.id);
                let form = $('#' + this.id + ' form');

                let data = serializeForm(form);
                this.callback(data);

                modal.modal('hide');
                form[0].reset();
            }
        },
        mounted() {
            $(this.$refs[this.id]).on('shown.bs.modal', function() {
                $('#' + this.id + ' form:first *:input[type!=hidden]:first').focus();
            });
        }
    }
</script>
