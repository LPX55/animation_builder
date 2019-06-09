import { AnimationCoreService } from './../../services/animation-core.service';
import { Component, OnInit, Input, ChangeDetectionStrategy} from '@angular/core';


@Component({
  selector: 'mf-animation-sidebar',
  templateUrl: './animation-sidebar.component.html',
  styleUrls: ['./animation-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationSidebarComponent implements OnInit {
  public sidebarItems = [
    {
      categoryName: 'Text Animation',
      categoryPath: this._animationCoreService.textBuilderSourceFolder,
      open: true
    }
    // {
    //   title: 'Favorite',
    //   open: false
    // }
  ];
  constructor(private _animationCoreService: AnimationCoreService) {}
  ngOnInit(): void {
  }

}
