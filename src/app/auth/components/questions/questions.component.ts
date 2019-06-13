import { Router } from "@angular/router";
import { AuthService } from "./../../services/auth.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "mf-questions",
  templateUrl: "./questions.component.html",
  styleUrls: ["./questions.component.scss"]
})
export class QuestionsComponent implements OnInit {
  public steps = [];
  public userAnswers = {};
  public currentStep = 0;
  public currentSurvey = {};
  public sendingDataLoading = false;
  public canSendData = false;

  constructor(private _authService: AuthService, private _router: Router) {
    const layerLoadElement: any = document.getElementsByClassName(
      "loadLayer"
    )[0];
    layerLoadElement.style.display = "block";
  }

  ngOnInit() {
    const layerLoadElement: any = document.getElementsByClassName(
      "loadLayer"
    )[0];
    const shouldAnswer = this._authService.shouldAnswerSurvey();
    this._authService.getLatestSurvey().subscribe(data => {
      if (data === false) {
        if (shouldAnswer) {
          this._router.navigate(["auth", "no-internet"]);
          layerLoadElement.style.display = "none";
        } else this.goToTemplate();
      } else if ("survey" in data) {
        if ("steps" in data.survey) {
          this.currentSurvey = data.survey;
          this.steps = this.currentSurvey["steps"];
          layerLoadElement.style.display = "none";
        } else {
          this.goToTemplate();
        }
      }
    });
  }

  goToTemplate() {
    this._router.navigate(["dashboard", "animation"]);
    setTimeout(() => {
      document.body.style.backgroundColor = "#262626";
      const layerLoadElement: any = document.getElementsByClassName(
        "loadLayer"
      )[0];
      layerLoadElement.style.display = "none";
    }, 500);
  }

  answerChanged(index, qID, answerID) {
    const isMulti = this.steps[this.currentStep].questions[index]["isMulti"];
    this.steps[this.currentStep].questions[index]["error"] = false;
    if (!this.userAnswers[qID]) this.userAnswers[qID] = [];
    if (!isMulti) this.userAnswers[qID] = [];
    const indexOfAnswerID = this.userAnswers[qID].indexOf(answerID);
    if (indexOfAnswerID > -1 && isMulti) {
      this.userAnswers[qID].splice(indexOfAnswerID, 1);
    } else {
      this.userAnswers[qID].push(answerID);
    }

    this.setCanSendData();
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      // if all question on that step were answered
      if (this.canSendData) {
        this.currentStep++;
        this.setCanSendData();
      }
    } else {
      this.sendingDataLoading = true;
      const normAnswers = Object.keys(this.userAnswers).map(key => ({
        question: key,
        answers: this.userAnswers[key]
      }));
      this._authService.answerSurvey(normAnswers).subscribe(isOK => {
        if (isOK) {
          this._router.navigate(["dashboard", "animation"]);
        } else {
          this._router.navigate(["auth", "no-internet"]);
        }
      });
    }
  }

  setCanSendData() {
    this.canSendData = !this.steps[this.currentStep].questions.filter(
      question =>
        !this.userAnswers[question._id] ||
        !this.userAnswers[question._id].length
    ).length;
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.canSendData = true;
    }
  }
}
