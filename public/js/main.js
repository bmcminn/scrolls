(function() {

    var $doc = document;
    var $win = window;

    var HBS = Handlebars;
    var MDit = window.markdownit();

    var events = {
        change: 'change'
    ,   blur:   'blur'
    ,   focus:  'focus'
    ,   update: 'update'
    };

    var components = {
        themeSelect:        'select[theme]'
    ,   editorContainer:    'editor'
    ,   renderTarget:       '[render]'
    };

    var db = {
        editorTheme: 'editorTheme'
    };



    var $themeSelect = $(components.themeSelect);
    var $renderTarget = $(components.renderTarget);



    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func, threshold, execAsap) {
        var timeout;
        return function debounced () {
            var obj = this, args = arguments;

            function delayed () {
                if (!execAsap) {
                    func.apply(obj, args);
                }

                timeout = null;
            }

            if (timeout) {
                clearTimeout(timeout);

            } else if (execAsap) {
                func.apply(obj, args);

            }

            timeout = setTimeout(delayed, threshold || interval);
        };
    };



    window.theme = localStorage.getItem(db.editorTheme) || 'monokai';


    var editor = ace.edit(components.editorContainer);

    editor.setTheme('ace/theme/' + window.theme);
    editor.setOption('wrap',  editor.getOption('wrap') === 'off')

    editor.getSession().setMode('ace/mode/markdown');


    function themeSelect(e) {
        localStorage.setItem(db.editorTheme, e.target.value);
        editor.setTheme('ace/theme/' + e.target.value);
    }

    $themeSelect.on(events.change, themeSelect);



    updateDoc();

    editor.getSession().on(events.change, function() {
        debounce(updateDoc, 200);
    });

    function updateDoc() {
        var content = editor.getSession().getValue();

        window.pageModel = jsyaml.loadFront(content, 'body');

        console.log(window.pageModel);

        content = HBS.compile(window.pageModel.body)(window.pageModel);

        content = MDit.render(content);


        $renderTarget.html(content);
    }


})()
