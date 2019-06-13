import { AppGlobals } from "../../../global";

import { generateAPI } from "../../shared/helpers/helper-functions";
import { HttpClient } from "@angular/common/http";
import { Injectable, Pipe, PipeTransform } from "@angular/core";
import { detachEmbeddedView } from "@angular/core/src/view";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

@Injectable()
export class MarketDataService {
  /**
   * check detail is open its use in @function openDetail
   * @public
   */
  public isDetailOpen = false;
  /**
   * get market detail its use in @function openDetail
   * @public
   */
  public marketDetails: any;
  /**
   * id of market its use in @function findCurrentObjectsByID
   * @public
   */
  public id = "";
  /**
   * object that include pack its use in @function getDataByCategory, getPackData, findCurrentObjectsByID
   * @public
   */
  public packs: any = [
    {
      thumbnailURL: "assets/transparent.png",
      title: "",
      tags: [],
      category: ""
    },
    {
      thumbnailURL: "assets/transparent.png",
      title: "",
      tags: [],
      category: ""
    },
    {
      thumbnailURL: "assets/transparent.png",
      title: "",
      tags: [],
      category: ""
    },
    {
      thumbnailURL: "assets/transparent.png",
      title: "",
      tags: [],
      category: ""
    }
  ];
  /**
   * object that include market object its use in @function getCurrentId
   * @public
   */
  public marketObject = [];
  /**
   * show error its use in @function getData
   * @public
   */
  public showError = false;
  /**
   * object that include market detail its use in @function getPackData
   * @public
   */
  public details = [];
  /**
   * show current market page its use in @function currentMarketPage in market list
   * @public
   */
  public currentMarketPage = "pack";
  /**
   * actived tags
   * @public
   */
  public activedTags = [];
  /**
   * current tags read from online db
   * @public
   */
  public tags = [
    { caption: "", thumbnail: "assets/transparent.png", active: false },
    { caption: "", thumbnail: "assets/transparent.png", active: false },
    { caption: "", thumbnail: "assets/transparent.png", active: false },
    { caption: "", thumbnail: "assets/transparent.png", active: false },
    { caption: "", thumbnail: "assets/transparent.png", active: false },
    { caption: "", thumbnail: "assets/transparent.png", active: false }
  ];

  /**
   * use for type of market list animation its use in @function filterPacksByRoute
   * @public
   */
  public sideUpDownAnimation = "slideUpList";
  /**
   * type of filter in market list its use in @function filterPacksByRoute
   * @public
   */
  public filterToRoute = "new";

  public filterToMarketRoute = "detail";
  /**
   * animation mode its use in @function openDetails , changeToMarketPack
   * @public
   */
  public animationMode = "LeftToRightSlideIn";
  /**
   * last market detail that opened
   * @public
   */
  public currentMarketDetail: any;
  constructor(
    private _http: HttpClient,
    private _router: Router,
    private _appGlobals: AppGlobals
  ) {}

  /**
   * Check the data stored in database or not
   * @since 0.0.1
   * @private
   * @return {boolean}
   */
  private isDataExistsInDatabase(): boolean {
    const marketData = this._appGlobals.DBConnection.has("marketData").value();
    if (false === marketData) {
      return false;
    }
    return true;
  }

  /**
   * read market json and error handler it.
   * @since 0.0.1
   * @public
   * @return {Promise}
   */
  getData(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isDataExistsInDatabase() && this.isMarketDataExpired()) {
        this.readMarketData();
        resolve();
      } else {
        this._http.get(generateAPI("packages/all")).subscribe(
          (response: any) => {
            if ("tags" in response) {
              response.tags = response.tags.map(tag => {
                return {
                  caption: tag.caption,
                  thumbnail: tag.thumbnail_url,
                  active: false
                };
              });
            }
            this.setMarketData(response);
            resolve();
          },
          (error: Response) => {
            this.showError = true;
            reject();
          }
        );
      }
    });
  }

  /**
   * Check the data difference from last time that given data
   * This function prevent from send repetitious request
   * @since 0.0.1
   * @private
   * @return {boolean}
   */
  private isMarketDataExpired(): boolean {
    const isSetlastTimeFetchData = this._appGlobals.DBConnection.has(
      "appUpdateTime.market"
    ).value();
    if (false === isSetlastTimeFetchData) {
      return false;
    }
    const timeDiff = Math.abs(
      new Date().getTime() -
        this._appGlobals.DBConnection.get("appUpdateTime.market").value()
    );
    const diffDays = Math.floor(timeDiff / (1000 * 10 * 60));
    if (diffDays >= 1) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Get market data based on pack categories
   * @since 0.0.1
   * @public
   * @return {void}
   */
  getDataByCategory(category: string): void {
    this.readMarketData();
    this.packs = this.packs.filter(pack => {
      return pack.category.split(",").includes(category);
    });
  }

  /**
   * get pack and detail.
   * @since 0.0.1
   * @public
   * @return {void} */

  getPackData(response): void {
    this.packs = [];
    if (response && "packs" in response) {
      this.showError = false;
      this.packs = response.packs;
      if ("tags" in response) this.tags = response.tags;
    }
  }

  /**
   * read market cookie.
   * @since 0.0.1
   * @public
   * @return {void}
   */
  readMarketData(): void {
    const response = this._appGlobals.DBConnection.get("marketData").value();
    this.getPackData(response);
  }

  /**
   * set market cookie.
   * @since 0.0.1
   * @public
   * @return {void}
   */
  setMarketData(response): void {
    this._appGlobals.DBConnection.set("marketData", response).write();
    this._appGlobals.DBConnection.set("appUpdateTime", {
      market: new Date().getTime()
    }).write();
    this.getDataByCategory("new");
  }

  /**
   * get id and return details.
   * @since 0.0.1
   * @public
   * @param {Array} packs-  market packs
   * @param {string} id-  market id
   * @return {object} details object
   */
  findCurrentObjectsByID(packs, id): any {
    const marketId = Number(id);
    return packs.filter(x => x.id === marketId);
  }

  /**
   * get id and return details.
   * @since 0.0.1
   * @public
   * @param {string} id-  market id
   * @return {void}
   */
  getCurrentId(id): void {
    this.marketObject = this.findCurrentObjectsByID(this.packs, id);
  }

  /**
   * set variable of market detail.
   * @since 0.0.1
   * @public
   * @param {string} details-  details of market
   */
  openDetail(details): void {
    this.isDetailOpen = true;
    this.marketDetails = details;
  }
}
