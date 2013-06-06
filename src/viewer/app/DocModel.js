CoreDocViewer.Model = { };

CoreDocViewer.Model.Instance = Core.extend({

    /**
     * The documentation title.
     */
    title: null,
    
    /**
     * Relative URL of documentation home page.
     */
    home: null,
    
    /**
     * Array containing qualified names of all namespaces.
     * @type Array
     */
    namespaces: null,
    
    /**
     * Object mapping between namespaces and arrays of class names.
     */
    namespaceToClasses: null,
    
    /**
     * Mapping between class names and superclasses.
     */
    superclasses: null,
    
    /**
     * Mapping between class names and CoreDocViewer.Model.Class instances.
     */
    classMap: null,

    $construct: function(indexXml) {
        var node;
        
        // Pass 1.
        node = indexXml.documentElement.firstChild;
        while (node) {
            switch (node.nodeName) {
            case "title":
                this.title = CoreDocViewer.DOM.getElementText(node);
                break;
            case "home":
                this.home = CoreDocViewer.DOM.getElementText(node);
                break;
            case "namespaces":
                this._processNamespaces(node);
                break;
            }
            node = node.nextSibling;
        }

        // Pass 2: Process Classes.
        node = indexXml.documentElement.firstChild;
        while (node) {
            if (node.nodeName == "classes") {
                this._processClasses(node);
            }
            node = node.nextSibling;
        }
    },
    
    getNamespace: function(qualifiedName) {
        var nameElements = qualifiedName.split(".");
        for (var i = nameElements.length; i > 0; --i) {
            var candidate = nameElements.slice(0, i).join(".");
            if (this.namespaceToClasses[candidate]) {
                return candidate;
            }
        }
        return null;
    },
    
    _processClasses: function(classesElement) {
        var classElement = classesElement.firstChild,
            i = 0;
        this.superclasses = [];
        this.classMap = {};
        while (classElement) {
            if (classElement.nodeType == 1 && classElement.nodeName == "class") {
                var className = classElement.getAttribute("name");
                className = classElement.getAttribute("name");
                var namespace = this.getNamespace(className);
                this.namespaceToClasses[namespace ? namespace : "%global"].push(className);
                superclassName = classElement.getAttribute("super");
                if (superclassName) {
                    this.superclasses[className] = superclassName;
                }
            }
            classElement = classElement.nextSibling;
        }
    },
    
    _processNamespaces: function(namespacesElement) {
        var node = namespacesElement.firstChild,
            i = 0;
        this.namespaces = [];
        this.namespaceToClasses = {};
        while (node) {
            if (node.nodeType == 1 && node.nodeName == "namespace") {
                this.namespaces[i++] = node.getAttribute("name");
                this.namespaceToClasses[node.getAttribute("name")] = [ ];
            }
            node = node.nextSibling;
        }
    }
});

CoreDocViewer.Model.Search = Core.extend({
    
    _searchArray: null,
    _searchString: null,
    _references: null,
    model: null,
    
    $construct: function(model) {
        this.model = model;
    },
    
    _addReference: function(text, object) {
        var refName = "." + text.toLowerCase();
        if (!this._references[refName]) {
            this._searchArray.push(refName);
            this._references[refName] = object;
        }
    },
    
    find: function(name) {
        if (!this._searchArray) {
            this._generate();
        }
        
        var result = [];
        
        name = "." + name.toLowerCase();
        var searchIndex = 0;
        while (searchIndex != -1) {
            searchIndex = this._searchString.indexOf(name, searchIndex);
            if (searchIndex != -1) {
                var startOfLine = this._searchString.lastIndexOf("\n", searchIndex);
                var endOfLine = this._searchString.indexOf("\n", searchIndex);
                if (endOfLine === -1) {
                    endOfLine = this._searchString.length;
                }
                var foundString = this._searchString.substring(startOfLine + 1, endOfLine);
                result.push(this._references[foundString]); 
                searchIndex++;
            }
        }
        
        return result;
    },
    
    _generate: function() {
        var i, j;
        this._searchArray = [];
        this._references = {};
        for (i = 0; i < this.model.namespaces.length; ++i) {
            var classes = this.model.namespaceToClasses[this.model.namespaces[i]];
            for (j = 0; j < classes.length; ++j) {
                this._addReference(classes[j], classes[j]);
            }
        }
        this._searchString = this._searchArray.join("\n");
    }
});

