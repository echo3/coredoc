CoreDocViewer.ObjectButton = Core.extend(Echo.Button, {
    $construct: function(controller, name, inactive) {
        Echo.Button.call(this, {
            styleName: "ObjectButton",
            text: name,
            events: {
                action: Core.method(this, function(e) {
                    controller.displayObject(name);
                })
            }
        });
        if (inactive) {
            this.setEnabled(false);
        }
    }
});

CoreDocViewer.NamespaceAccordion = Core.extend(Extras.AccordionPane, {

    _namespaceContainers: null,
    _actionHandler: null,
    _activeButton: null,
    _msg: null,
    
    $construct: function(state) {
        this._msg = CoreDocViewer.getMessages();
        Extras.AccordionPane.call(this, state);
        
        this._namespaceContainers = { };
        this._actionHandler = Core.method(this, this._processAction);
        this.addListener("property", Core.method(this, function(e) {
            if (e.propertyName == "model") {
                this._processModelUpdate();
            }
        }));
    },

    _addObject: function(namespace, name) {
        var namespaceContainer = this._namespaceContainers[namespace];
        if (!namespaceContainer) {
            var title = namespace == "%global" ? this._msg["Namespace.Global"] : namespace;
            namespaceContainer = new Echo.Column({
                layoutData: {
                    title: title,
                    icon: "image/icon/Icon16x14Package.png"
                }
            });
            this.add(namespaceContainer);
            this._namespaceContainers[namespace] = namespaceContainer;
        }
        
        var button = new Echo.Button({
            styleName: "NamespaceView.ClassButton",
            text: name,
            events: {
                action: this._actionHandler
            }
        });
        namespaceContainer.add(button);
    },
    
    _processAction: function(e) {
        if (this._activeButton) {
            this._activeButton.setStyleName("NamespaceView.ClassButton");
        }
        this._activeButton = e.source;
        this._activeButton.setStyleName("NamespaceView.SelectedClassButton");
    
        this.fireEvent({ type: "objectSelect", source: this, objectName: e.source.get("text") });
    },
    
    _processModelUpdate: function() {
        this.removeAll();
        var model = this.get("model");
        if (model == null) {
            return;
        }
        for (var i = 0; i < model.namespaces.length; ++i) {
            var classes = model.namespaceToClasses[model.namespaces[i]];
            for (var j = 0; j < classes.length; ++j) {
                this._addObject(model.namespaces[i], classes[j]);
            }
        }
    }
});

