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
  @State() private loggedIn!: boolean;
  @State() private userData: UserData = {
    name: 'Amber Brasher',
    username: 'amber.brasher',
    projects: [
      {
        id: 1,
        name: 'Floor Redesign',
      },
      {
        id: 3,
        name: 'Heater Outfitting',
      },
    ],
  };

  @Getter()
  public get loginStatus() {
    return this.loggedIn;
  }

  @Getter()
  public get username() {
    return this.userData.username;
  }

  @Getter()
  public get user(): UserData {
    return this.userData;
  }

  @Mutation()
  public setUserData(userData: UserData) {
    this.userData = userData;
    this.activeProject = userData.projects[0];
    forceReconnect();
  }

  @State() private activeProject: Project = this.userData.projects[0];

  @Mutation()
  public setActiveProject(project: Project) {
    this.activeProject = project;
    forceReconnect();
  }

  @Getter()
  public get activeProjectData() {
    return this.activeProject;
  }
}
