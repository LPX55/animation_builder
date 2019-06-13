// import { Injectable } from "@angular/core";
// import {
//   ActivatedRouteSnapshot,
//   DetachedRouteHandle,
//   RouteReuseStrategy
// } from "@angular/router";

// interface IRouteConfigData {
//   reuse: boolean;
// }

// interface ICachedRoute {
//   handle: DetachedRouteHandle;
//   data: IRouteConfigData;
// }

// @Injectable()
// export class AppRouteReuseStrategy implements RouteReuseStrategy {
//   private routeCache = new Map<string, ICachedRoute>();

//   shouldReuseRoute(
//     future: ActivatedRouteSnapshot,
//     curr: ActivatedRouteSnapshot
//   ): boolean {
//     return future.routeConfig === curr.routeConfig;
//   }

//   shouldDetach(route: ActivatedRouteSnapshot): boolean {
//     const data = this.getRouteData(route);
//     return data && data.reuse;
//   }

//   store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
//     const url = this.getFullRouteUrl(route);
//     const data = this.getRouteData(route);
//     this.routeCache.set(url, { handle, data });
//     this.addRedirectsRecursively(route);
//   }

//   shouldAttach(route: ActivatedRouteSnapshot): boolean {
//     const url = this.getFullRouteUrl(route);
//     return this.routeCache.has(url);
//   }

//   retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
//     const url = this.getFullRouteUrl(route);
//     const data = this.getRouteData(route);
//     return data && data.reuse && this.routeCache.has(url)
//       ? this.routeCache.get(url).handle
//       : null;
//   }

//   private addRedirectsRecursively(route: ActivatedRouteSnapshot): void {
//     const config = route.routeConfig;
//     if (config) {
//       if (!config.loadChildren) {
//         const routeFirstChild = route.firstChild;
//         const routeFirstChildUrl = routeFirstChild
//           ? this.getRouteUrlPaths(routeFirstChild).join("/")
//           : "";
//         const childConfigs = config.children;
//         if (childConfigs) {
//           const childConfigWithRedirect = childConfigs.find(
//             c => c.path === "" && !!c.redirectTo
//           );
//           if (childConfigWithRedirect) {
//             childConfigWithRedirect.redirectTo = routeFirstChildUrl;
//           }
//         }
//       }
//       route.children.forEach(childRoute =>
//         this.addRedirectsRecursively(childRoute)
//       );
//     }
//   }

//   private getFullRouteUrl(route: ActivatedRouteSnapshot): string {
//     return this.getFullRouteUrlPaths(route)
//       .filter(Boolean)
//       .join("/");
//   }

//   private getFullRouteUrlPaths(route: ActivatedRouteSnapshot): string[] {
//     const paths = this.getRouteUrlPaths(route);
//     return route.parent
//       ? [...this.getFullRouteUrlPaths(route.parent), ...paths]
//       : paths;
//   }

//   private getRouteUrlPaths(route: ActivatedRouteSnapshot): string[] {
//     return route.url.map(urlSegment => urlSegment.path);
//   }

//   private getRouteData(route: ActivatedRouteSnapshot): IRouteConfigData {
//     return route.routeConfig && (route.routeConfig.data as IRouteConfigData);
//   }
// }

import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy
} from '@angular/router';

export class AppRouteReuseStrategy implements RouteReuseStrategy {
  public static handlers: { [key: string]: DetachedRouteHandle } = {};

  private static waitDelete: string;

  public static deleteRouteSnapshot(name: string): void {
    if (AppRouteReuseStrategy.handlers[name]) {
      delete AppRouteReuseStrategy.handlers[name];
    } else {
      AppRouteReuseStrategy.waitDelete = name;
    }
  }

