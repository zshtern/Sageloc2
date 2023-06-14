import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StorageService} from '../storage/storage.service';
import {File} from '@ionic-native/file';
import {Platform} from 'ionic-angular';
import * as moment from 'moment';
import {sgtimestamp} from '../../utils/utils'
import {log} from "util";

let SGL_CHUNK_SIZE = 100;

/**
 * This service implements logging to file.
 */

@Injectable()
export class LogService {

  readonly prefix = '[LogService]';

  private logCache = [];
  //private _logToFile = undefined;
  readonly onDevice: boolean;
  private static initialized: boolean = false;
  private static failedToInit: boolean = false;
  private static file: File = new File();
  private static loggingQueue = [];
  private static dirName: string = "SageLogs";
  private static filePath: string;
  private static fileDirectory: string;
  private static fileName: string = "Log";
  private static fileExtension: string = ".txt";
  private static fileTimeFormat: string = "DDMMYY-hhmmss";
  private static logTimeFormat: string = "DD/MM/YY hh:mm:ss";
  private static logInterval = 5000;
  private intervalHandler;

  constructor(private platform: Platform,
              private http: HttpClient,
              private storageService: StorageService) {

    console.log(this.prefix, 'initialization');

    LogService.fileDirectory = this.getDataDirectory() + LogService.dirName;
    LogService.fileName = LogService.fileName + moment().format(LogService.fileTimeFormat) + LogService.fileExtension;
    LogService.filePath = LogService.fileDirectory + '/' + LogService.fileName;

    this.onDevice = this.platform.is('cordova');

    if (this.onDevice) {
      this.initializeLogging();
    }
  }

  private getDataDirectory() {
    if (this.platform.is('android')) {
      return LogService.file.externalDataDirectory;
    } else {
      return LogService.file.dataDirectory;
    }
  }

  private initializeLogging() {
    try {
      console.log(this.prefix, 'Initializing log file...', LogService.filePath);
      this.checkFileSystem()
        .then(() => this.checkLogDirectory())
        .then(() => this.checkLogFile())
        .then(() => {
          console.log(this.prefix, 'Log file was initialized.', LogService.filePath);
          LogService.initialized = true;
          LogService.failedToInit = false;
        })
        .then(() => this.startLogging())
        .catch(() => {
          console.error(this.prefix, 'Log file initialization was failed.');
          LogService.initialized = false;
          LogService.failedToInit = true;
        });
    } catch (e) {
      console.error(this.prefix, e);
    }
  }
  
  private createLogFileIfNeeded(fileExists: boolean) {
    if (fileExists) {
      return Promise.resolve();
    } else {
      return LogService.file.createFile(LogService.fileDirectory, LogService.fileName, true)
        .then((file) => {
          console.log(this.prefix, 'Log file was created:', file.name);
        })
        .catch((error) => {
          console.log(this.prefix, 'Failed to create log file; error: ' + error.code + ', message: ' + error.message);
          return Promise.reject(error);
        });
    }
  }

  private checkLogFile() {
    return LogService.file.checkFile(LogService.fileDirectory, LogService.fileName)
      .catch((error) => {
        console.log(this.prefix, 'Log file does not exist. Error: ' + error.code + ', message: ' + error.message);
        return false;
      })
      .then((existed) => this.createLogFileIfNeeded(existed));
  }

  private createLogDirectoryIfNeeded(dirExists: boolean) {
    if (dirExists) {
      return Promise.resolve();
    } else {
      return LogService.file.createDir(this.getDataDirectory(), LogService.dirName, true)
        .then((dir) => {
          console.log(this.prefix, 'Log directory was created:', dir.name);
        })
        .catch((error) => {
          console.error(this.prefix, 'Failed to create log directory. Error: ' + error.code + ', message: ' + error.message);
          LogService.failedToInit = true;
          return Promise.reject(error);
        });
    }
  }

  private checkLogDirectory() {
    return LogService.file.checkDir(this.getDataDirectory(), LogService.dirName)
      .catch((error) => {
        console.log(this.prefix, 'Log directory does not exist. Error: ' + error.code + ', message: ' + error.message);
        return false;
      })
      .then((existed) => this.createLogDirectoryIfNeeded(existed));
  }

  private checkFileSystem() {
    return LogService.file.getFreeDiskSpace()
      .then((freeSpace) => {
        console.log(this.prefix, 'Free space (in kilobytes) for log file: ' + freeSpace);
      })
      .catch((error) => {
        console.log(this.prefix, 'Failed to check free space. Error: ' + error);
        return Promise.reject(error);
      });
  }

  private startLogging() {
    // clearInterval(myVar);
    // setting interval for too short causes log lines to overlap each other
    this.intervalHandler = setInterval(() => {
      try {
        //console.log(this.prefix, 'Flushing log queue.', LogService.loggingQueue.length);
        this.writeLogLine();
      } catch (error) {
        console.error(this.prefix, 'Failed to write log line. Error: ' + error.code + ', message: ' + error.message);
      }
    }, LogService.logInterval);
  }

  /**
   * This function writes debug message to log file.
   *
   * @param message - debug message
   */
  public debug(message: string) {
    if (this.onDevice) {
        let logLine = sgtimestamp().toFixed(3) + ' ' + moment().format(LogService.logTimeFormat) + ': ' + message + '\n';
        LogService.loggingQueue.push(logLine);
        console.log(logLine);
    } else {
      // console.log(logLine);
    }
  }

  private writeLogLine() {
    if (!LogService.initialized) return;

    if (LogService.loggingQueue.length == 0) return;

    let chunk = LogService.loggingQueue.splice(0, SGL_CHUNK_SIZE).join('') + '.\n';

    LogService.file.writeFile(LogService.fileDirectory, LogService.fileName, chunk, {replace: true, append: true})
      .catch(error => {
        console.log(this.prefix, 'Failed to log. Error: ' + error.code + ', message: ' + error.message);
      })
      .then(() => this.writeLogLine());

  }

  /**
   * This function clear log cache.
   */
  public clearCache() {
    this.logCache = [];
  }

  /**
   * This function gets some log records from storage.
   *
   * @param index - start index
   * @param bulk - bulk size
   */
  public getLog(index: number, bulk: number): Promise<any> {

    const from = index * bulk + 1;
    const to = (index + 1) * bulk;

    if (this.logCache.length > 0) {
      return Promise.resolve(this.logCache.slice(from, to + 1));
    } else {
      return this.storageService.getByType('log-debug')
        .then((data) => {
          this.logCache = data.docs.sort((a, b) => b.timeStamp - a.timeStamp);
          return this.logCache.slice(from, to + 1)
        });
    }
  }

  /**
   * This function deletes log records from storage.
   */
  public deleteLog(): Promise<boolean> {
    return this.storageService.getByType('log-debug')
      .then((data) => {
        this.clearCache();
        return Promise.all(data.docs.map(doc => this.storageService.remove(doc)))
      })
      .then(() => true);
  }
}
