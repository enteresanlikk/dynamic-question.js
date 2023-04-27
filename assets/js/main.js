document.addEventListener('DOMContentLoaded', function () {
    AJAX.send(config.dataUrl, 'GET', null, function (response) {
        const dynamicQuestion = new DynamicQuestion(response);
        dynamicQuestion.init();
    });
});