CoreDocViewer.Model.Class = Core.extend({

    qualifiedName: null,
    fileName: null,
    startIndex: null,
    endIndex: null,
    instance: null,
    
    /**
     * The superclass.
     * @type CoreDocViewer.Model.Class
     */
    superclass: null,

    $construct: function(instance, classXml) {
        this.instance = instance;
        this.qualifiedName = CoreDocViewer.DOM.getPropertyElementValue(classXml.documentElement, "qualified-name");
        this.fileName = CoreDocViewer.DOM.getPropertyElementValue(classXml.documentElement, "file-name");
        this.startIndex = parseInt(CoreDocViewer.DOM.getPropertyElementValue(classXml.documentElement, "start-index"), 10);
        this.endIndex = parseInt(CoreDocViewer.DOM.getPropertyElementValue(classXml.documentElement, "end-index"), 10) + 1;
        
        this.instance.classMap[this.qualifiedName] = this;
        
        var node = classXml.documentElement.firstChild;
        while (node) {
            switch(node.nodeName) {
            case "ancestors":
                this.ancestors = this._loadClasses(node);
                break;
            case "descendants":
                this.descendants = this._loadClasses(node);
                break;
            case "description":
                this.description = CoreDocViewer.DOM.getElementText(node);
                break;
            case "constructor":
                this.constructorData = this._loadConstructor(node);
                break;
            case "instance-fields":
                this.instanceFields = this._loadFields(node, "instance-field");
                break;
            case "instance-methods":
                this.instanceMethods = this._loadMethods(node, "instance-method");
                break;
            case "class-fields":
                this.classFields = this._loadFields(node, "class-field");
                break;
            case "class-methods":
                this.classMethods = this._loadMethods(node, "class-method");
                break;
            case "custom-blocks":
                this.customBlocks = this._loadCustomBlocks(node, "custom-blocks");
                break;
            }
            node = node.nextSibling;
        }
    },

    _loadCustomBlockItem: function(parent) {
        var item = { };
        var node = parent.firstChild;
        while (node) {
            if (node.nodeType == 1) {
                item[node.nodeName] = CoreDocViewer.DOM.getElementText(node);
            }
            node = node.nextSibling;
        }
        return item;
    },
    
    _loadCustomBlockItems: function(parent) {
        var items = [ ];
        var node = parent.firstChild;
        while (node) {
            switch(node.nodeName) {
                case "item":
                    items.push(this._loadCustomBlockItem(node));
                    break;
            }
            node = node.nextSibling;
        }
        return items;
    },
    
    _loadCustomBlocks: function(parent) {
        var customBlocks = [ ];
        var node = parent.firstChild;
        while (node) {
            if (node.nodeName == "custom-block") {
                var customBlock = {
                    name: node.getAttribute("name"),
                    items: this._loadCustomBlockItems(node)
                };
            
                customBlocks.push(customBlock);
            }
            node = node.nextSibling;
        }
        return customBlocks;
    },
    
    _loadClasses: function(parent) {
        var node = parent.firstChild,
            i = 0;
        var classes = [];
        while (node) {
            if (node.nodeName == "class") {
                classes.push(node.firstChild.nodeValue);
            }
            node = node.nextSibling;
        }
        return classes.length > 0 ? classes : null;
    },
    
    _loadConstructor: function(parent) {
        var constructorData = { };
        var node = parent.firstChild;
        while (node) {
            switch(node.nodeName) {
            case "short-description":
                constructorData.shortDescription = CoreDocViewer.DOM.getElementText(node);
                break;
            case "description":
                constructorData.description = CoreDocViewer.DOM.getElementText(node);
                break;
            case "parameters":
                constructorData.parameters = this._loadParameters(node);
                break;
            }
            node = node.nextSibling;
        }
        return constructorData;
    },
    
    _loadField: function(parent) {
        var field = { };
        var node = parent.firstChild;
        while (node) {
            switch(node.nodeName) {
            case "name":
                field.name = CoreDocViewer.DOM.getElementText(node);
                break;
            case "description":
                field.description = CoreDocViewer.DOM.getElementText(node);
                break;
            case "short-description":
                field.shortDescription = CoreDocViewer.DOM.getElementText(node);
                break;
            case "modifiers":
                field.modifiers = this._loadModifiers(node);
                break;
            }
            node = node.nextSibling;
        }
        return field;
    },
    
    _loadFields: function(parent, childNodeName) {
        var fields = [ ];
        var node = parent.firstChild;
        while (node) {
            if (node.nodeName == childNodeName) {
                fields.push(this._loadField(node));
            }
            node = node.nextSibling;
        }
        return fields;
    },
    
    _loadMethod: function(parent) {
        var method = { };
        var node = parent.firstChild;
        while (node) {
            switch(node.nodeName) {
            case "name":
                method.name = CoreDocViewer.DOM.getElementText(node);
                break;
            case "description":
                method.description = CoreDocViewer.DOM.getElementText(node);
                break;
            case "short-description":
                method.shortDescription = CoreDocViewer.DOM.getElementText(node);
                break;
            case "modifiers":
                method.modifiers = this._loadModifiers(node);
                break;
            case "parameters":
                method.parameters = this._loadParameters(node);
                break;
            case "return-value":
                method.returnValue = this._loadReturnValue(node);
                break;
            }
            node = node.nextSibling;
        }
        return method;
    },
    
    _loadMethods: function(parent, childNodeName) {
        var methods = [ ];
        var node = parent.firstChild;
        while (node) {
            if (node.nodeName == childNodeName) {
                methods.push(this._loadMethod(node));
            }
            node = node.nextSibling;
        }
        return methods;
    },
    
    _loadParameter: function(parent) {
        var parameter = { };
        var node = parent.firstChild;
        while (node) {
            switch(node.nodeName) {
            case "name":
                parameter.name = CoreDocViewer.DOM.getElementText(node);
                break;
            case "type":
                parameter.type = CoreDocViewer.DOM.getElementText(node);
                break;
            case "description":
                parameter.description = CoreDocViewer.DOM.getElementText(node);
                break;
            }
            node = node.nextSibling;
        }
        return parameter;
    },

    _loadModifiers: function(parent) {
        var modifiers = { };
        var node = parent.firstChild;
        while (node) {
            if (node.nodeName == "modifier") {
                modifiers[CoreDocViewer.DOM.getElementText(node).toLowerCase()] = true;
            }
            node = node.nextSibling;
        }
        return modifiers;
    },
    
    _loadParameters: function(parent) {
        var parameters = [ ];
        var node = parent.firstChild;
        while (node) {
            if (node.nodeName == "parameter") {
                parameters.push(this._loadParameter(node));
            }
            node = node.nextSibling;
        }
        return parameters;
    },
    
    _loadReturnValue: function(parent) {
        var returnValue = { };
        var node = parent.firstChild;
        while (node) {
            switch(node.nodeName) {
            case "type":
                returnValue.type = CoreDocViewer.DOM.getElementText(node);
                break;
            case "description":
                returnValue.description = CoreDocViewer.DOM.getElementText(node);
                break;
            case "shortDescription":
                returnValue.shortDescription = CoreDocViewer.DOM.getElementText(node);
                break;
            }
            node = node.nextSibling;
        }
        return returnValue;
    }
});

