import { findIntl, render } from "../render";

const observerConfig = {
    attributes: true,
    childList: true,
    subtree: true,
};

export const configureElement = nextTick => class extends HTMLElement {
    static get observedAttributes() {
        return ["intl"];
    }

    constructor() {
        super();

        this._isConnected = false;
        this._observer = null;
        this._dispose = () => {};
        this._fingerprint = null;
    }

    attributeChangedCallback(name, oldValue, value) {
        // FIXME: Do we actually need this master attribute or can we get by using
        //        `key`, `values` and `attribute` by themselves?
        //        Right now a collection of configs is supported to enable
        //        configuring multiple things at once, is this really necessary or
        //        does that try to solve too much?
        switch (name) {
        case "intl":
            if (this._fingerprint !== value) {
                this._fingerprint = value;

                if (this._isConnected) {
                    render(this);
                }
            } else {
                console.info("attributeChangedCallback: fingerprint didn't change");
            }
            return;
        default:
            throw new Error(`FATAL: Attribute "${name}" should not be watched!`);
        }
    }

    connectedCallback() {
        //console.log("<intl-element>.connectedCallback", this.children);

        const intl = findIntl(this);

        if (!intl) {
            // FIXME: We should probably fall back gracefully without an <intl-context>
            throw new Error(`FATAL: No <intl-context> could be found up in the tree.`);
        }

        // FIXME: Maybe having the `MutationObserver` is overkill?
        this._observer = new MutationObserver(list => {
            //console.log("> mutations on ", this, ":", list);
            //console.log('>>> A child or subtree node has been added or removed.');

            this._observer.disconnect();

            nextTick(() => {
                render(this);
                this._observer.observe(this, observerConfig);
            });
        });
        this._observer.observe(this, observerConfig);

        this._dispose = intl.subscribe(
            () => render(this)
        );
        nextTick(() => render(this));

        this._isConnected = true;
    }

    disconnectedCallback() {
        this._isConnected = false;
        this._observer.disconnect();
        this._observer = null;
        this._dispose();
        this._dispose = null;
        this._fingerprint = null;
    }
};

export const define = (registerElement, nextTick) => {
    registerElement("intl-element", configureElement(nextTick));
};

