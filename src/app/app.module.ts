import { RavenErrorHandler } from './core/includes/error-handler/error-handler';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { AppRouteReuseStrategy } from './shared/helper/reuse-strategy/route-reuse-strategy';
import 'rxjs/add/operator/pairwise';
import { SharedModule } from './shared/shared.module';
import * as Raven from 'raven-js';
import { NgModule, ErrorHandler } from '@angular/core';
import { environment } from './../environments/environment';


const providers: any = [
  { provide: RouteReuseStrategy, useClass: AppRouteReuseStrategy },
];
if (environment.production) {
  Raven
    .config('https://0a1376ee15904298bde04ed3eae6e433@sentry.io/1250715')
    .install();
  providers.push({ provide: ErrorHandler, useClass: RavenErrorHandler });
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
  ],
  providers: providers,
  bootstrap: [AppComponent]
})
export class AppModule { }
