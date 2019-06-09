import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export interface IHandles {
  [key: string]: DetachedRouteHandle;
}

export class AppRouteReuseStrategy implements RouteReuseStrategy {
  private _handles: IHandles = {};

  get handles(): IHandles {
    return this._handles;
  }

  /**
  * Determines if this route (and its subtree) should be detached to be reused later
  * @since 0.0.1
  * @public
  * @param {object} route - active route
  * @return {boolean}
  */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const key = this._getKey(route);
    const result = !(!route.routeConfig || route.routeConfig.loadChildren);
    return result;
  }

  /**
  * Stores the detached route
  * @since 0.0.1
  * @public
  * @param {object} route - active route
  * @param {object} handle - handel for route
  * @return {void}
  */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const key = this._getKey(route);
    this._handles[key] = handle;
  }

  /**
* Determines if this route (and its subtree) should be reattached
* @since 0.0.1
* @public
* @param {object} route - active route
* @return {boolean} result
*/
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this._getKey(route);
    const result = !!route.routeConfig && !!this._handles[key];
    return result;
  }

  /**
* Retrieves the previously stored route
* @since 0.0.1
* @public
* @param {object} route - active route
*/
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    if (!route.routeConfig) {
      return null;
    }
    const key = this._getKey(route);
    return this._handles[key];
  }

  /**
  * Determines if a route should be reused
  * @since 0.0.1
  * @public
  * @param {object} future - active route
  * @param {object} current - active route
  * @return {boolean} true or false
  */
  shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    const futureKey = this._getKey(future);
    const currentKey = this._getKey(current);
    return futureKey === currentKey;
  }

  /**
* get url of route
* @since 0.0.1
* @public
* @param {object} route - active route
* @return {string} string of route url
*/
  private _getUrl(route: ActivatedRouteSnapshot): string {
    if (route.url) {
      if (route.url.length) {
        return route.url.join('/');
      } else {
        if (typeof route.component === 'function') {
          return `[${route.component.name}]`;
        } else if (typeof route.component === 'string') {
          return `[${route.component}]`;
        } else {
          return `[null]`;
        }
      }
    } else {
      return '(null)';
    }
  }

  /**
* get key of active route
* @since 0.0.1
* @public
* @param {object} route - active route
* @return {string}
*/
  private _getKey(route: ActivatedRouteSnapshot): string {

    return route.pathFromRoot.map(it => this._getUrl(it)).join('/');
  }
}
