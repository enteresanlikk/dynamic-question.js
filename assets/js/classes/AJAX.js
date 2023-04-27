class AJAX {
    static send(url, method, data, callback) {
        const xhr = new XMLHttpRequest();

        xhr.open(method, url, true);

        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(JSON.parse(xhr.responseText));
                } else {
                    console.error('AJAX error: ' + xhr.status);
                }
            }
        };

        xhr.send(JSON.stringify(data));
    }
}