import { CHANGE_LOCALE } from "../cmds";

export const configureContext = (nextTick, intlFactory) => class extends HTMLElement {
    constructor() {
        super();

        this._intl = null;
        this._onChangeLocale = null;
    }

    connectedCallback() {
        this._intl = intlFactory(this.getAttribute("context-key"));

        this._onChangeLocale = ({ detail = {} }) => {
            this._intl.changeLocale(detail.locale);
        };
        this.ownerDocument.addEventListener(
            CHANGE_LOCALE,
            this._onChangeLocale
        );
    }

    disconnectedCallback() {
        this.ownerDocument.removeEventListener(
            CHANGE_LOCALE,
            this._onChangeLocale
        );
        this._onChangeLocale = null;
        this._intl.dispose();
        this._intl = null;
    }
};

export const define = (registerElement, nextTick, intlFactory) => {
    registerElement("intl-context", configureContext(nextTick, intlFactory));
};
