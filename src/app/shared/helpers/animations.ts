import {
    trigger,
    state,
    style,
    animate,
    transition,
    query,
    keyframes,
} from '@angular/animations';
export const routerAnimation = trigger('routerAnimation', [
    transition(
        'template => market', [
            // Initial state of new route
            query(':enter',
                style({
                    position: 'fixed',
                    width: '100%',
                    transform: 'translateX(10%)',
                    opacity: 0
                }),
                { optional: true }),

            // move page off screen right on leave
            query(':leave',
                animate('150ms 0s cubic-bezier(.64,.41,.32,.65)',
                    keyframes([
                        style({ opacity: 1, transform: 'translateX(0%)', offset: 0 }),
                        style({
                            opacity: .8, transform: 'translateX(-2%)', offset: 0.2, position: 'fixed',
                            width: '100%',
                        }),
                        style({
                            opacity: .6, transform: 'translateX(-4%)', offset: 0.4, position: 'fixed',
                            width: '100%',
                        }),
                        style({
                            opacity: .4, transform: 'translateX(-6%)', offset: 0.6, position: 'fixed',
                            width: '100%',
                        }),
                        style({
                            opacity: .2, transform: 'translateX(-8%)', offset: 0.8, position: 'fixed',
                            width: '100%',
                        }),
                        style({
                            opacity: 0, transform: 'translateX(-10%)', offset: 1, position: 'fixed',
                            width: '100%',
                        })
                    ])

                ),
                { optional: true }),

            // move page in screen from left to right
            query(':enter',
                animate('150ms 0s cubic-bezier(.64,.41,.32,.65)',
                    keyframes([
                        style({ opacity: 0, transform: 'translateX(10%)', offset: 0, width: '100%', position: 'fixed' }),
                        style({ opacity: .5, transform: 'translateX(5%)', offset: 0.5, width: '100%', position: 'fixed' }),
                        style({ opacity: 1, transform: 'translateX(0)', offset: 1.0, width: '100%', position: 'fixed' })
                    ])
                ),
                { optional: true }),
        ]
    ),
    transition(
        'market => template', [
            // Initial state of new route
            query(':enter',
                style({
                    position: 'fixed',
                    width: '100%',
                    transform: 'translateX(-10%)',
                    opacity: 0

                }),
                { optional: true }),

            // move page off screen right on leave
            query(':leave',
                animate('150ms 0s cubic-bezier(.64,.41,.32,.65)',
                    keyframes([
                        style({ opacity: 1, transform: 'translateX(0%)', offset: 0, width: '100%', position: 'fixed' }),
                        style({ opacity: .6, transform: 'translateX(5%)', offset: 0.5, width: '100%', position: 'fixed' }),
                        style({ opacity: 0, transform: 'translateX(10%)', offset: 1.0, width: '100%', position: 'fixed' })
                    ])

                ),
                { optional: true }),

            // move page in screen from left to right
            query(':enter',
                animate('150ms 0s cubic-bezier(.64,.41,.32,.65)',
                    keyframes([
                        style({ opacity: 0, transform: 'translateX(-10%)', offset: 0, width: '100%', position: 'fixed' }),
                        style({
                            opacity: .5, transform: 'translateX(-5%)', offset: 0.5, position: 'fixed',
                            width: '100%',
                        }),
                        style({
                            opacity: 1, transform: 'translateX(0)', offset: 1.0, position: 'fixed',
                            width: '100%',
                        })
                    ])
                ),
                { optional: true }),
        ]
    )
]);

export const slideDown = trigger('slideDown', [
    transition(
        '* => rightToLeftSlideIn', [
            animate('150ms 0s cubic-bezier(.64,.41,.32,.65)',
                keyframes([
                    style({ opacity: 0, transform: 'translateX(10%)', offset: 0, width: '100%', position: 'fixed' }),
                    style({ opacity: .5, transform: 'translateX(5%)', offset: 0.5, width: '100%', position: 'fixed' }),
                    style({ opacity: 1, transform: 'translateX(0)', offset: 1.0, width: '100%', position: 'fixed' })
                ])
            ),
        ]
    )
]);

export const slideUp = trigger('slideUp', [
    transition(
        '* => rightToLeftSlideIn', [
            animate('150ms 0s cubic-bezier(.64,.41,.32,.65)',
                keyframes([
                    style({ opacity: 0, transform: 'translateX(10%)', offset: 0, width: '100%', position: 'fixed' }),
                    style({ opacity: .5, transform: 'translateX(5%)', offset: 0.5, width: '100%', position: 'fixed' }),
                    style({ opacity: 1, transform: 'translateX(0)', offset: 1.0, width: '100%', position: 'fixed' })
                ])
            ),
        ]
    )
]);

export const rightToLeftSlideIn = trigger('rightToLeftSlideIn', [
    transition(
        '* => rightToLeftSlideIn', [
            animate('150ms 0s cubic-bezier(.64,.41,.32,.65)',
                keyframes([
                    style({ opacity: 0, transform: 'translateX(10%)', offset: 0, width: '100%', position: 'fixed' }),
                    style({ opacity: .5, transform: 'translateX(5%)', offset: 0.5, width: '100%', position: 'fixed' }),
                    style({ opacity: 1, transform: 'translateX(0)', offset: 1.0, width: '100%', position: 'fixed' })
                ])
            ),
        ]
    )
]);

