import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnimationRoutingModule } from './animation-routing.module';
import { AnimationHomeComponent } from './components/animation-home/animation-home.component';
import { AnimationSidebarComponent } from './components/animation-sidebar/animation-sidebar.component';
import { AnimationContentComponent } from './components/animation-content/animation-content.component';
import { AnimationHeaderComponent } from './components/animation-header/animation-header.component';
import { AnimationCoreService } from './services/animation-core.service';
import {AnimationItemComponent} from './components/animation-item/animation-item.component';
import {AnimationItemLoaderComponent} from './components/animation-item-loader/animation-item-loader.component';
import { DropAreaComponent } from './components/drop-area/drop-area.component';
import { AnimationFilterComponent } from './components/animation-filter/animation-filter.component';
import { AnimationItemPreviewComponent } from './components/animation-item-preview/animation-item-preview.component';
import { AnimationCategoryComponent } from './components/animation-category/animation-category.component';

@NgModule({
  imports: [
    CommonModule,
    AnimationRoutingModule,
    SharedModule
  ],
  declarations: [
    AnimationSidebarComponent,
    AnimationContentComponent,
    AnimationHomeComponent,
    AnimationHeaderComponent,
    AnimationItemComponent,
    AnimationItemLoaderComponent,
    DropAreaComponent,
    AnimationFilterComponent,
    AnimationItemPreviewComponent,
    AnimationCategoryComponent
  ],
  providers: [
    AnimationCoreService,
  ]
})
export class AnimationModule { }
