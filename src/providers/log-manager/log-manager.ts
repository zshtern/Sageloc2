import {Injectable} from '@angular/core';
import {ModalController} from "ionic-angular";

const MAX_LOG_SIZE = 500;

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogMessage {
  level: LogLevel;
  module: string;
  text: string;
}

export class Logger {
  private readonly module: string;

  static messages: LogMessage[] = [];

  static levels = [
    {id: 0, name: 'Debug'},
    {id: 1, name: 'Info'},
    {id: 2, name: 'Warn'},
    {id: 3, name: 'Error'}
  ];

  constructor(module) {
    this.module = module;
  }

  debug(...args: any[]) {
    let msg = this.getMessage(LogLevel.DEBUG, ...args);
    Logger.addMessage(msg);
    return msg.text;
  }

  info(...args: any[]) {
    let msg = this.getMessage(LogLevel.INFO, ...args);
    Logger.addMessage(msg);
    return msg.text;
  }

  warn(...args: any[]) {
    let msg = this.getMessage(LogLevel.WARN, ...args);
    Logger.addMessage(msg);
    return msg.text;
  }

  error(...args: any[]) {
    let msg = this.getMessage(LogLevel.ERROR, ...args);
    Logger.addMessage(msg);
    return msg.text;
  }

  private getMessage(level: LogLevel, ...args: any[]): LogMessage {
    return {
      level: level,
      module: this.module,
      text: args.reduce((sum, arg) => sum + ' ' + arg, '[' + Logger.getLevelName(level) + ' - ' + this.module + ']'),
    }
  }

  private static getLevelName(level: LogLevel): string {
    return Logger.levels[level] ? Logger.levels[level].name : 'Unknown';
  }

  private static addMessage(msg) {
    Logger.messages.push(msg);
    while (Logger.messages.length > MAX_LOG_SIZE) {
      Logger.messages.shift();
    }
  }
}

@Injectable()
export class LogManagerProvider {

  constructor(public modalCtrl: ModalController) {
    console.log('Hello LoggerProvider Provider');
  }

  get(module: string, level: LogLevel): LogMessage[] {
    return Logger.messages.filter(msg => {
      return msg.level >= level && (module === 'all' ? true : msg.module === module);
    }).reverse();
  }

  show() {
    let profileModal = this.modalCtrl.create('LogViewerPage');

    profileModal.onDidDismiss(data => {
      void (data);
    });

    return profileModal.present();
  }
}
