import { Mutation, State, Action, Getter } from 'vuex-simple';
import USERS from '@/assets/users.json';
import { forceReconnect } from '@/apollo/lib/link';
import { router } from '@/router';

export enum USER_TYPE {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export default class AuthModule {
  @State() userName: string = sessionStorage.getItem('userName') ?? '';

  @State() firstName: string = sessionStorage.getItem('firstName') ?? '';

  @State() lastName: string = sessionStorage.getItem('lastName') ?? '';

  isValidUser = (userName: string) => {
    const userData = USERS[userName];

    return !!userData ?? undefined;
  };

  @Getter()
  public get loginStatus() {
    return !!this.userName;
  }

  @Getter()
  public get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @Getter()
  public get userType(): USER_TYPE {
    return USERS[this.userName].userType ?? USER_TYPE.USER;
  }

  @Mutation()
  public setUser(userName: string) {
    this.userName = userName;
    this.firstName = USERS[userName].firstName;
    this.lastName = USERS[userName].lastName;
    sessionStorage.setItem('userName', this.userName);
    sessionStorage.setItem('firstName', this.firstName);
    sessionStorage.setItem('lastName', this.lastName);
  }

  @Action() logUserIn(email: string) {
    return new Promise((resolve, reject) => {
      const [userName] = email.split('@');
      if (this.isValidUser(userName)) {
        this.setUser(userName);
        forceReconnect();
        resolve();
      }
      reject('Email Not Found');
    });
  }

  @Action() logUserOut() {
    this.userName = '';
    this.firstName = '';
    this.lastName = '';
    sessionStorage.clear();
    router.push('login');
  }
}
