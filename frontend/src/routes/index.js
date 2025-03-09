import { Authentication, ResetPassword } from "~/pages";
import Default from "~/layouts/Default";
import config from "~/config";

const publicRoutes = [
  { path: config.routes.login, component: Authentication, layout: null },
  { path: config.routes.signup, component: Authentication, layout: null },
  {
    path: config.routes.resetPassword,
    component: ResetPassword,
    layout: null,
  },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
