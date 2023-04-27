class HTMLTemplate {
    constructor(template, config) {
        this.template = template;
        this.config = config;
    }

    toString() {
        const object = this.config || {};

        return this.template
            .replace(/{{(=?.*?)}}/g, function (m, $1) {
                $1 = $1.trim();

                return object[$1];
            }).replace(/undefined/g, "");
    }
}