import { Module } from 'vuex-simple';
import DisplayModule from './modules/display';
import NotificationModule from './modules/notification';
import GridModule from './modules/grid';
import PopupModule from './modules/popup';

export default class Store {
  @Module()
  public display = new DisplayModule();

  @Module()
  public notification = new NotificationModule();

  @Module()
  public grid = new GridModule();

  @Module()
  public popup = new PopupModule();
}
