/**
 * Echo.Application implementation.
 * Root namespace.
 */
CoreDocViewer = Core.extend(Echo.Application, {

    $static: {
    
        MODULE_ABOUT: [
            "lib/extras/Application.TabPane.js",
            "lib/extras/Sync.TabPane.js",
            "app/About.js"
        ],
        
        MODULE_SOURCE_VIEW: [
            "app/SyntaxHighlighter.js",
            "app/SourceView.js"
        ],
    
        MODULE_PREFERENCES: [
            "app/Preferences.js"
        ],
    
        pref: {
            transitionsEnabled: true,
            syntaxHighlightEnabled: true
        },
        
        getMessages: function() {
            return CoreDocViewer.Messages.get();
        },
        
        init: function() {
            Core.Web.init();
            if (Echo.DebugConsole) {
                Echo.DebugConsole.install();
            }
            var app = new CoreDocViewer();
            var client = new Echo.FreeClient(app, document.getElementById("rootArea"));
            client.addResourcePath("Echo", "lib/echo/");
            client.addResourcePath("Extras", "lib/extras/");
            app.setStyleSheet(CoreDocViewer.StyleSheet);
            client.init();
        }
    },

    workspace: null,
    
    $construct: function() {
        Echo.Application.call(this);
        
        this._msg = CoreDocViewer.getMessages();
        
        this.workspace = new CoreDocViewer.Workspace();
        this.rootComponent.add(this.workspace);
    }
});

CoreDocViewer.ClassCache = Core.extend({
    
    $static: {
        
        _BundleLoader: Core.extend({

            _instanceModel: null,
            contentPath: "content/", //FIXME
            _objectNames: null,
            _completeCount: 0,
            _classModels: null,
            _onComplete: null,
            
            $construct: function(instanceModel, objectNames, onComplete) {
                this._instanceModel = instanceModel;
                this._objectNames = objectNames;
                this._onComplete = onComplete;
            },
            
            _checkComplete: function() {
                ++this._completeCount;
                if (this._completeCount == this._objectNames.length) {
                    this._onComplete(this._classModels);
                }
            },
            
            load: function() {
                this._classModels = {};
                for (var i = 0; i < this._objectNames.length; ++i) {
                    this._loadItem(this._objectNames[i]);
                }
            },
            
            _loadItem: function(name) {
                var conn = new Core.Web.HttpConnection(this.contentPath + "Class." + name + ".xml", "GET");
                conn.addResponseListener(Core.method(this, function(e) {
                    if (e.valid) {
                        this._classModels[name] = new CoreDocViewer.Model.Class(this._instanceModel, e.source.getResponseXml());
                        this._checkComplete();
                    } else {
                        throw new Error("Invalid response: " + e);
                    }
                }));
                conn.connect();                
            }
        })
    },
    
    _classMap: null,
    _classQueue: null,
    _model: null,
    
    $construct: function(model) {
        this._model = model;
        this._classMap = {};
        this._classQueue = {};
    },
    
    get: function(className) {
        return this._classMap[className];
    },
    
    load: function(classes, onComplete) {
        var newClasses = [];
        for (var i = 0; i < classes.length; ++i) {
            if (this._classMap[classes[i]]) {
                continue;
            }
            newClasses.push(classes[i]);
        }
        if (newClasses.length === 0) {
            onComplete();
        } else {
            var bundle = new CoreDocViewer.ClassCache._BundleLoader(this._model, classes, Core.method(this, function(classModels) {
                for (var name in classModels) {
                    this._classMap[name] = classModels[name];
                }
                for (var name in classModels) {
                    classModels[name].superclass = classModels[this._model.superclasses[name]];
                }
                onComplete();
            }));
            bundle.load();
        }
    }
});

