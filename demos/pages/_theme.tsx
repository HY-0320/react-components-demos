import React from "react";
import { createTheme, defaultSideNavs } from "vite-pages-theme-doc";

import Component404 from "./404";

const themeConfig = createTheme({
  logo: <div style={{ fontSize: "20px" }}>📘 Vite Pages</div>,
  topNavs: [
    {
      label: "Intruduction",
      path: "/",
      activeIfMatch: {
        path: "/:foo",
        end: true,
      },
    },
    {
      label: "Components",
      path: "/components/Button",
      activeIfMatch: "/components",
    },
  ],
  sideNavs: (ctx) => {
    return defaultSideNavs(ctx, {
      groupConfig: {
        components: {
          demos: {
            label: "Demos (dev only)",
            order: -1,
          },
          general: {
            label: "General",
            order: 1,
          },
          "data-display": {
            label: "Data Display",
            order: 2,
          },
        },
      },
    });
  },
  Component404,
});

export default themeConfig;
