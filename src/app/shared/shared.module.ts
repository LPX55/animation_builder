import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HeaderComponent } from "./components/header/header.component";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { GeneralButtonComponent } from "./components/general-button/general-button.component";
import { DropDownComponent } from "./components/drop-down/drop-down.component";
import { NoInternetComponent } from "./components/no-internet/no-internet.component";
import { TooltipComponent } from "./components/tooltip/tooltip.component";
import { MessageBoxComponent } from "./components/message-box/message-box.component";
import { MissingMessageBoxComponent } from "./components/missing-message-box/missing-message-box.component";
import { Routes, RouterModule, Router } from "@angular/router";
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  exports: [
    GeneralButtonComponent,
    NoInternetComponent,
    DropDownComponent,
    TooltipComponent,
    MessageBoxComponent,
    MissingMessageBoxComponent,
    ScrollingModule,
    DragDropModule,HeaderComponent
  ],
  imports: [
    CommonModule,
    ScrollingModule,
    DragDropModule,
    RouterModule
  ],
  providers: [],
  declarations: [
    GeneralButtonComponent,
    DropDownComponent,
    NoInternetComponent,
    TooltipComponent,
    MessageBoxComponent,
    MissingMessageBoxComponent,
    HeaderComponent
  ]
})
export class SharedModule {}
