import { RouterModule } from "@angular/router";
import { MarketDataService } from "./services/market-data.service";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { MarketListComponent } from "./components/market-list/market-list.component";
import { MarketPackDetailComponent } from "./components/market-pack-detail/market-pack-detail.component";
import { MarketPackComponent } from "./components/market-pack/market-pack.component";
import { MarketRoutingModule } from "./market-routing.module";
import { MarketCarouselComponent } from "./market-carousel/market-carousel.component";
import { SharedModule } from "../shared/shared.module";
import { MarketFilterComponent } from "./components/market-filter/market-filter.component";
import { MarketAuthorComponent } from "./components/market-author/market-author.component";

@NgModule({
  imports: [CommonModule, MarketRoutingModule, SharedModule, RouterModule],
  declarations: [
    MarketPackComponent,
    MarketPackDetailComponent,
    MarketListComponent,
    MarketFilterComponent,
    MarketCarouselComponent,
    MarketAuthorComponent
  ],
  providers: [MarketDataService]
})
export class MarketModule {}
