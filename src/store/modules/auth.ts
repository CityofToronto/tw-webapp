import { Mutation, State, Action, Getter } from 'vuex-simple';

interface UserData {
  username: string;
  name: string;
}

export default class AuthModule {
  @State() private loggedIn!: boolean;
  @State() private userData!: UserData;

  @Getter()
  public get loginStatus() {
    return this.loggedIn;
  }

  @Getter()
  public get username() {
    return this.userData.username;
  }

  @Mutation()
  public setUsername(username: string) {
    this.userData.username = username;
  }
}
