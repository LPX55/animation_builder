import { Observable, Subject } from "rxjs";
import { Subscription } from "rxjs";
import { AppGlobals } from "./../../../global";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import "rxjs/add/observable/of";
import { timeout, catchError } from "rxjs/operators";
import { of } from "rxjs/observable/of";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private _surveyAPI = "http://survey.motionfactory.io";
  private _latestSurvey: any = {};
  constructor(private _http: HttpClient, private _appGlobals: AppGlobals) {}

  answerSurvey(answers: any[]): Observable<any> {
    const dataWatcher = new Subject<any>();
    const { name } = this._appGlobals.DBConnection.get("user").value();
    const answerSurveyResponse = this._http
      .post(
        `${this._surveyAPI}/answer-survey`,
        {
          email: name,
          url: "",
          survey_id: this._latestSurvey.survey._id,
          answers,
          where: "motion factory 3"
        },
        { responseType: "text" }
      )
      .subscribe(
        (data: any) => {
          if (data === "Thank you for your participation") {
            this._appGlobals.DBConnection.set(
              "user.answeredSurvey",
              true
            ).write();
            dataWatcher.next(true);
          } else {
            dataWatcher.next(false);
          }
        },
        error => {
          dataWatcher.next(false);
        }
      );
    return dataWatcher.asObservable();
  }

  shouldAnswerSurvey(): boolean {
    const { answeredSurvey } = this._appGlobals.DBConnection.get(
      "user"
    ).value();
    if (answeredSurvey) {
      return false;
    }
    return true;
  }

  getLatestSurvey(): Observable<any> {
    const dataWatcher = new Subject<any>();

    if (this._latestSurvey !== {}) {
      const { full_name, name } = this._appGlobals.DBConnection.get(
        "user"
      ).value();
      const checkSurveyResponse = this._http
        .post(`${this._surveyAPI}/check-survey`, {
          full_name: full_name || "",
          email: name,
          where: "motion factory 3"
        })
        .pipe(timeout(1850))
        .subscribe(
          (data: any) => {
            if (data && "survey" in data) {
              if (
                "steps" in data["survey"] &&
                data["survey"]["steps"].length > 0
              ) {
                this._latestSurvey = data;
                dataWatcher.next(data);
              } else {
                dataWatcher.next(false);
              }
            } else {
              dataWatcher.next(false);
            }
          },
          error => {
            if (error.status !== 400) {
              dataWatcher.next(false);
            } else {
              dataWatcher.next({ survey: {} });
            }
          }
        );
    } else {
      return Observable.of(this._latestSurvey);
    }
    return dataWatcher.asObservable();
  }
}
