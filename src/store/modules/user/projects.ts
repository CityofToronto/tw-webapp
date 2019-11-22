import { State, Mutation, Getter } from 'vuex-simple';

export interface Project {
  id: string;
  project_number: string;
  project_name: string;
  role: string; // TODO Set as ENUM?
}

export default class ProjectModule {
  constructor() {
    const projectJSON = localStorage.getItem('project');

    if (projectJSON) {
      const project: Project = JSON.parse(projectJSON);
      Object.assign(this, project);
    }
  }

  @State() id!: string;

  @State() project_number!: string;

  @State() project_name!: string;

  @State() role!: string;

  @Getter()
  get combinedName() {
    if (this.project_name) {
      return `${this.project_number} > ${this.project_name}`;
    }
    return undefined;
  }

  @Getter()
  get project(): Project {
    const { id, project_number, project_name, role } = this;
    return {
      id,
      project_number,
      project_name,
      role,
    };
  }

  @Mutation()
  setProject(project: Project) {
    localStorage.setItem('project', JSON.stringify(project));
    Object.assign(this, project);
  }
}
