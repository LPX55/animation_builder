import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GeneralButtonComponent } from './components/general-button/general-button.component';
import { DropDownComponent } from './components/drop-down/drop-down.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  exports: [
    GeneralButtonComponent,
    DropDownComponent,
    TooltipComponent,
    MessageBoxComponent,
    ScrollingModule,
    DragDropModule
  ],
  imports: [
    CommonModule,
    ScrollingModule,
    DragDropModule
  ],
  providers: [],
  declarations: [
    GeneralButtonComponent,
    DropDownComponent,
    TooltipComponent,
    MessageBoxComponent,
  ]
})
export class SharedModule { }
