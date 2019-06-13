import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { TemplateItemComponent } from "./components/template-item/template-item.component";
import { TemplateListComponent } from "./components/template-list/template-list.component";
import { TemplatePackComponent } from "./components/template-pack/template-pack.component";
import { TemplateCoreService } from "./services/template-core.service";
import { TemplateRoutingModule } from "./template-routing.module";
import { SharedModule } from "../shared/shared.module";
import { PackDetailComponent } from "./components/pack-detail/pack-detail.component";
import { InformationComponent } from "./components/information/information.component";
import { RegisterComponent } from "./components/register/register.component";
import { LoginComponent } from "./components/login/login.component";
import { ForgotPasswordComponent } from "./components/forgot-password/forgot-password.component";
import { DropDownComponent } from "../shared/components/drop-down/drop-down.component";
import { RouteReuseStrategy } from "@angular/router";
import { AppRouteReuseStrategy } from "../shared/helper/reuse-strategy/route-reuse-strategy";
import { AddedFolderComponent } from "./components/added-folder/added-folder.component";
import { FooterComponent } from "./components/footer/footer.component";
import { ResizeComponent } from "./components/resize/resize.component";

@NgModule({
  imports: [
    CommonModule,
    TemplateRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  declarations: [
    TemplateListComponent,
    TemplatePackComponent,
    TemplateItemComponent,
    PackDetailComponent,
    InformationComponent,
    RegisterComponent,
    LoginComponent,
    ForgotPasswordComponent,
    AddedFolderComponent,
    FooterComponent,
    ResizeComponent,
    AddedFolderComponent
  ],
  providers: [TemplateCoreService]
})
export class TemplateModule {}
