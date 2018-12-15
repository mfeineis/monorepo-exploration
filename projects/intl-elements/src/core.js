import OriginalIntlMessageFormat from "intl-messageformat/src/main";
import memoizeFormatConstructor from "intl-format-cache/src/memoizer";

import {
    defaultTo,
    forEach,
    has,
    head,
    pipe,
    split,
    without,
} from "ramda";

const IntlMessageFormat = memoizeFormatConstructor(OriginalIntlMessageFormat);

export const DEFAULT_LOCALE = "en-US";

export const extractLanguage = pipe(
    defaultTo(DEFAULT_LOCALE),
    split("-"),
    head,
);

export const DEFAULT_LANG = extractLanguage(DEFAULT_LOCALE);

export const DEFAULT_SUPPORT = {
    [DEFAULT_LANG]: DEFAULT_LOCALE,
    [DEFAULT_LOCALE]: DEFAULT_LOCALE,
};

export const isThenable = it => it.then && typeof it.then === "function";

export const toThenable = it => isThenable(it) ? it : Promise.resolve(it);

// FIXME: Actually validate configuration
export const sanitizeConfig = (config, baseConfig) => {
    const {
        includeLangSettings,
        setDocumentLang,
    } = baseConfig;
    config.includeLangSettings = config.includeLangSettings || includeLangSettings;
    config.supportedLocales = toThenable(config.supportedLocales || DEFAULT_SUPPORT);
    config.setDocumentLang = config.setDocumentLang || setDocumentLang;
    return config;
};

// FIXME: Actually patch messages
export const patchMessages = (defaultMessages, messages) => messages;

export const requestTranslation = (request, loadSupport, state, desiredLocale) => (
    loadSupport.then(supportedLocales => {
        const locale = supportedLocales[desiredLocale];

        if (state.allMessages[locale]) {
            return Promise.resolve({
                fromCache: true,
                locale,
                messages: state.allMessages[locale],
                supportedLocales,
            });
        }

        return request(locale).then(messages => {
            state.allMessages[locale] = messages;
            return {
                fromCache: false,
                locale,
                messages,
                supportedLocales,
            };
        });
    })
);

export const notifySubscribers = (api, subscriptions) => (
    forEach(notify => notify(api), subscriptions)
);

// FIXME: Actually handle error
export const handleRequestError = error => console.error(error);

// FIXME: Actually validate subscription
export const validateSubscription = sub => sub;

export const notifyReady = (api, subscriptions) => {
    forEach(notify => notify(api), subscriptions);
    return [];
};

export const switchTranslation = (api, config, state, desiredLocale) => (
    requestTranslation(
        config.loadTranslation,
        config.supportedLocales,
        state,
        desiredLocale
    ).then(response => {
        const {
            fromCache,
            locale,
            messages,
            supportedLocales,
        } = response;
        console.log(locale, "->", response);

        const patched = patchMessages(
            state.allMessages[state.defaultLocale] || {},
            messages,
        );

        state.locale = locale;
        state.messages = patched;
        state.allMessages[locale] = patched;

        const lang = extractLanguage(locale);
        const isDefaultForLang = supportedLocales[lang] === locale;

        if (isDefaultForLang || !state.allMessages[lang]) {
            state.allMessages[lang] = patched;
        }

        config.includeLangSettings(lang);
        config.setDocumentLang(lang);

        state.isReady = true;
        return response;
    })
        .then(({ locale }) => {
            state.readySubscriptions = notifyReady(api, state.readySubscriptions);
            return locale;
        })
        .then(response => {
            notifySubscribers(api, state.subscriptions);
            return response;
        })
        .catch(error => handleRequestError(error))
);

export const sanitizeLocale = (support, defaultLocale, locale) => pipe(
    it => has(it, support) ? it : extractLanguage(it),
    it => has(it, support) ? support[it] : support[defaultLocale],
    defaultTo(DEFAULT_LOCALE),
)(locale);

export const configureApi = (config, state) => {
    const api = {
        changeLocale: unsafeLocale => (
            config.supportedLocales.then(supportedLocales => {
                const newLocale = sanitizeLocale(
                    supportedLocales,
                    state.defaultLocale,
                    unsafeLocale,
                );
                return switchTranslation(api, config, state, newLocale);
            })
        ),
        dispose: () => {
            state.subscriptions = [];
            state.readySubscriptions = [];
        },
        format: (key, values, formats) => {
            // FIXME: Validate message is really there?
            const message = state.messages[key];
            return new IntlMessageFormat(
                message,
                state.locale,
                formats,
            ).format(values);
        },
        // FIXME: It's probably better to raise a `CustomEvent` when the setup
        //        for `IntlElements` is complete.
        //ready: unsafeCallback => {
        //    const callback = validateSubscription(unsafeCallback);

        //    if (state.isReady) {
        //        callback(api);
        //    } else {
        //        state.readySubscriptions.push(callback);
        //    }
        //},
        subscribe: unsafeOnChange => {
            const onChange = validateSubscription(unsafeOnChange);

            state.subscriptions.push(onChange);

            return () => (
                state.subscriptions = without(onChange, state.subscriptions)
            );
        },
    };

    return api;
};

export const configureCore = baseConfig => unsafeConfig => {
    const config = sanitizeConfig(unsafeConfig, baseConfig);
    const defaultLocale = config.defaultLocale || DEFAULT_LOCALE;

    const state = {
        allMessages: {
            [extractLanguage(defaultLocale)]: config.defaultMessages,
            [defaultLocale]: config.defaultMessages,
        },
        defaultLocale,
        isReady: false,
        locale: defaultLocale,
        messages: config.defaultMessages,
        readySubscriptions: [],
        subscriptions: [],
    };

    const api = configureApi(config, state);

    // FIXME: Remove internals in production
    api.__config__ = config;
    api.__state__ = state;

    switchTranslation(api, config, state, config.locale || defaultLocale);

    return api;
};

