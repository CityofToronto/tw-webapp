import { Module } from 'vuex-simple';
import DisplayModule from './modules/display';
import NotificationModule from './modules/notification';
import GridModule from './modules/grid';
import AuthModule from './modules/auth';
import SettingsModule from './modules/settings';
import ProjectModule from './modules/user/projects';
import ModalModule from './modules/modal';

export default class Store {
  @Module()
  public display = new DisplayModule();

  @Module()
  public notification = new NotificationModule();

  @Module()
  public grid = new GridModule();

  @Module()
  public modal = new ModalModule();

  @Module()
  public auth = new AuthModule();

  @Module()
  public settings = new SettingsModule();

  @Module()
  public project = new ProjectModule();
}
