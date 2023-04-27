class DynamicQuestion {
    #stepCount = 1;
    #activeStep = 1;
    #resultItem = null;
    #templates = {
        result: document.querySelector('#_result').innerHTML,
        resultList: document.querySelector('#_resultList').innerHTML,
        resultListItem: document.querySelector('#_resultListItem').innerHTML,

        stepBarItem: document.querySelector('#_stepBarItem').innerHTML,

        question: document.querySelector('#_question').innerHTML,
        questionList: document.querySelector('#_questionList').innerHTML,
        questionListItem: document.querySelector('#_questionListItem').innerHTML,
    };

    constructor(data) {
        this.data = data || [];
    }

    init() {
        this.#reset();
        this.#events();
    }

    restart(e) {
        this.#reset();
    }

    #getStepCount() {
        return this.data.length;
    }

    #renderSteps() {
        const $questions = document.querySelector('#Questions');
        $questions.innerHTML = '';

        const html = [];
        for (const step of this.data) {
            const itemHtml = [];
            for (const answer of step.answers) {
                const questionListItemTemplate = new HTMLTemplate(this.#templates.questionListItem, {
                    ...this.#flattenObject(answer),
                    index: step.id
                });
                itemHtml.push(questionListItemTemplate.toString());
            }

            const questionListTemplate = new HTMLTemplate(this.#templates.questionList, {
                items: itemHtml.join('')
            });

            const questionTemplate = new HTMLTemplate(this.#templates.question, {
                ...step,
                list: questionListTemplate.toString()
            });

            html.push(questionTemplate.toString());
        }

        $questions.innerHTML = html.join('');
    }

    #renderStepBar() {
        const $bar = document.querySelector('#StepBar');
        $bar.innerHTML = '';

        this.#stepCount = this.#getStepCount();

        const html = [];
        for (let i = 1; i <= this.#stepCount; i++) {
            const templateItem = new HTMLTemplate(this.#templates.stepBarItem, {
                index: i,
                active_class: i === this.#activeStep ? 'active' : ''
            });

            html.push(templateItem.toString());
        }
        $bar.innerHTML = html.join('');
    }

    #renderResult(result) {
        const $result = document.querySelector('#Result');
        $result.innerHTML = '';

        const html = [];
        for (const item of result.list) {
            const resultListItemTemplate = new HTMLTemplate(this.#templates.resultListItem, this.#flattenObject(item));
            html.push(resultListItemTemplate.toString());
        }

        const resultListTemplate = new HTMLTemplate(this.#templates.resultList, {
            items: html.join('')
        });

        const resultTemplate = new HTMLTemplate(this.#templates.result, {
            ...this.#flattenObject(result),
            list: resultListTemplate.toString()
        });

        $result.innerHTML = resultTemplate.toString();
    }

    #getSelectedAnswer() {
        const $checked = document.querySelector('.data-step.active .cb:checked')
        if(!$checked) return {};

        const id = +$checked.getAttribute('data-id');

        const step = this.data[this.#activeStep - 1];

        const item = step.answers.find(a => a.id === id);

        if (item) {
            return item;
        }

        return {};
    }

    #renderButtons() {
        const index = this.#activeStep;
        const answer = this.#getSelectedAnswer();

        document.querySelector('#Prev').style.display = 'none';
        document.querySelector('#Next').style.display = 'none';
        document.querySelector('#Finish').style.display = 'none';

        if (answer?.hasOwnProperty('result')) {
            document.querySelector('#Finish').style.display = 'inline-block';
        } else {
            if (index === this.#stepCount) {
                document.querySelector('#Finish').style.display = 'inline-block';
            }

            if (index < this.#stepCount) {
                document.querySelector('#Next').style.display = 'inline-block';
            }
        }
        if (index > 1) {
            document.querySelector('#Prev').style.display = 'inline-block';
        }
    }

    #isValid() {
        const $step = document.querySelector('.data-step.active');
        const isChecked = $step.querySelector('input:is(:checked)') !== null;

        $step.classList.remove('error');

        if (!isChecked) {
            $step.classList.add('error');
            return false;
        }
        return true;
    }

    #showActiveStep() {
        document.querySelectorAll('.data-step').forEach(el => el.classList.remove('active'));

        document.querySelector(`[data-step='${this.#activeStep}']`).classList.add('active');
    }

    #render() {
        this.#renderSteps();
        this.#renderStep();
    }

    #renderStep() {
        this.#renderStepBar();
        this.#renderButtons();
        this.#showActiveStep();
    }

    #next(e) {
        if (this.#isValid()) {
            const answer = this.#getSelectedAnswer();

            if (answer.hasOwnProperty('result')) {
                this.#resultItem = answer.result;
                this.#finish();
            } else {
                if(answer.skipTo) {
                    this.#activeStep = answer.skipTo;
                } else {
                    this.#activeStep++;
                }

                this.#renderStep();
            }
        }
    }

    #prev(e) {
        document.querySelectorAll(`[data-step='${this.#activeStep}'] .cb`).forEach(el => el.checked = false);

        this.#activeStep--;

        this.#renderStep();
    }

    #finish(e) {
        document.querySelectorAll('.hide-on-results').forEach(el => {
            el.classList.add('hide');
            el.classList.remove('show');
        });
        document.querySelectorAll('.show-on-results').forEach(el => {
            el.classList.add('show');
            el.classList.remove('hide');
        });

        this.#submit();

        this.#renderResult(this.#resultItem);
    }

    #submit() {
        const $cb = document.querySelectorAll('.cb:checked');
        const data = [];
        for (const item of $cb) {
            data.push({
                id: +item.getAttribute('data-id'),
                value: item.value
            });
        }

        console.log(data);
    }

    #events() {
        document.querySelectorAll('.next-button').forEach(el => {
            el.addEventListener('click', this.#next.bind(this));
        });
        document.querySelector('#Prev').addEventListener('click', this.#prev.bind(this));
        document.querySelector('#Restart').addEventListener('click', this.restart.bind(this));
        document.querySelectorAll('.cb').forEach(el => {
            el.addEventListener('click', this.#renderButtons.bind(this));
        });
    }

    #reset() {
        this.#resultItem = null;
        this.#activeStep = 1;
        this.#stepCount = this.#getStepCount();

        this.#render();

        document.querySelectorAll('.hide-on-results').forEach(el => {
            el.classList.remove('hide');
            el.classList.add('show');
        });
        document.querySelectorAll('.show-on-results').forEach(el => {
            el.classList.remove('show');
            el.classList.add('hide');
        });
    }

    #flattenObject(obj) {
        const toReturn = {};

        for (const i in obj) {
            if (!obj.hasOwnProperty(i)) continue;

            if ((typeof obj[i]) == 'object') {
                const flatObject = this.#flattenObject(obj[i]);
                for (const x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue;

                    toReturn[i + '_' + x] = flatObject[x];
                }
            } else {
                toReturn[i] = obj[i];
            }
        }
        return toReturn;
    }
}