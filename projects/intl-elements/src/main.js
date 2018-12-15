import IntlMessageFormat from "intl-messageformat/src/main";

import { CHANGE_LOCALE } from "./cmds";
import { configureCore } from "./core";
import { define as defineContext } from "./intl/context";
import { define as defineElement } from "./intl/element";

const setDocumentLang = lang => {
    document.querySelector("html").setAttribute("lang", lang);
};

const TAG = `intl-${Date.now()}-${String(Math.random()).replace(/\D/g, '')}`;

const includeLangSettings = lang => {
    const attr = `data-intl-locale-include-${lang}-${TAG}`;
    if (document.querySelector(`[${attr}]`)) {
        return;
    }

    const localeInclude = document.createElement("script");
    localeInclude.setAttribute(attr, "");
    localeInclude.src = `https://cdnjs.cloudflare.com/ajax/libs/intl-messageformat/2.2.0/locale-data/${lang}.js`;
    document.querySelector("head").appendChild(localeInclude);
};

const registerElement = (tag, Element, options) => (
    window.customElements.define(tag, Element, options)
);

// FIXME: `nextTick` shouldn't be necessary, remove it!
const nextTick = fn => window.setTimeout(fn, 1);

const intlFactory = configureCore({
    includeLangSettings,
    setDocumentLang,
});

const contextLookup = {};

defineContext(registerElement, nextTick, key => {
    // FIXME: Check that the context is actually there!
    return intlFactory(contextLookup[key]);
});
defineElement(registerElement, nextTick);

const IntlElements = {
    // FIXME: Remove internals in PROD
    get __contexts__() {
        return contextLookup;
    },
    cmds: {
        CHANGE_LOCALE,
    },
    defineContext: config => {
        const key = config.key || `INTLCTX${String(Math.random()).replace(/\D/g, '')}`;
        // FIXME: Validate duplicated context definitions?
        contextLookup[key] = config;
        return key;
    },
    changeLocale: locale => (
        document.dispatchEvent(new CustomEvent(CHANGE_LOCALE, {
            detail: {
                locale,
            },
        }))
    ),
};

// We need to expose the constructor for dynamic locale data loading
window["IntlMessageFormat"] = IntlMessageFormat;

export default IntlElements;