CoreDocViewer.ClassDisplay = Core.extend(Echo.ContentPane, {
    
    $static: {
        
        _fieldComponentArraySort: function(a, b) {
            return a.name > b.name;
        }
    },

    _content: null,
    _controller: null,
    _model: null,
    _options: null,
    navigationItems: null,
    _scrollPointMap: null,

    $construct: function(controller, model, options) {
        this._scrollPointMap = {};
        this._options = options || {};
        this._msg = CoreDocViewer.getMessages();
    
        this._controller = controller;
        this._model = model;
    
        Echo.ContentPane.call(this, {
            children: [
                this._content = new Echo.Column({
                    cellSpacing: "1em",
                    insets: "1em"
                })
            ]
        });
        
        this.create();
    },
    
    create: function() {
        this._content.removeAll();
        
        this._content.add(this._scrollPointMap["^"] = new CoreDocViewer.ScrollPoint());

        this._content.add(new Echo.Label({
            text: this._model.qualifiedName,
            font: {
                typeface: "serif",
                size: "18pt",
                italic: true
            }
        }));
        
        this._content.add(new CoreDocViewer.ClassDisplay.AncestorDisplay(this._controller, this._model));
        
        if (this._model.descendants) {
            this._content.add(new CoreDocViewer.ClassDisplay.DescendantDisplay(this._controller, this._model));
        }
        
        if (this._model.description) {
            this._content.add(new CoreDocViewer.HtmlLabel({
                html: this._model.description
            }));
        }
        
        if (this._model.constructorData) {
            this._content.add(new CoreDocViewer.ClassDisplay.ExpandableBlock(this._controller, this._model, {
                title: this._msg["Doc.Constructor"],
                shortDescription: this._model.constructorData.shortDescription,
                description: this._model.constructorData.description,
                parameters: this._model.constructorData.parameters
            }));
        }
        
        this.navigationItems = [];
        if (this._createFieldBlocks(this._msg["Doc.ClassFields"], "classFields", 
                Core.method(this, this._createFieldBlockData), false)) {
            this.navigationItems.push(this._msg["Doc.ClassFields"]);
        }
        if (this._createFieldBlocks(this._msg["Doc.ClassMethods"], "classMethods", 
                Core.method(this, this._createMethodBlockData), false)) {
            this.navigationItems.push(this._msg["Doc.ClassMethods"]);
        }
        if (this._createFieldBlocks(this._msg["Doc.InstanceFields"], "instanceFields", 
                Core.method(this, this._createFieldBlockData), true)) {
            this.navigationItems.push(this._msg["Doc.InstanceFields"]);
        }
        if (this._createFieldBlocks(this._msg["Doc.InstanceMethods"], "instanceMethods", 
                Core.method(this, this._createMethodBlockData), true)) {
            this.navigationItems.push(this._msg["Doc.InstanceMethods"]);
        }
        this._createCustomBlocks();
        
        this._content.add(this._scrollPointMap["$"] = new CoreDocViewer.ScrollPoint());
    },
    
    _createCustomBlocks: function() {
        var model = this._model, 
            i, j,
            customBlockMap = { },
            customBlock,
            name;
            
        while (model) {
            if (model.customBlocks) {
                for (i = 0; i < model.customBlocks.length; ++i) {
                    name = model.customBlocks[i].name;
                    customBlock = customBlockMap[name];
                    if (!customBlock) {
                        customBlock = { name: name, items: [], addedItems: {} };
                        customBlockMap[name] = customBlock; 
                    }
                    for (j = 0; j < model.customBlocks[i].items.length; ++j) {
                        if (!customBlock.addedItems[model.customBlocks[i].items[j].name]) {
                            customBlock.addedItems[model.customBlocks[i].items[j].name] = true;
                            customBlock.items.push(model.customBlocks[i].items[j]);
                        }
                    }
                }
            }
            if (this._options.showInherited) {
                model = model.superclass;
            } else {
                model = null;
            }
        }
        
        for (name in customBlockMap) {
            customBlockMap[name].items.sort(CoreDocViewer.ClassDisplay._fieldComponentArraySort);
            this._createCustomBlock(customBlockMap[name]);
            this.navigationItems.push(name);
        }
    },
    
    _createCustomBlock: function(customBlock) {
        var scrollPoint = new CoreDocViewer.ScrollPoint();
        this._scrollPointMap[customBlock.name] = scrollPoint;
        this._content.add(scrollPoint);
        this._content.add(new CoreDocViewer.ClassDisplay.Title(customBlock.name));
        for (var i = 0; i < customBlock.items.length; ++i) {
            this._content.add(new CoreDocViewer.ClassDisplay.ExpandableBlock(this._controller, this._model, {
                title: customBlock.items[i].name,
                description: customBlock.items[i].description
            }, this._options.defaultExpanded));
        }
    },
    
    _createFieldBlocks: function(title, fieldPropertyName, blockDataFactory, allowInherited) {
        var i;
        var renderedFieldNames = {};
        var model = this._model;
        var fieldComponents = [];
        while (model) {
            var fields = model[fieldPropertyName];
            if (fields) {
                for (i = 0; i < fields.length; ++i) {
                    if (renderedFieldNames[fields[i].name]) {
                        continue;
                    }
                    if ((fields[i].modifiers || {}).internal && !this._options.showInternal) {
                        continue;
                    }
                    var blockData = blockDataFactory(fields[i]);
                    blockData.inherited = model != this._model;
                    var block = new CoreDocViewer.ClassDisplay.ExpandableBlock(this._controller, model, blockData, 
                          this._options.defaultExpanded);
                    fieldComponents.push(block);
                    renderedFieldNames[fields[i].name] = true;
                }
            }

            if (allowInherited && this._options.showInherited) {
                model = model.superclass;
            } else {
                model = null;
            }
        }
        
        fieldComponents.sort(CoreDocViewer.ClassDisplay._fieldComponentArraySort);

        if (fieldComponents.length > 0) {
            var scrollPoint = new CoreDocViewer.ScrollPoint();
            this._scrollPointMap[title] = scrollPoint;
            this._content.add(scrollPoint);
            this._content.add(new CoreDocViewer.ClassDisplay.Title(title));
            for (i = 0; i < fieldComponents.length; ++i) {
                this._content.add(fieldComponents[i]);
            }
        }
        
        return fieldComponents.length > 0;
    },
    
    _createMethodBlockData: function(methodModel) {
        return {
            title: methodModel.name + "()",
            modifiers: methodModel.modifiers,
            description: methodModel.description,
            shortDescription: methodModel.shortDescription,
            parameters: methodModel.parameters,
            returnValue: methodModel.returnValue
        };
    },
    
    _createFieldBlockData: function(fieldModel) {
        return {
            title: fieldModel.name,
            modifiers: fieldModel.modifiers,
            description: fieldModel.description,
            shortDescription: fieldModel.shortDescription
        };
    },
    
    navigateTo: function(name) {
        var scrollPoint = this._scrollPointMap[name];
        if (scrollPoint) {
            scrollPoint.scrollIntoView();
        }
    }
});

