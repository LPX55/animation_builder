import { Router, NavigationEnd } from '@angular/router';

/**
 * class for definition scroll elemet and scroll position
 * @since 0.0.1
 * @public
 */
class ElementScroll {
    element: HTMLElement;
    scroll: number;
}

/**
 * class for definition scroll store element
 * @since 0.0.1
 * @public
 */
class ScrollStoreConfig {
    componentContext: any;
    router: Router;
    route: string;
    storage: {
        [key: string]: ElementScroll
    };
}

/**
 * class for store scroll provider
 * @since 0.0.1
 * @public
 */
export class ScrollStoreProvider {
    public config: ScrollStoreConfig = <ScrollStoreConfig>{};
    constructor(options: {
        compContext: any,
        router: Router,
        route: string
    }) {
        this.config.componentContext = options.compContext;
        this.config.router = options.router;
        this.config.route = options.route;
        this.config.storage = {};
        this.config.router.events.subscribe((event: NavigationEnd) => {
            if (event instanceof NavigationEnd && event.url.includes(this.config.route)) {
                setTimeout(() => {
                    this.restoreAll();
                });
            }
        }, (error) => {
        });
    }

    /**
   * get scroll informatiom an scroll top position
   * @since 0.0.1
   * @public
   * @return {void}
   */
    restoreAll(): void {
        Object.keys(this.config.storage).map((key: string) => {
            const scrollInfo = this.config.storage[key];
            scrollInfo.element.scrollTop = scrollInfo.scroll;
        });
    }

    /**
   * store scroll position
   * @since 0.0.1
   * @public
   * @param {string} key - key of element
   * @param {HTMLElement} element - html element
   * @return {void}
   */
    storeScroll(key: string, element: HTMLElement): void {
        this.config.storage[key] = <ElementScroll>{
            element,
            scroll: element.scrollTop
        };
    }

    /**
     * handel scroll
     * @since 0.0.1
     * @public
     * @param {string} key - key of element
     * @param {HTMLElement} element - html element
     * @return {void}
     */
    handleScroll(key: string, element: HTMLElement): void {
        const providerRef = this;
        element.addEventListener('scroll', () => {
            providerRef.storeScroll(key, element);
        });
    }
}
