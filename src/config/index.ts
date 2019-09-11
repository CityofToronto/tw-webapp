import { gridConfig } from './default';

class Configuration<T> {
  private config: T;

  public constructor(configurationObject: T) {
    this.config = configurationObject;
  }

  /**
   * Support for only base properties.
   * Return true if the key exists in the config file.
   *
   * @param {string} key - Key of the property
   */
  public has<K extends keyof T>(key: K): boolean {
    if (this.config[key] === null || this.config[key] === undefined) {
      return false;
    }
    return true;
  }

  /**
   * Support for only base properties.
   * Return the configuration object with correct typings.
   *
   * @param {string} key - Key of the property
   */
  public get<K extends keyof T>(key: K): T[K] {
    return this.config[key];
  }
}

export const GRID_CONFIG = new Configuration(gridConfig);
