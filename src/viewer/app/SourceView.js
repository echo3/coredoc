/**
 * Source view pane.
 */
CoreDocViewer.SourcePane = Core.extend(Echo.ContentPane, {

    _msg: null,
    
    $construct: function(data) {
        this._msg = CoreDocViewer.getMessages();
        Echo.ContentPane.call(this, data);
        var url = this.render("url");
        if (url) {
            var conn = new Core.Web.HttpConnection(url, "GET");
            conn.addResponseListener(Core.method(this, this._responseListener));
            try {
                conn.connect();
            } catch (ex) {
                this.add(new Echo.Label({
                    text: this._msg["SourcePane.XHRError"]
                }));
            }
        }
    },
    
    _responseListener: function(e) {
        var source = e.source.getResponseText();
        source = source.replace(/\r\n/g, "\n");
        this.add(new CoreDocViewer.SourceView({
            code: source,
            startIndex: this.get("startIndex"),
            endIndex: this.get("endIndex")
        }));
    }
});

/**
 * SourceView component.  Displays formatted source code.
 */
CoreDocViewer.SourceView = Core.extend(Echo.Component, {

    componentType: "CoreDocViewer.SourceView"
});

/**
 * SourceView synchronization peer.
 */
CoreDocViewer.SourceViewSync = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("CoreDocViewer.SourceView", this);
    },
    
    _pre: null,
    
    renderAdd: function(update, parentElement) {
        var startIndex = this.component.get("startIndex");
        var endIndex = this.component.get("endIndex");
        var code = this.component.render("code", "");
        if (startIndex != null && endIndex != null) {
            code = code.substring(startIndex, endIndex)
        }
        this._pre = document.createElement("pre");
        if (CoreDocViewer.pref.syntaxHighlightEnabled) {
            code = code.replace(/</g, "&lt;");
            code = code.replace(/>/g, "&gt;");
            this._pre.innerHTML = prettyPrintOne(code, "js"); 
        } else {
            this._pre.appendChild(document.createTextNode(code));
        }
        parentElement.appendChild(this._pre);
    },
    
    renderDispose: function(update) {
        this._pre = null;
    },

    renderUpdate: function(update) {
        var element = this._pre;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false; // Child elements not supported: safe to return false.
    }
});

/**
 * Source code viewing window.
 * Retrieves arbitrary source code from URL.
 */
CoreDocViewer.SourceWindow = Core.extend(Echo.WindowPane, {

    _msg: null,

    $construct: function(classModel) {
        this._msg = CoreDocViewer.getMessages();

        var title = classModel.qualifiedName + " (" + classModel.fileName + ")",
            icon = null,
            url = "content/source/" + classModel.fileName; //FIXME hardcoded
    
        Echo.WindowPane.call(this, {
            icon: icon,
            iconInsets: "6px 10px",
            title: this._msg["SourceWindow.TitlePrompt"] + " " + title,
            styleName: "Default",
            width: "50em",
            height: "40em",
            maximizeEnabled: true,
            events: {
                close: function(e) {
                    e.source.parent.remove(e.source);
                }
            },
            children: [
                new CoreDocViewer.SourcePane({
                    font: { typeface: ["Courier New", "courier", "monospace"] },
                    url: url,
                    startIndex: classModel.startIndex,
                    endIndex: classModel.endIndex
                })
            ]
        });
    }
});

