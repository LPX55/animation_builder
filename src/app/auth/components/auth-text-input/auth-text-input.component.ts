import {
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor
} from "@angular/forms";
import { Input, Output, EventEmitter } from "@angular/core";
import {
  Component,
  OnInit,
  forwardRef,
  ElementRef,
  ViewChild
} from "@angular/core";

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AuthTextInputComponent),
  multi: true
};

@Component({
  selector: "mf-auth-text-input",
  templateUrl: "./auth-text-input.component.html",
  styleUrls: ["./auth-text-input.component.scss"],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class AuthTextInputComponent implements OnInit, ControlValueAccessor {
  @Input("name") name: string;
  @Input("type") type: string;
  @Input("error") error: boolean;
  @Input("formControlName") formControlName: string;
  @Input("formGroup") formGroup: FormGroup;
  @Output("changed") changed: EventEmitter<string> = new EventEmitter<string>();
  //The internal data model
  public value: string;

  //Placeholders for the callbacks which are later providesd
  //by the Control Value Accessor
  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: any) => void = () => {};

  constructor() {}

  ngOnInit() {}

  inputChanged($event) {
    this.onChangeCallback($event);
  }

  //Set touched on blur
  onBlur() {
    this.onTouchedCallback();
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    if (value !== this.value) {
      this.value = value;
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChangeCallback = $event => {
      this.changed.emit($event.target.value);
      fn($event.target.value);
    };
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
