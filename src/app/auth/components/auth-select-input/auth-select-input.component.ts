import { Input, Output } from "@angular/core";
import {
  Component,
  OnInit,
  EventEmitter,
  HostListener,
  ViewChild,
  ElementRef
} from "@angular/core";

@Component({
  selector: "mf-auth-select-input",
  templateUrl: "./auth-select-input.component.html",
  styleUrls: ["./auth-select-input.component.scss"]
})
export class AuthSelectInputComponent implements OnInit {
  @Input("answers") answers: any[];
  @Input("question") question: string;
  @Input("selectedAnswers") selectedAnswers: string[];
  @Input("error") error: boolean;
  @Input("isMulti") isMulti: boolean;
  @Output("changed") changed: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild("dropDown") dropDown: ElementRef;
  @ViewChild("selectBox") selectBox: ElementRef;
  public answersBoxShow = false;
  private _shouldShowBoxAfterResize = false;
  private _resizeTimeout;
  constructor() {}

  ngOnInit() {}
  selectAnswer($event, answerID) {
    this.changed.emit(answerID);

    if (!this.isMulti) this.answersBoxShow = false;
  }

  getSelectedAnswers() {
    return !this.selectedAnswers || !this.selectedAnswers.length
      ? "Please select this field"
      : this.selectedAnswers
          .map(answer => this.answers.find(ans => ans._id === answer)["text"])
          .join(" , ");
  }

  clickedOnSelect($event) {
    this.answersBoxShow = !this.answersBoxShow;
    if (this.answersBoxShow) this.fitDropDown();
  }

  @HostListener("document:click", ["$event"]) clickedOutside($event) {
    let elementRefInPath = $event.path.find(
      e => e === this.selectBox.nativeElement
    );
    let DropDownRefInPath = $event.path.find(
      e => e === this.dropDown.nativeElement
    );
    if (!elementRefInPath && !DropDownRefInPath) {
      this.answersBoxShow = false;
    }
    // if (!this.dropDown.nativeElement.contains($event.target))
    //   this.answersBoxShow = false;
  }

  @HostListener("window:resize", ["$event"]) windowResize($event) {
    const animationEnds = 300;
    if (this.answersBoxShow) this._shouldShowBoxAfterResize = true;
    this.answersBoxShow = false;
    if (!this._resizeTimeout)
      setTimeout(() => {
        this.dropDown.nativeElement.style.bottom = "58px";
      }, animationEnds);
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = null;
    }
    this._resizeTimeout = setTimeout(() => {
      if (this._shouldShowBoxAfterResize) {
        this.fitDropDown();
        this.answersBoxShow = true;
        this._shouldShowBoxAfterResize = false;
      }
    }, 200);
  }

  fitDropDown() {
    setTimeout(() => {
      const dropDownElementPos = this.dropDown.nativeElement.getBoundingClientRect();
      if (dropDownElementPos.top !== 0) {
        if (178 + 55 + dropDownElementPos.bottom <= window.innerHeight) {
          this.dropDown.nativeElement.style.bottom = "auto";
        }
      }
    });
  }
}
