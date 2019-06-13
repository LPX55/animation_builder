import { Input } from "@angular/core";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "mf-auth-error",
  templateUrl: "./auth-error.component.html",
  styleUrls: ["./auth-error.component.scss"]
})
export class AuthErrorComponent implements OnInit {
  @Input("errors") errors: string[];

  constructor() {}

  ngOnInit() {}
}
