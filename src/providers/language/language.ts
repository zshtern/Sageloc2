import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {TranslateService} from "@ngx-translate/core";
import {Platform, Config} from "ionic-angular";
import {Logger} from "../log-manager/log-manager";

const logger = new Logger('LanguageProvider');

export interface ILanguage {
  id: string;
  name: string;
  direction: 'rtl' | 'ltr';
}

@Injectable()
export class LanguageProvider {

  private languages: ILanguage[] = [
    {id: 'en', name: 'English', direction: 'ltr'},
    {id: 'he', name: 'Hebrew', direction: 'rtl'},
    {id: 'ru', name: 'Russian', direction: 'ltr'}
  ];

  private readonly defaultLanguage: ILanguage;

  constructor(private translate: TranslateService,
              private storage: Storage,
              private platform: Platform,
              private config: Config) {
    console.log(logger.debug('Constructed'));

    this.defaultLanguage = this.languages[0];
  }

  /**
   * This function initializes internationalization. It uses previous user choose or system settings to set
   * application language.
   */
  initialize() {
    // add supported languages
    this.translate.addLangs(this.languages.map((language) => language.id));

    console.log(logger.debug('Supported languages', this.translate.getLangs()));

    // set fallback language
    this.translate.setDefaultLang('en');

    // try to load application language specified by user
    return this.loadUserLanguage()
      .then((language) => this.useLanguage(language))
      .catch((error) => {
        console.error(logger.error(error));
        this.useLanguage(this.defaultLanguage);
      });
  }

  useLanguage(language: ILanguage) {
    console.log(logger.debug('Use ' + language.name + '.'));
    this.platform.setDir(language.direction, true);
    this.translate.use(language.id);
    this.translate.get('button.back')
      .subscribe((text) => {
        this.config.set('backButtonText', text);
      });
  }

  getLanguages(): ILanguage[] {
    return this.languages;
  }

  getLanguageById(id: string): ILanguage {
    return this.languages.filter((language) => language.id === id)[0] || this.languages[0];
  }

  /**
   * This function returns current language.
   */
  currentLanguage(): ILanguage {
    return this.getLanguageById(this.translate.currentLang);
  }

  guessUserLanguage(): ILanguage {
    console.log(logger.debug('Browser language is ' + this.translate.getBrowserLang() + '.'));
    return this.getLanguageById(this.translate.getBrowserLang());
  }

  loadUserLanguage(): Promise<ILanguage> {
    return this.storage.get('language')
      .then(language => {
        if (language) {
          console.log(logger.debug('Application language is ' + language + '.'));
          return this.getLanguageById(language);
        } else {
          console.log(logger.debug('Application language is undefined.'));
          return this.guessUserLanguage();
        }
      })
      .catch(error => {
        console.error(logger.error(error));
        return this.guessUserLanguage();
      });
  }

  saveUserLanguage(language: string): Promise<any> {
    return this.storage.set('language', language);
  }
}
