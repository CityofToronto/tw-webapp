/* eslint-disable no-param-reassign, no-shadow */
// This file extends snackbars from the vuetify library
// https://vuetifyjs.com/en/components/snackbars
import { State, Mutation, Getter, Action } from 'vuex-simple';

export enum NotificationPosition {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

interface Notification {
  visible?: boolean;
  message: string;
  color: string;
  position: NotificationPosition[];
  timeout?: number;
}

export default class NotificationModule {
  @State() private visible: boolean;

  @State() private message: string;

  @State() private color: string;

  @State() private timeout: number;

  /**
   *  This can be an array.
   *  [Position.Top] for top
   *  [Position.Top, Position.Left] for top-left
   */

  @State() private position: NotificationPosition[];

  public constructor() {
    this.visible = false;
    this.message = 'false';
    this.color = 'primary';
    this.position = [NotificationPosition.Top];
    this.timeout = 5000;
  }

  @Getter()
  public get notification(): Notification {
    return {
      visible: this.visible,
      message: this.message,
      color: this.color,
      position: this.position,
      timeout: this.timeout,
    };
  }

  @Mutation()
  private setNotification({
    message,
    color,
    position,
    timeout = 5000,
  }: Notification): void {
    this.visible = true;
    this.message = message;
    this.color = color;
    this.position = position;
    this.timeout = timeout;
  }

  @Mutation()
  private clearNotification(): void {
    this.visible = false;
  }

  @Action()
  public async pushNotification(notification: Notification): Promise<void> {
    this.setNotification(notification);
  }

  @Action()
  public async popNotification(): Promise<void> {
    this.clearNotification();
  }
}
