/* eslint-disable no-param-reassign, no-shadow */
// This file extends snackbars from the vuetify library
// https://vuetifyjs.com/en/components/snackbars
import {
  State, Mutation, Getter, Action,
} from 'vuex-simple';

type NoticationPosition = 'top' | 'bottom' | 'left' | 'right'

interface Notification {
  visible?: boolean;
  message: string;
  color: string;
  position: NoticationPosition;
}

export default class NotificationModule {
  @State() private visible: boolean;

  @State() private message: string;

  @State() private color: string;

  @State() private position: NoticationPosition;

  public constructor() {
    this.visible = false;
    this.message = 'false';
    this.color = 'primary';
    this.position = 'top';
  }

  @Getter()
  public get notification(): Notification {
    return {
      visible: this.visible,
      message: this.message,
      color: this.color,
      position: this.position,
    };
  }

  @Mutation()
  private setNotification({
    message, color, position,
  }: Notification): void {
    this.visible = true;
    this.message = message;
    this.color = color;
    this.position = position;
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
