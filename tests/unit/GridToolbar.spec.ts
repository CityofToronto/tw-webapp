import Vue from 'vue';
import Vuetify from 'vuetify';

import GridToolbar from '@/components/grid/GridToolbar.vue';

import { mount, createLocalVue } from '@vue/test-utils';

const localVue = createLocalVue();

describe('GridToolbar.vue', (): void => {
  let vuetify: typeof Vuetify;

  beforeEach((): void => {
    vuetify = new Vuetify();
  });

  it('Should have title, render buttons and match snapshot', (): void => {
    const wrapper = mount(GridToolbar, {
      localValue,
      vuetify,
      propDatas: {
        tableName: 'A Table Name',
      },
    });
  });
});
