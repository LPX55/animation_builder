import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mf-market-carousel',
  templateUrl: './market-carousel.component.html',
  styleUrls: ['./market-carousel.component.scss']
})
export class MarketCarouselComponent implements OnInit {
  // is mouse downed on carousel and its moving
  public isCarouselMoving = false;
  // mouse x position on starting of move
  public mouseStartOffsetX: any;
  // starting scroll left of carousel on mouse down
  public lastScrollLeft = 0;
  // can carousel be selected
  public canBeSelected = true;
  // items of carousel as object[]
  @Input() items: any;
  // when user click on a item of carousel
  @Output() doOnitemClicked: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    this.mouseStartOffsetX = false;


  }

  /**
   * on mouse down we set variable to starting moving
   * @return void
   */
  startCarouselMoving($event): void {
    this.isCarouselMoving = true;

    document.addEventListener('mousemove', this.carouselMoves.bind(this));
    document.addEventListener('mouseleave', this.finishCarouselMoving.bind(this));
    document.addEventListener('mouseup', this.finishCarouselMoving.bind(this));
  }

  /**
   * on mouse move we handle moving of mouse and change scroll left of carousel
   * @return void
   */
  carouselMoves($event): void {
    if (this.isCarouselMoving) {
      const tagsParent: Element = document.getElementsByClassName('carousel-holder')[0];
      if (this.mouseStartOffsetX === false) {
        this.mouseStartOffsetX = $event.pageX;
        this.lastScrollLeft = tagsParent.scrollLeft;
      }
      const delta = $event.pageX - this.mouseStartOffsetX;
      if (delta !== 0) {
        this.canBeSelected = false;
      }
      if ((tagsParent.scrollLeft + tagsParent.clientWidth > tagsParent.scrollWidth && delta < 0) ||
        (delta > 0 && tagsParent.scrollLeft === 0)) {
        return;
      }
      tagsParent.scrollLeft = this.lastScrollLeft - delta;
    }

  }

  /**
   * on mouse up we end moving by falsing variable
   * @return void
   */
  finishCarouselMoving(): void {
    const waitToFinish = 300;
    this.isCarouselMoving = false;
    this.mouseStartOffsetX = false;
    document.removeEventListener('mousemove', this.carouselMoves.bind(this));
    document.removeEventListener('mouseleave', this.finishCarouselMoving.bind(this));
    document.removeEventListener('mouseup', this.finishCarouselMoving.bind(this));
    setTimeout(() => {
      this.canBeSelected = true;
    }, waitToFinish);
  }

  /**
   * when user click on a item of carousel
   * @fire MarketCarouselComponent#doOnitemClicked
   * @param {string} caption - the caption of item
   * @return void
   */
  itemClicked(caption): void {
    if (this.canBeSelected) {
      this.doOnitemClicked.emit({ caption: caption });
    }
  }

}