CoreDocViewer.Toolbar = Core.extend(Echo.Panel, {
    
    _navigationSelect: null,
    _findField: null,
    _findDropDown: null,
    _findResults: null,
    _msg: null,
    _completionActionRef: null,
    
    $construct: function() {
        this._msg = CoreDocViewer.getMessages();
        this._completionActionRef = Core.method(this, this._completionAction);
        Echo.Panel.call(this, {
            styleName: "Toolbar",
            children: [
                new Echo.Row({
                    cellSpacing: "2em",
                    children: [
                        new Echo.Row({
                            cellSpacing: "1ex",
                            children: [
                                new Echo.Label({
                                    text: this._msg["FindObject.Prompt"],
                                    icon: "image/icon/Icon24Find.png"
                                }),
                                this._findDropDown = new CoreDocViewer.DropDown({
                                    styleName: "FindObject",
                                    events: {
                                        property: Core.method(this, this._findDropDownUpdate)
                                    },
                                    children: [
                                        this._findField = new Echo.TextField({
                                            events: {
                                                property: Core.method(this, this._findUpdate),
                                                keyDown: Core.method(this, this._findKeyDown),
                                                action: Core.method(this, this._findAction)
                                            }
                                        }),
                                        this._findResults = new Echo.Column({
                                        })
                                    ]
                                })
                            ]
                        }),
                        new Echo.Row({
                            cellSpacing: 2,
                            children: [
                                new Echo.Label({
                                    icon: "image/icon/Icon24Move.png"
                                }),
                                this._navigationSelect = new Echo.SelectField({
                                    events: {
                                        action: Core.method(this, this._navigationAction)
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    },
    
    _completionAction: function(e) {
        this.fireEvent({source: this, type: "findObject", value: e.actionCommand});
        this._findDropDown.set("expanded", false);
        this._findField.set("text", null);
    },
    
    _findAction: function(e) {
        this.fireEvent({source: this, type: "findObject", value: this._findField.get("text")});
        this._findDropDown.set("expanded", false);
        this._findField.set("text", null);
    },
    
    _findDropDownUpdate: function(e) {
        if (e.propertyName == "expanded" && !e.newValue) {
            this.application.setFocusedComponent(this._findField);
        }
    },
    
    _findKeyDown: function(e) {
        switch (e.keyCode) {
        case 27: // Escape
            this._findDropDown.set("expanded", false);
            break;
        case 40: // Down
            if (this._findDropDown.get("expanded") && this._findResults.children.length > 0) {
                this.application.setFocusedComponent(this._findResults.children[0]);
            }
            break;
        }
    },
    
    _findUpdate: function(e) {
        var searchModel = this.get("searchModel");
        if (e.propertyName != "text" || !e.newValue || !searchModel) {
            return;
        }
        
        this._findResults.removeAll();
        var result = searchModel.find(e.newValue);
        for (var i = 0; i < result.length && i < 10; ++i) {
            this._findResults.add(new Echo.Button({
                styleName: "FindObject",
                text: result[i],
                actionCommand: result[i],
                events: {
                    action: this._completionActionRef
                }
            }));
        }
        
        this._findDropDown.set("expanded", result.length > 0);
    },
    
    _navigationAction: function(e) {
        this.fireEvent({source: this, type: "navigateTo", value: this._navigationSelect.get("selectedId")});
    },
    
    update: function(content) {
        this._navigationSelect.set("selectedId", null);
        var navigationItems = content && content.navigationItems;
        if (!navigationItems) {
            return;
        }
        var items = [
            { id: "-", text: this._msg["NavigateTo.Prompt"] },
            { id: "^", text: this._msg["NavigateTo.ItemTop"] }
        ];
        for (var i = 0; i < navigationItems.length; ++i) {
            items.push({id: navigationItems[i], text: navigationItems[i]});
        }
        this._navigationSelect.set("items", items);
        items.push({ id: "$", text: this._msg["NavigateTo.ItemBottom"] });
    }
});

/**
 * Workspace component: the primary user interface of the application.
 */ 
CoreDocViewer.Workspace = Core.extend(Echo.ContentPane, {

    _classCache: null,
    contentPath: "content/",
    _contentArea: null,
    _content: null,
    _menu: null,
    _controller: null,
    _model: null,
    _activeClassModel: null,
    _searchModel: null,
    _stateModel: null,
    _options: null,

    $construct: function(sections) {
        this._options = { };
        this._sections = sections;
        this._msg = CoreDocViewer.getMessages();
        this._stateModel = new Extras.MenuStateModel();
        
        Echo.ContentPane.call(this, {
            children: [
                new Echo.SplitPane({
                    styleName: "DefaultResizableLarge",
                    separatorPosition: "18%",
                    children: [
                        new Echo.SplitPane({
                            orientation: Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                            autoPositioned: true,
                            layoutData: {
                                minimumSize: "1em",
                                maximumSize: "33%"
                            },
                            children: [
                                new Echo.Panel({
                                    styleName: "TitlePanel",
                                    children: [
                                        new Echo.Label({
                                            text: this._msg["TitlePanel.Text"]
                                        })
                                    ]
                                }),
                                new Echo.ContentPane({
                                    insets: 0,
                                    children: [
                                        this._namespaceAccordion = new CoreDocViewer.NamespaceAccordion({
                                            styleName: "Default",
                                            font: {
                                                size: "8pt"
                                            }, 
                                            events: {
                                                objectSelect: Core.method(this, function(e) {
                                                    this._loadClass(e.objectName);
                                                })
                                            }
                                        })
                                    ]
                                })
                            ]
                        }),
                        new Echo.SplitPane({
                            orientation: Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                            autoPositioned: true,
                            children: [
                                this._menu = new Extras.MenuBarPane({
                                    model: this.createMenuModel(),
                                    stateModel: this._stateModel,
                                    styleName: "Default",
                                    events: {
                                        action: Core.method(this, this._processMenuAction)
                                    }
                                }),
                                new Echo.SplitPane({
                                    orientation: Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                                    autoPositioned: true,
                                    children: [
                                        this._toolbar = new CoreDocViewer.Toolbar(),
                                        this._contentArea = new Extras.TransitionPane({
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
        
        this._toolbar.addListener("navigateTo", Core.method(this, function(e) {
            if (this._content && this._content.navigateTo) {
                this._content.navigateTo(e.value);
            }
        }));
        this._toolbar.addListener("findObject", Core.method(this, function(e) {
            var result = this._searchModel.find(e.value);
            if (result.length > 0) {
                this._loadClass(result[0]);
            }
        }));
        
        this._loadInstance();
    },
    
    createMenuModel: function() {
        var menuModel = new Extras.MenuModel(null, null, null, [
            new Extras.MenuModel(null, this._msg["Menu.ViewMenu"], null, [
                new Extras.OptionModel("home", this._msg["Menu.Home"], "image/icon/Icon16Home.png"),
                new Extras.SeparatorModel(),
                new Extras.OptionModel("expand", this._msg["Menu.Expand"], "image/icon/Icon16Add.png"),
                new Extras.OptionModel("collapse", this._msg["Menu.Collapse"], "image/icon/Icon16Remove.png"),
                new Extras.SeparatorModel(),
                new Extras.ToggleOptionModel("internal", this._msg["Menu.InternalProperties"]),
                new Extras.ToggleOptionModel("inherited", this._msg["Menu.InheritedProperties"]),
                new Extras.SeparatorModel(),
                new Extras.OptionModel("viewsource", this._msg["Menu.ViewSource"], "image/icon/Icon16Terminal.png"),
                new Extras.SeparatorModel(),
                new Extras.OptionModel("preferences", this._msg["Menu.Preferences"], "image/icon/Icon16Preferences.png")
            ]),
            new Extras.MenuModel(null, this._msg["Menu.HelpMenu"], null, [
                new Extras.OptionModel("about", this._msg["Menu.About"], "image/icon/Icon16About.png")
            ])
        ]);
        return menuModel;
    },
    
    _displayHome: function(name) {
        if (this._model.home) {
            this._setContent(new CoreDocViewer.IFrame({url: this.contentPath + this._model.home + "/index.html"}));
        } else {
            this._setContent(null);
        }
    },
    
    displayObject: function(name) {
        this._loadClass(name);
    },
    
    _loadClass: function(objectName) {
        var classes = [];
        var name = objectName;
        while (name) {
            classes.push(name);
            name = this._model.superclasses[name];
        }
        this._classCache.load(classes, Core.method(this, function() {
            var classModel = this._classCache.get(objectName);
            this._openClass(classModel);
        }));
    },
    
    _loadInstance: function() {
        var conn = new Core.Web.HttpConnection(this.contentPath +  "Index.xml", "GET");
        conn.addResponseListener(Core.method(this, function(e) {
            if (e.valid) {
                this._model = new CoreDocViewer.Model.Instance(e.source.getResponseXml());
                this._searchModel = new CoreDocViewer.Model.Search(this._model);
                this._classCache = new CoreDocViewer.ClassCache(this._model);
                this._namespaceAccordion.set("model", this._model);
                this._toolbar.set("searchModel", this._searchModel);
                this.application.rootComponent.set("title", this._model.title);
                this._displayHome();
            } else {
                alert("Cannot load content.");
            }
        }));
        conn.connect();
    },
    
    _openClass: function(classModel) {
        this._activeClassModel = classModel;
        var classDisplay = new CoreDocViewer.ClassDisplay(this, classModel, this._options);
        this._setContent(classDisplay);
    },
    
    _redrawClass: function() {
        if (this._activeClassModel) {
            this._openClass(this._activeClassModel);
        }
    },
    
    _processMenuAction: function(e) {
        switch (e.modelId) {
        case "home":
            this._displayHome();
            break;
        case "about":
            this.application.client.exec(CoreDocViewer.MODULE_ABOUT, Core.method(this, function() {
                this.add(new CoreDocViewer.AboutDialog());
            }));
            break;
        case "preferences":
            this.application.client.exec(CoreDocViewer.MODULE_PREFERENCES, Core.method(this, function() {
                this.add(new CoreDocViewer.PreferencesDialog(this.application));
            }));
            break;
        case "viewsource":
            if (this._activeClassModel) {
                this.application.client.exec(CoreDocViewer.MODULE_SOURCE_VIEW, Core.method(this, function() {
                    var sourceWindow = new CoreDocViewer.SourceWindow(this._activeClassModel);
                    this.add(sourceWindow);
                    this.application.setFocusedComponent(sourceWindow);
                }));
            }
            break;
        case "expand":
            this._options.defaultExpanded = true;
            this._redrawClass();
            break;
        case "collapse":
            this._options.defaultExpanded = false;
            this._redrawClass();
            break;
        case "internal":
            this._options.showInternal = this._stateModel.isSelected("internal");
            this._redrawClass();
            break;
        case "inherited":
            this._options.showInherited = this._stateModel.isSelected("inherited");
            this._redrawClass();
            break;
        }
    },
    
    _setContent: function(content) {
        this._contentArea.removeAll();
        this._content = content;
        if (content != null) {
            this._contentArea.add(content);
        }
        this._toolbar.update(this._content);
    }
});
