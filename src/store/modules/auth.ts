import { Mutation, State, Action, Getter } from 'vuex-simple';
import { forceReconnect } from '@/apollo/lib/link';

interface Project {
  name: string;
  id: number;
}

interface UserData {
  username: string;
  name: string;
  projects: Project[];
}

export default class AuthModule {
  private users: UserData[] = [
    {
      name: 'Tony Huang (approver)',
      username: 'tony.huang',
      projects: [
        {
          id: 2,
          name: 'Pump Retrofit',
        },
      ],
    },
    {
      name: 'Amber Brasher (consultant)',
      username: 'amber.brasher',
      projects: [
        {
          id: 2,
          name: 'Pump Retrofit',
        },
      ],
    },
    {
      name: 'Jon Ma (approver)',
      username: 'jon.ma',
      projects: [
        {
          id: 3,
          name: 'Facility Redesign',
        },
      ],
    },
  ];

  @State() private currentUser: number = 0;
  @State() private loggedIn!: boolean;

  @Getter()
  public get loginStatus() {
    return this.loggedIn;
  }

  @Getter()
  public get activeProjectData() {
    return this.users[this.currentUser].projects[0];
  }

  @Mutation()
  public changeUser() {
    const numberOfUsers = this.users.length - 1;

    if (this.currentUser + 1 > numberOfUsers) {
      this.currentUser = 0;
      return;
    }
    this.currentUser = this.currentUser + 1;
  }

  @Getter()
  public get currentUserData() {
    //@ts-ignore
    return this.users[this.currentUser];
  }
}