CoreDocViewer.ClassDisplay.AncestorDisplay = Core.extend(Echo.Column, {

    $construct: function(controller, model) {
        var content;
    
        Echo.Column.call(this, {
            styleName: "Box",
            children: [
                new Echo.Label({
                    styleName: "Box.Title",
                    text: "Inheritance Hierarchy"
                }),
                content = new Echo.Column({
                    styleName: "Box.Content"
                })
            ]
        });
        
        content.add(new CoreDocViewer.ObjectButton(controller, "Object", true));
        
        var ancestorCount = model.ancestors ? model.ancestors.length : 0;
        
        if (ancestorCount) {
            for (var i = 0; i < ancestorCount; ++i) {
                var objectButton = new CoreDocViewer.ObjectButton(controller, model.ancestors[i]);
                objectButton.set("layoutData", {
                    insets: "0 0 0 " + ((i + 1) * 10) + "px"
                });
                content.add(objectButton);
            }
        }

        objectButton = new CoreDocViewer.ObjectButton(controller, model.qualifiedName, true);
        objectButton.set("layoutData", {
            insets: "0 0 0 " + ((ancestorCount + 1) * 10) + "px"
        });
        objectButton.set("font", {
            bold: true
        });
        content.add(objectButton);

    }
});

CoreDocViewer.ClassDisplay.DescendantDisplay = Core.extend(Echo.Column, {

    $construct: function(controller, model) {
        var content;
        
        Echo.Column.call(this, {
            styleName: "Box",
            children: [
                new Echo.Label({
                    styleName: "Box.Title",
                    text: "Direct Known Descendants"
                }),
                content = new CoreDocViewer.Flow({
                    styleName: "Box.Content"
                })
            ]
        });

        for (var i = 0; i < model.descendants.length; ++i) {
            content.add(new CoreDocViewer.ObjectButton(controller, model.descendants[i]));
        }
    }
});

CoreDocViewer.ClassDisplay.Title = Core.extend(Echo.Panel, {

    $construct: function(text) {
        Echo.Panel.call(this, {
            styleName: "ClassDisplay.Title",
            children: [
                new Echo.Label({
                    text: text
                })
            ]
        });
    }
});

