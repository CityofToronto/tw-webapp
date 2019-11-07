import { Mutation, State, Action, Getter } from 'vuex-simple';

interface UserSettings {
  colourBlind: boolean;
}

interface AdminSettings extends UserSettings {
  debugMode: boolean;
}

export default class SettingsModule {
  @Action()
  getSettings() {
    this.debugMode = JSON.parse(localStorage.getItem('debugMode') ?? 'false');
  }

  @State() debugMode;

  @Getter()
  get debugStatus() {
    return this.debugMode;
  }

  @Mutation()
  setDebugMode(val: boolean) {
    this.debugMode = val;
    localStorage.setItem('debugMode', String(val));
  }
}
