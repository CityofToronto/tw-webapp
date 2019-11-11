import { Mutation, State, Action, Getter } from 'vuex-simple';
import USERS from '@/assets/users.json';

interface Project {
  name: string;
  id: number;
}

interface UserData {
  userName: string;
  title?: string;
  name: string;
  projects: Project[];
}

export default class AuthModule {
  @State() private userName: string = '';
  @State() private userData!: UserData;

  @State() private loggedIn!: boolean;

  isValidUser = (userName: string) => {
    const userData = USERS[userName];

    return !!userData ?? undefined;
  };

  @Getter()
  public get loginStatus() {
    return !!this.userName;
  }

  @Action() logUserIn(userName: string) {
    return new Promise((resolve, reject) => {
      if (this.isValidUser(userName)) {
        this.userName = userName;
        this.userData = USERS[userName];
        resolve();
      }
      reject();
    });
  }
}