CoreDocViewer.ClassDisplay.ExpandableBlock = Core.extend(Echo.Column, {

    _model: null,
    _controller: null,
    _blockData: null,
    expanded: null,
    _content: null,
    _titleButton: null,
    name: null,

    $construct: function(controller, model, blockData, expanded) {
        this._blockData = blockData;
        this.expanded = expanded;
        this._model = model;
        this._controller = controller;
        this.name = this._blockData.title;
        
        Echo.Column.call(this, {
            styleName: "Box",
            children: [
                this._titleButton = new Echo.Button({
                    styleName: "Box.Title",
                    text: this._blockData.title,
                    font: {
                        typeface: "monospace",
                        bold: true
                    },
                    events: {
                        action: Core.method(this, function(e) {
                            this.expanded = !this.expanded;
                            this.create();
                        })
                    }
                })
            ]
        });
        
        this.create();
    },
    
    create: function() {
        if (this._content) {
            this._content.parent.remove(this._content);
        }
        
        this._content = new Echo.Column({
            styleName: "Box.Content",
            cellSpacing: 10
        });
        
        var expandable = false;
        
        if (this._blockData.modifiers) {
            var modifierContainer = new CoreDocViewer.Flow({
                cellSpacing: 5
            });
            if (this._blockData.modifiers.internal) {
                modifierContainer.add(new Echo.Panel({
                    styleName: "FieldModifier.Internal",
                    children: [
                        new Echo.Label({text: "Internal"})
                    ]
                }));
            }
            if (this._blockData.modifiers.override) {
                modifierContainer.add(new Echo.Panel({
                    styleName: "FieldModifier.Override",
                    children: [
                        new Echo.Label({text: "Override"})
                    ]
                }));
            } else if (this._blockData.modifiers.virtual) {
                modifierContainer.add(new Echo.Panel({
                    styleName: "FieldModifier.Virtual",
                    children: [
                        new Echo.Label({text: "Virtual"})
                    ]
                }));
            }
            if (this._blockData.modifiers.inherited) {
                modifierContainer.add(new Echo.Panel({
                    styleName: "FieldModifier.Inherited",
                    children: [
                        new Echo.Label({text: "Inherited"})
                    ]
                }));
            }
            if (this._blockData.modifiers["abstract"]) {
                modifierContainer.add(new Echo.Panel({
                    styleName: "FieldModifier.Abstract",
                    children: [
                        new Echo.Label({text: "Abstract"})
                    ]
                }));
            }
            this._content.add(modifierContainer);
        }

        if (this._blockData.description) {
            if (this.expanded || this._blockData.description == this._blockData.shortDescription) {
                this._content.add(new CoreDocViewer.HtmlLabel({
                    html: this._blockData.description
                }));
            } else {
                expandable = true;
                this._content.add(new CoreDocViewer.HtmlLabel({
                    html: this._blockData.shortDescription
                }));
            }
        }
        
        if (this._blockData.parameters) {
            if (this.expanded) {
                var parameterColumn;
                this._content.add(new Echo.Column({
                    children: [
                        new Echo.Label({
                            text: "Paramaters",
                            font: {
                                size: "8pt",
                                bold: true
                            }
                        }),
                        parameterColumn = new Echo.Column({
                            cellSpacing: "1em"
                        })
                    ]
                }));

                for (var i = 0; i < this._blockData.parameters.length; ++i) {
                    var nameCell;
                    var paramContainer = new Echo.Column({
                        layoutData: {
                            insets: "0 0 0 1em"
                        },
                        children: [
                            nameCell = new Echo.Row({
                                cellSpacing: "1em",
                                children: [
                                    new Echo.Label({
                                        foreground: "#007f00",
                                        font: {
                                            typeface: "monospace"
                                        },
                                        text: this._blockData.parameters[i].name
                                    })
                                ]
                            })
                        ]
                    });

                    var type = this._blockData.parameters[i].type;
                    if (type) {
                        nameCell.add(this._createObjectReference(type));
                    }

                    if (this._blockData.parameters[i].description) {
                        paramContainer.add(new CoreDocViewer.HtmlLabel({
                            layoutData: {
                                insets: "0 0 0 3em"
                            },
                            html: this._blockData.parameters[i].description
                        }));
                    }


                    parameterColumn.add(paramContainer);
                }
            } else {
                expandable = true;
            }
        }
        
        if (this._blockData.returnValue) {
            if (this.expanded) {
                var returnValueColumn;
                this._content.add(new Echo.Column({
                    children: [
                        new Echo.Label({
                            text: "Return Value",
                            font: {
                                size: "8pt",
                                bold: true
                            }
                        }),
                        returnValueColumn = new Echo.Column({
                            layoutData: {
                                insets: "0 0 0 1em"
                            }
                        })
                    ]
                }));

                if (this._blockData.returnValue.type) {
                    returnValueColumn.add(this._createObjectReference(this._blockData.returnValue.type));
                }

                if (this._blockData.returnValue.description) {
                    returnValueColumn.add(new CoreDocViewer.HtmlLabel({
                        returnValueColumn: {
                            insets: "0 0 0 3em"
                        },
                        html: this._blockData.returnValue.description
                    }));
                }
            } else {
                expandable = true;
            }
        }
        
        if (this.expanded || expandable) {
            this._titleButton.set("icon", this.expanded ? "image/icon/Icon24Remove.png" : "image/icon/Icon24Add.png");
        } else {
            this._titleButton.set("icon", "image/icon/Icon24Dot.png");
            this._titleButton.setEnabled(false);
        }
        
        if (this._content.children.length > 0) {
            this.add(this._content);
        } else {
            this._Content = null;
        }
    },
    
    _createObjectReference: function(type) {
        if (this._model.instance.classMap[type]) {
            return new CoreDocViewer.ObjectButton(this._controller, type, false);
        } else {
            return new Echo.Label({
                font: {
                    italic: true
                },
                text: "(" + type + ")"
            });
        }
    }
});