export const LeftToRightSlideIn = trigger('LeftToRightSlideIn', [
    transition(
        '* => LeftToRightSlideIn', [
            animate('150ms 0s cubic-bezier(.64,.41,.32,.65)',
                keyframes([
                    style({ opacity: 0, transform: 'translateX(-10%)', offset: 0, width: '100%', position: 'fixed' }),
                    style({ opacity: .5, transform: 'translateX(-5%)', offset: 0.5, width: '100%', position: 'fixed' }),
                    style({ opacity: 1, transform: 'translateX(0%)', offset: 1.0, width: '100%', position: 'fixed' })
                ])
            ),
        ]
    )
]);


export const leftToRightSlideOut = trigger('leftToRightSlideOut', [
    transition(
        '* => leftToRightSlideOut', [
            animate('150ms 0s cubic-bezier(.64,.41,.32,.65)',
                keyframes([
                    style({ opacity: 1, transform: 'translateX(0%)', offset: 0 }),
                    style({
                        opacity: .8, transform: 'translateX(2%)', offset: 0.2, position: 'fixed',
                        width: '100%',
                    }),
                    style({
                        opacity: .6, transform: 'translateX(4%)', offset: 0.4, position: 'fixed',
                        width: '100%',
                    }),
                    style({
                        opacity: .4, transform: 'translateX(6%)', offset: 0.6, position: 'fixed',
                        width: '100%',
                    }),
                    style({
                        opacity: .2, transform: 'translateX(8%)', offset: 0.8, position: 'fixed',
                        width: '100%',
                    }),
                    style({
                        opacity: 0, transform: 'translateX(10%)', offset: 1, position: 'fixed',
                        width: '100%',
                    })
                ])
            ),
        ]
    )
]);

export const RightToLeftSlideOut = trigger('RightToLeftSlideOut', [
    transition(
        '* => RightToLeftSlideOut', [
            animate('150ms 0s cubic-bezier(.64,.41,.32,.65)',
                keyframes([
                    style({ opacity: 1, transform: 'translateX(0%)', offset: 0 }),
                    style({
                        opacity: .8, transform: 'translateX(-2%)', offset: 0.2, position: 'fixed',
                        width: '100%',
                    }),
                    style({
                        opacity: .6, transform: 'translateX(-4%)', offset: 0.4, position: 'fixed',
                        width: '100%',
                    }),
                    style({
                        opacity: .4, transform: 'translateX(-6%)', offset: 0.6, position: 'fixed',
                        width: '100%',
                    }),
                    style({
                        opacity: .2, transform: 'translateX(-8%)', offset: 0.8, position: 'fixed',
                        width: '100%',
                    }),
                    style({
                        opacity: 0, transform: 'translateX(-10%)', offset: 1, position: 'fixed',
                        width: '100%',
                    })

                ])
            ),
        ]
    )
]);

export const SlideDownAnimation = trigger('slideDown', [
    transition('void => down', [
        style({
            opacity: 0,
            marginTop: -10
        }),
        animate('150ms')
    ]),
    transition('down => none', [
        animate('150ms', style({
            opacity: 0,
            marginTop: -10
        }))
    ]),
]);

export const zooming = trigger('zooming', [
    state('void', style({})),
    transition(
        'void => *', [
            animate('300ms 0s cubic-bezier(.64,.41,.32,.65)',
                keyframes([
                    style({ width: 0, height: 0, offset: 0 , opacity: 0 }),
                    style({ width: '{{templateItemWidth}}px', height: '{{templateItemHeight}}px', offset: 0.6 ,
                     transform: 'scale(0.9,0.9)', opacity: 0 }),
                    style({width: '{{templateItemWidth}}px', height: '{{templateItemHeight}}px', offset: 1 ,
                    transform: 'scale(1,1)',  opacity: 1 }),
                ])
            ),
        ]
    )
]);

export const SlideUpAnimation = trigger('slideUp', [
    transition('void => up', [
        style({
            opacity: 0,
            marginTop: 10
        }),
        animate('150ms')
    ]),
    transition('up => none', [
        animate('150ms', style({
            opacity: 0,
            marginTop: 10
        }))
    ]),
]);

export const slideDownList = trigger('slideDownList', [
    transition('* => slideDownList', [
        animate('150ms 0s cubic-bezier(.26,.59,.95,.89)',
            keyframes([
                style({ opacity: 1, transform: 'translateY(0px)', offset: 0 }),
                style({
                    opacity: .8, transform: 'translateY(1px)', offset: 0.2,
                    width: '100%',
                }),
                style({
                    opacity: .6, transform: 'translateY(2px)', offset: 0.4,
                    width: '100%',
                }),
                style({
                    opacity: .4, transform: 'translateY(3px)', offset: 0.6,
                    width: '100%',
                }),
                style({
                    opacity: .2, transform: 'translateY(4px)', offset: 0.7,
                    width: '100%',
                }),
                style({
                    opacity: .1, transform: 'translateY(5px)', offset: 0.8,
                    width: '100%',
                }),
                style({
                    opacity: 0, transform: 'translateY(6px)', offset: 1,
                    width: '100%',
                })

            ])
        ),
    ]),
]);

export const slideUpLlist = trigger('slideUpList', [
    transition('slideDownList => slideUpList', [
        animate('250ms 0s cubic-bezier(.34,.26,.41,.78)',
            keyframes([
                style({ opacity: 0, transform: 'translateY(6px)', offset: 0, width: '100%' }),
                style({ opacity: .2, transform: 'translateY(5px)', offset: 0.3, width: '100%' }),
                style({ opacity: .5, transform: 'translateY(4px)', offset: 0.6, width: '100%' }),
                style({ opacity: .7, transform: 'translateY(2px)', offset: 0.7, width: '100%' }),
                style({ opacity: 1, transform: 'translateY(0px)', offset: 1.0, width: '100%' })
            ])
        ),
    ]),
]);
