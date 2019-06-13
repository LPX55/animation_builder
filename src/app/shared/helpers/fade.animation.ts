import {
  trigger,
  animate,
  transition,
  style,
  query
} from "@angular/animations";

// export const fadeAnimation = trigger("fadeAnimation", [
//   transition("* => *", [
//     query(":enter", [style({ opacity: 0 })], { optional: true }),

//     query(
//       ":leave",
//       [style({ opacity: 1 }), animate("1s", style({ opacity: 0 }))],
//       { optional: true }
//     ),

//     query(
//       ":enter",
//       [style({ opacity: 0 }), animate("1s", style({ opacity: 1 }))],
//       { optional: true }
//     )
//   ])
// ]);

export const fadeAnimation =
  // trigger name for attaching this animation to an element using the [@triggerName] syntax
  trigger("fadeAnimation", [
    // route 'enter and leave (<=>)' transition
    transition("*<=>*", [
      // css styles at start of transition
      style({ opacity: 0 }),

      // animation and styles at end of transition
      animate(".25s", style({ opacity: 1 }))
    ])
  ]);
