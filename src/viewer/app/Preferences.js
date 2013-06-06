/**
 * Dialog for editing user application preferences.
 */
CoreDocViewer.PreferencesDialog = Core.extend(Echo.WindowPane, {

    _msg: null,
    _transitionsEnabled: null,
    _syntaxHighlightEnabled: null,
    
    $construct: function() {
        this._msg = CoreDocViewer.getMessages();
        var groupAnimatedScreenTransitions = Echo.Application.generateUid();
        var groupSyntaxHighlight = Echo.Application.generateUid();
            
        Echo.WindowPane.call(this, {
            styleName: "Default",
            modal: true,
            width: "40em",
            height: "30em", 
            title: this._msg["PrefDialog.WindowTitle"],
            icon: "image/icon/Icon16Preferences.png",
            iconInsets: "6px 10px",
            events: {
                close: Core.method(this, this._close)
            },
            children: [
                new Echo.SplitPane({
                    autoPositioned: true,
                    orientation: Echo.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP,
                    children: [
                        new Echo.Row({
                            styleName: "ControlPane",
                            children: [
                                new Echo.Button({
                                    styleName: "ControlPane.Button",
                                    text: this._msg["Generic.Ok"],
                                    icon: "image/icon/Icon24Ok.png",
                                    events: {
                                        action: Core.method(this, this._apply)
                                    }
                                }),
                                new Echo.Button({
                                    styleName: "ControlPane.Button",
                                    text: this._msg["Generic.Cancel"],
                                    icon: "image/icon/Icon24Cancel.png",
                                    events: {
                                        action: Core.method(this, this._close)
                                    }
                                })
                            ]
                        }),
                        new Echo.Column({
                            insets: "10px 30px",
                            cellSpacing: 15,
                            children: [
                                new Echo.Column({
                                    styleName: "PreferencesColumn",
                                    children: [
                                        new Echo.Label({
                                            styleName: "PreferencesTitle",
                                            text: this._msg["PrefDialog.PromptAnimations"]
                                        }),
                                        new Echo.Row({
                                            cellSpacing: 40,
                                            children: [
                                                this._transitionsEnabled = new Echo.RadioButton({
                                                    group: groupAnimatedScreenTransitions,
                                                    text: this._msg["Generic.Enabled"],
                                                    selected: CoreDocViewer.pref.transitionsEnabled
                                                }),
                                                new Echo.RadioButton({
                                                    group: groupAnimatedScreenTransitions,
                                                    text: this._msg["Generic.Disabled"],
                                                    selected: !CoreDocViewer.pref.transitionsEnabled
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                new Echo.Column({
                                    styleName: "PreferencesColumn",
                                    children: [
                                        new Echo.Label({
                                            styleName: "PreferencesTitle",
                                            text: this._msg["PrefDialog.PromptSyntaxHighlight"]
                                        }),
                                        new Echo.Row({
                                            cellSpacing: 40,
                                            children: [
                                                this._syntaxHighlightEnabled = new Echo.RadioButton({
                                                    group: groupSyntaxHighlight,
                                                    text: this._msg["Generic.Enabled"],
                                                    selected: CoreDocViewer.pref.syntaxHighlightEnabled
                                                }),
                                                new Echo.RadioButton({
                                                    group: groupSyntaxHighlight,
                                                    text: this._msg["Generic.Disabled"],
                                                    selected: !CoreDocViewer.pref.syntaxHighlightEnabled
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    },
    
    _apply: function(e) {
        CoreDocViewer.pref.transitionsEnabled = this._transitionsEnabled.get("selected");
        CoreDocViewer.pref.syntaxHighlightEnabled = this._syntaxHighlightEnabled.get("selected");
        this.parent.remove(this);
    },
    
    _close: function(e) {
        this.parent.remove(this);
    }
});
