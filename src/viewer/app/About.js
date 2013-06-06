/**
 * Help/About Dialog.  Displays general application information, credits, and copyrights.
 */
CoreDocViewer.AboutDialog = Core.extend(Echo.WindowPane, {

    _msg: null,
    
    $construct: function() {
        this._msg = CoreDocViewer.getMessages();
        
        Echo.WindowPane.call(this, {
            styleName: "Default",
            width: "40em",
            height: "30em",
            title: this._msg["About.WindowTitle"],
            iconInsets: "6px 10px",
            icon: "image/icon/Icon16About.png",
            modal: true,
            closable: true,
            events: {
                close: function(e) {
                    e.source.parent.remove(e.source);
                }
            },
            children: [
                new Echo.ContentPane({
                    backgroundImage: "image/fill/BlueLine.png",
                    children: [
                        new Extras.TabPane({
                            styleName: "Default.Top.Surround",
                            tabActiveBackground: "#ffffff",
                            tabInactiveBackground: "#afafef",
                            background: "#ffffff",
                            children: [
                                new Echo.Column({
                                    insets: "15px 25px",
                                    cellSpacing: 10,
                                    layoutData: {
                                        icon: "image/icon/Icon24Help.png",
                                        title: this._msg["About.GeneralTab"]
                                    },
                                    children: [
                                        new Echo.Label({
                                            icon: "image/logo/NextApp.png"
                                        }),
                                        new Echo.Label({
                                            font: {
                                                bold: true,
                                                italic: true
                                            },
                                            text: this._msg["About.General0"]
                                        }),
                                        new Echo.Label({
                                            text: this._msg["About.General1"]
                                        }),
                                        new CoreDocViewer.HtmlLabel({
                                            html: this._msg["About.General2"]
                                        }),
                                        new CoreDocViewer.HtmlLabel({
                                            html: this._msg["About.General3"]
                                        })
                                    ]
                                }),
                                new Echo.Column({
                                    insets: "15px 25px",
                                    cellSpacing: 10,
                                    layoutData: {
                                        title: this._msg["About.LibrariesTab"],
                                        icon: "image/icon/Icon24Software.png"
                                    },
                                    children: [
                                        new CoreDocViewer.HtmlLabel({
                                            html: this._msg["About.Libraries0"]
                                        }),
                                        new CoreDocViewer.HtmlLabel({
                                            html: this._msg["About.Libraries1"]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }
});
