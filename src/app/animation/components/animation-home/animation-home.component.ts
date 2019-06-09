import { Subscription } from 'rxjs';
import { AnimationCoreService } from './../../services/animation-core.service';
import { Component, OnInit, ViewChildren, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'mf-animation-home',
  templateUrl: './animation-home.component.html',
  styleUrls: ['./animation-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationHomeComponent implements OnInit, OnDestroy {
  public sectionToLoad: string;
  showDropArea = false;
  subscribeShowDropArea: Subscription;


  constructor(private route: ActivatedRoute, private router: Router,
    private _animationCoreService: AnimationCoreService, private _changeDetectorRef: ChangeDetectorRef) {
    this.subscribeShowDropArea = this._animationCoreService.showDropArea.subscribe((value) => {
      this.showDropArea = value;
      _changeDetectorRef.markForCheck();
    });
  }


  /**
   * here we add subscribe to query param element so we can listen to URL changes for loading other components
   * @return {void}
  */
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.subscribeShowDropArea.unsubscribe();
  }


  get animationFilter(): number {
    return this._animationCoreService.animationTypeFilter;
  }
}
