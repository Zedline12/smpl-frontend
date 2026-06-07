"use client";

import { useEffect } from "react";
import "driver.js/dist/driver.css";

export function HomeTour() {
  useEffect(() => {
    if (localStorage.getItem("homeTourDone") === "true") return;

    let driverInstance: ReturnType<typeof import("driver.js")["driver"]> | null = null;

    import("driver.js").then(({ driver }) => {
      driverInstance = driver({
        animate: true,
        overlayOpacity: 0.5,
        smoothScroll: true,
        onDestroyStarted: () => {
          localStorage.setItem("homeTourDone", "true");
          driverInstance?.destroy();
        },
        steps: [
          {
            element: "#tour-navbar",
            popover: {
              title: "Navigation bar",
              description: "Check your credits, manage your plan, and access account settings from here.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#tour-sidebar",
            popover: {
              title: "Sidebar",
              description: "Jump between Create, your Projects, and Assets. Get more credits at any time.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "#tour-prompt-composer",
            popover: {
              title: "Prompt Section",
              description: "Describe what you want to generate — pick a model, set your options, and hit Create.",
              side: "top",
              align: "center",
            },
          },
        ],
      });

      driverInstance.drive();
    });

    return () => {
      driverInstance?.destroy();
    };
  }, []);

  return null;
}
