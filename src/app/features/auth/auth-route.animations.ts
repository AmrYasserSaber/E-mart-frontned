import { animate, group, query, style, transition, trigger } from '@angular/animations';

const hostBase = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
};

/**
 * Horizontal slides only between authLogin and authRegister; other navigations use a short fade.
 */
export const authRouteAnimations = trigger('routeAnimations', [
  transition('authLogin => authRegister', [
    query(':enter, :leave', [style(hostBase)], { optional: true }),
    query(':leave', [style({ transform: 'translateX(0)' })], { optional: true }),
    query(':enter', [style({ transform: 'translateX(100%)' })], { optional: true }),
    group([
      query(':leave', [animate('300ms ease-in-out', style({ transform: 'translateX(-100%)' }))], {
        optional: true,
      }),
      query(':enter', [animate('300ms ease-in-out', style({ transform: 'translateX(0)' }))], {
        optional: true,
      }),
    ]),
  ]),
  transition('authRegister => authLogin', [
    query(':enter, :leave', [style(hostBase)], { optional: true }),
    query(':leave', [style({ transform: 'translateX(0)' })], { optional: true }),
    query(':enter', [style({ transform: 'translateX(-100%)' })], { optional: true }),
    group([
      query(':leave', [animate('300ms ease-in-out', style({ transform: 'translateX(100%)' }))], {
        optional: true,
      }),
      query(':enter', [animate('300ms ease-in-out', style({ transform: 'translateX(0)' }))], {
        optional: true,
      }),
    ]),
  ]),
  transition('void => *', [
    query(':enter', [style({ opacity: 0 }), animate('160ms ease-out', style({ opacity: 1 }))], {
      optional: true,
    }),
  ]),
  transition('* => void', [
    query(':leave', [animate('120ms ease-in', style({ opacity: 0 }))], { optional: true }),
  ]),
  transition('* => *', [
    query(':enter, :leave', [style({ position: 'relative' })], { optional: true }),
    query(':leave', [style({ opacity: 1 })], { optional: true }),
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    group([
      query(':leave', [animate('120ms ease-out', style({ opacity: 0 }))], { optional: true }),
      query(':enter', [animate('120ms ease-out', style({ opacity: 1 }))], { optional: true }),
    ]),
  ]),
]);
