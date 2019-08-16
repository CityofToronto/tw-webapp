import { Module } from 'vuex-simple';
import DisplayModule from './modules/display';
import NotificationModule from './modules/notification';

export default class Store {
  @Module()
  public display = new DisplayModule();

  @Module()
  public notification = new NotificationModule();
};