  public shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (!route.routeConfig || route.routeConfig.loadChildren) {
      return false;
    }
    return true;
  }

  public store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle
  ): void {
    if (
      AppRouteReuseStrategy.waitDelete &&
      AppRouteReuseStrategy.waitDelete == this.getRouteUrl(route)
    ) {
      // 如果待删除是当前路由则不存储快照
      AppRouteReuseStrategy.waitDelete = null;
      return;
    }
    AppRouteReuseStrategy.handlers[this.getRouteUrl(route)] = handle;
  }

  public shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return (
      !!AppRouteReuseStrategy.handlers[this.getRouteUrl(route)] &&
      route.root.children[0].routeConfig.path !== 'auth'
    );
  }

  /** 从缓存中获取快照，若无则返回nul */
  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    if (!route.routeConfig) {
      return null;
    }
    if (
      route.routeConfig.loadChildren ||
      route.root.children[0].routeConfig.path === 'auth'
    ) {
      return null;
    }

    return AppRouteReuseStrategy.handlers[this.getRouteUrl(route)];
  }

  public shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return (
      future.routeConfig === curr.routeConfig &&
      JSON.stringify(future.params) === JSON.stringify(curr.params)
    );
  }

  private getRouteUrl(route: ActivatedRouteSnapshot) {
    return route['_routerState'].url.replace(/\//g, '_');
  }
}

// export interface IHandles {
//   [key: string]: DetachedRouteHandle;
// }

// export class AppRouteReuseStrategy implements RouteReuseStrategy {
//   private _handles: IHandles = {};

//   get handles(): IHandles {
//     return this._handles;
//   }

//   /**
//    * Determines if this route (and its subtree) should be detached to be reused later
//    * @since 0.0.1
//    * @public
//    * @param {object} route - active route
//    * @return {boolean}
//    */
//   shouldDetach(route: ActivatedRouteSnapshot): boolean {
//     const key = this._getKey(route);
//     const result = !(!route.routeConfig || route.routeConfig.loadChildren);
//     return result;
//   }

//   /**
//    * Stores the detached route
//    * @since 0.0.1
//    * @public
//    * @param {object} route - active route
//    * @param {object} handle - handel for route
//    * @return {void}
//    */
//   store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
//     const key = this._getKey(route);
//     this._handles[key] = handle;
//   }

//   /**
//    * Determines if this route (and its subtree) should be reattached
//    * @since 0.0.1
//    * @public
//    * @param {object} route - active route
//    * @return {boolean} result
//    */
//   shouldAttach(route: ActivatedRouteSnapshot): boolean {
//     const key = this._getKey(route);
//     const result = !!route.routeConfig && !!this._handles[key];
//     return result;
//   }

//   /**
//    * Retrieves the previously stored route
//    * @since 0.0.1
//    * @public
//    * @param {object} route - active route
//    */
//   // retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
//   //   if (!route.routeConfig) {
//   //     return null;
//   //   }
//   //   const key = this._getKey(route);
//   //   return this._handles[key];
//   // }
//   retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
//     if (!route.routeConfig) return null;
//     if (route.routeConfig.loadChildren || route.routeConfig.children)
//       return null;
//     return this._handles[route.routeConfig.path];
//   }

//   /**
//    * Determines if a route should be reused
//    * @since 0.0.1
//    * @public
//    * @param {object} future - active route
//    * @param {object} current - active route
//    * @return {boolean} true or false
//    */
//   shouldReuseRoute(
//     future: ActivatedRouteSnapshot,
//     current: ActivatedRouteSnapshot
//   ): boolean {
//     const futureKey = this._getKey(future);
//     const currentKey = this._getKey(current);
//     return futureKey === currentKey;
//   }

//   /**
//    * get url of route
//    * @since 0.0.1
//    * @public
//    * @param {object} route - active route
//    * @return {string} string of route url
//    */
//   private _getUrl(route: ActivatedRouteSnapshot): string {
//     if (route.url) {
//       if (route.url.length) {
//         return route.url.join("/");
//       } else {
//         if (typeof route.component === "function") {
//           return `[${route.component.name}]`;
//         } else if (typeof route.component === "string") {
//           return `[${route.component}]`;
//         } else {
//           return `[null]`;
//         }
//       }
//     } else {
//       return "(null)";
//     }
//   }

//   /**
//    * get key of active route
//    * @since 0.0.1
//    * @public
//    * @param {object} route - active route
//    * @return {string}
//    */
//   private _getKey(route: ActivatedRouteSnapshot): string {
//     return route.pathFromRoot.map(it => this._getUrl(it)).join("/");
//   }
// }
