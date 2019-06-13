import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from "@angular/core";

@Component({
  selector: "mf-auth-button",
  templateUrl: "./auth-button.component.html",
  styleUrls: ["./auth-button.component.scss"]
})
export class AuthButtonComponent implements OnInit {
  @Input("text") text: string;
  @Input("loading") loading: boolean;
  @Input("icon") icon: string;
  @Input("backgroundColor") backgroundColor: string[];
  @Input("textColor") textColor: string[];
  @Input("type") type: string;
  @Input("borderColor") borderColor: string[];
  @Input("loadingColor") loadingColor: string;
  @Input("disabled") disabled: string;
  public isHovered = false;
  @Output("clicked") clicked: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit() {
    if (!this.loadingColor) this.loadingColor = "#fff";
  }
  buttonClicked() {
    this.clicked.emit();
  }
}
