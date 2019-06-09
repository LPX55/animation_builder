import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mf-animation-item-preview',
  templateUrl: './animation-item-preview.component.html',
  styleUrls: ['./animation-item-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationItemPreviewComponent implements OnInit {
  @Input() previewImageSrc = '';
  constructor(private _domSanitizer: DomSanitizer) { }

  get previewSrc(): any {
    return this._domSanitizer.bypassSecurityTrustUrl(this.previewImageSrc);
  }
  ngOnInit() {
  }

}
