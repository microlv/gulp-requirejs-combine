'use strict';

var arrayTag = '[object Array]';

var requirejs = function (a, b, c) {
    var i = 0, filepath = '';
    if (Object.prototype.toString.call(a) === arrayTag) {
        for (i = 0; i < a.length; i++) {
            filepath = path.resolve(cwd + '\\' + opt.baseUrl + '\\' + mapConfig(a[i]));
            try {
                var data = fs.readFileSync(filepath, 'utf-8');
                var content = String(data);
                dependList.push({file: a[i], content: content, isDone: false});
                eval(content);
            } catch (e) {
                console.log(e);
            }
        }
    }
};

module.exports = requirejs;