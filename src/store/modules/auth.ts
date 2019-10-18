import { Mutation, State, Action, Getter } from 'vuex-simple';
import { forceReconnect } from '@/apollo/lib/link';

interface UserData {
  username: string;
  name: string;
}

export default class AuthModule {
  @State() private loggedIn!: boolean;
  @State() private userData: UserData = {
    name: 'Amber',
    username: 'tony.huang',
  };

  @Getter()
  public get loginStatus() {
    return this.loggedIn;
  }

  @Getter()
  public get username() {
    return this.userData.username;
  }

  @Action()
  public getUsername(): string {
    return this.userData.username;
  }

  @Mutation()
  public setUsername(username: string) {
    this.userData.username = username;
    forceReconnect();
  }
}
