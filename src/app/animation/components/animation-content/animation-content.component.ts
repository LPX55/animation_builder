import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mf-animation-content',
  templateUrl: './animation-content.component.html',
  styleUrls: ['./animation-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationContentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
