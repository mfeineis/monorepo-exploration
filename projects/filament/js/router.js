
export const configureRouter = (history, location, nextTick) => {
    const getFragment = () =>
        decodeURI(location.pathname + location.search).replace(/\?(.*)$/, '');

    const state = {
        activeRoute: null,
        enabled: true,
        lastFragment: null,
        routes: [],
    };

    const check = () => {
        const fragment = getFragment();

        if (fragment === state.lastFragment) {
            if (state.enabled) {
                nextTick(check);
            }

            return;
        }

        // console.log("[router] fragment changed", state.lastFragment, "->", fragment, state);

        loop: for (const route of state.routes) {
            const { routes } = route;

            // FIXME: Support regex matchers
            for (const matcher of routes) {
                if (fragment.indexOf(matcher) >= 0 && state.activeRoute !== route) {
                    state.activeRoute = route;
                    state.lastFragment = fragment;

                    // FIXME: Extract route info and pass it
                    route.handler({ test: "some-test-string" });
                    break loop;
                }
            }
        }

        if (state.enabled) {
            nextTick(check);
        }
    };

    check();

    return {
        add(routes, handler) {
            const entry = {
                handler,
                routes,
            };
            state.routes.push(entry);

            return () => {
                state.routes = state.routes.filter((it) => it !== entry);
            };
        },
    };
};
