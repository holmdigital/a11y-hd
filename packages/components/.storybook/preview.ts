import type { Preview } from "@storybook/react";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            // Enable accessibility testing
            element: "#storybook-root",
            config: {},
            options: {},
            manual: false,
        },
    },
};

export default preview;
