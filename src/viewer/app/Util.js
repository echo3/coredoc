CoreDocViewer.DropDown = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("CoreDocViewer.DropDown", this);
    },

    componentType: "CoreDocViewer.DropDown"
});

CoreDocViewer.DropDownSync = Core.extend({

    _div: null,
    _expandedDiv: null,
    _expandedContentDiv: null,
    
    $load: function() {
        Echo.Render.registerPeer("CoreDocViewer.DropDown", this);
    },
    
    clientKeyDown: function(e) {
        if (e.keyCode == 27) {
            this.component.set("expanded", false);
        }
    },
    
    _dropDownShow: function() {
        if (this._expandedDiv) {
            return;
        }
        this._expandedDiv = document.createElement("div");
        this._expandedDiv.style.cssText = "position:absolute;min-width:15em;";
        Echo.Sync.Border.render(this.component.render("expandedBorder", "1px outset #afafaf"), this._expandedDiv);
        Echo.Sync.Color.render(this.component.render("expandedBackground", "#ffffff"), this._expandedDiv, "backgroundColor");
        Echo.Sync.Color.render(this.component.render("expandedForeground"), this._expandedDiv, "color");
        Echo.Sync.Insets.render(this.component.render("expandedInsets", 3), this._expandedDiv, "padding");
        
        var bounds = new Core.Web.Measure.Bounds(this._div);
        this._expandedDiv.style.top = (bounds.top + bounds.height) + "px";
        this._expandedDiv.style.left = bounds.left + "px";
        if (this._expandedContentDiv) {
            this._expandedDiv.appendChild(this._expandedContentDiv);
        }
        this.client.domainElement.appendChild(this._expandedDiv);
    },
    
    _dropDownHide: function() {
        if (!this._expandedDiv) {
            return;
        }
        if (this._expandedContentDiv) {
            this._expandedDiv.removeChild(this._expandedContentDiv);
        }
        this._expandedDiv.parentNode.removeChild(this._expandedDiv);
        this._expandedDiv = null;
    },
    
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        
        if (this.component.children.length > 0) {
            var childDiv = document.createElement("div");
            Echo.Render.renderComponentAdd(update, this.component.children[0], this._div);
            this._div.appendChild(childDiv);
        }
        
        if (this.component.children.length > 1) {
            this._expandedContentDiv = document.createElement("div");
            Echo.Render.renderComponentAdd(update, this.component.children[1], this._expandedContentDiv);
        }
        
        parentElement.appendChild(this._div);
    },

    renderDispose: function(update) {
        this._dropDownHide();
        this._expandedContentDiv = null;
        this._div = null;
    },
    
    renderUpdate: function(update) {
        if (update.isUpdatedPropertySetIn({expanded: true}) && !update.hasAddedChildren() && !update.hasRemovedChildren()) {
            if (update.getUpdatedProperty("expanded") != null) {
                var expanded = this.component.get("expanded");
                if (expanded) {
                    this._dropDownShow();
                } else {
                    this._dropDownHide();
                }
                return;
            }
        }
        
        var element = this._div;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

CoreDocViewer.ScrollPoint = Core.extend(Echo.Button, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("CoreDocViewer.ScrollPoint", this);
    },

    componentType: "CoreDocViewer.ScrollPoint",
    
    scrollIntoView: function() {
        this.fireEvent({source: this, type: "scrollIntoView"});
    }
});

CoreDocViewer.ScrollPointSync = Core.extend({

    $load: function() {
        Echo.Render.registerPeer("CoreDocViewer.ScrollPoint", this);
    },
    
    _processScrollIntoViewRef: null,
    
    $construct: function() {
        this._processScrollIntoViewRef = Core.method(this, this._processScrollIntoView);
    },

    _processScrollIntoView: function(e) {
        if (this._div.scrollIntoView) {
            this._div.scrollIntoView();
        } else {
            this._div.focus();
        }
    },
    
    renderAdd: function(update, parentElement) {
        this.component.addListener("scrollIntoView", this._processScrollIntoViewRef);
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.tabIndex = 0;
        parentElement.appendChild(this._div);
    },

    renderDispose: function(update) {
        this.component.removeListener("scrollIntoView", this._processScrollIntoViewRef);
        this._div = null;
    },
    
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

/**
 * Color selection button widget.  Colored button launches a color select window when clicked.
 */
CoreDocViewer.ColorSelectButton = Core.extend(Echo.Button, {

    _msg: null,
    _color: null,
    _window: null,
    _colorSelect: null,

    $construct: function(color) {
        this._msg = CoreDocViewer.getMessages();
        this.color = color ? color : "#000000";
        Echo.Button.call(this, {
            width: 50,
            height: 20,
            border: "1px outset " + this.color,
            background: this.color,
            events: {
                action: Core.method(this, this._processAction)
            }
        });
    },
    
    _apply: function(e) {
        this.color = this._colorSelect.get("color");
        this.set("border", "1px outset " + this.color);
        this.set("background", this.color);
        this._window.parent.remove(this._window);
        this._window = null;
        this._colorSelect = null;
    },
    
    _close: function(e) {
        this._window.parent.remove(this._window);
        this._window = null;
        this._colorSelect = null;
    },
    
    _processAction: function() {
        var contentPane = this;
        while (!(contentPane instanceof Echo.ContentPane)) {
            contentPane = contentPane.parent;
        }
        
        this._window = new Echo.WindowPane({
            styleName: "Default",
            title: "Select Color",
            width: 220,
            height: 260,
            modal: true,
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
                        this._colorSelect = new Extras.ColorSelect({
                            layoutData: {
                                insets: "5px 10px"
                            },
                            color: this.color,
                            hueWidth: 16,
                            saturationHeight: 128,
                            valueWidth: 128
                        })
                    ]
                })
            ]
        });
        
        contentPane.add(this._window);
    }
});

CoreDocViewer.Flow = Core.extend(Echo.Component, {
    $load: function() {
        Echo.ComponentFactory.registerType("CoreDocViewer.Flow", this);
    },

    componentType: "CoreDocViewer.Flow"
});

/**
 * Synchronization peer for Flow component.
 */
CoreDocViewer.FlowSync = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("CoreDocViewer.Flow", this);
    },

    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        Echo.Sync.Font.render(this.component.render("font"), this._div);
        Echo.Sync.Color.renderFB(this.component, this._div);
        for (var i = 0; i < this.component.children.length; ++i) {
            var childDiv = document.createElement("div");
            childDiv.style.cssText = "float:left;";
            Echo.Sync.Extent.render(this.component.render("cellSpacing"), childDiv, "paddingRight");
            Echo.Render.renderComponentAdd(update, this.component.children[i], childDiv);
            this._div.appendChild(childDiv);
        }
        var clearDiv = document.createElement("div");
        clearDiv.style.clear = "both";
        this._div.appendChild(clearDiv);
        parentElement.appendChild(this._div);
    },

    renderDispose: function(update) {
        this._div = null;
    },
    
    renderUpdate: function(update) {
        var element = this._spanElement;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

/**
 * Label component which renders arbitrary HTML.
 */
CoreDocViewer.HtmlLabel = Core.extend(Echo.Component, {
    componentType: "CoreDocViewer.HtmlLabel"
});

/**
 * Synchronization peer for HtmlLabel component.
 */
CoreDocViewer.HtmlLabelSync = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("CoreDocViewer.HtmlLabel", this);
    },

    renderAdd: function(update, parentElement) {
        this._spanElement = document.createElement("span");
        Echo.Sync.Font.render(this.component.render("font"), this._spanElement);
        Echo.Sync.Color.renderFB(this.component, this._spanElement);
        this._spanElement.innerHTML = this.component.render("html", "");
        parentElement.appendChild(this._spanElement);
    },

    renderDispose: function(update) {
        this._spanElement = null;
    },
    
    renderUpdate: function(update) {
        var element = this._spanElement;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false; // Child elements not supported: safe to return false.
    }
});

/**
 * IFrame Container Pane
 */
CoreDocViewer.IFrame = Core.extend(Echo.Component, {
    componentType: "CoreDocViewer.IFrame"
});

/**
 * Synchronization peer for IFrame Container Pane component.
 */
CoreDocViewer.IFrameSync = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("CoreDocViewer.IFrame", this);
    },

    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;";
        this._iframe = document.createElement("iframe");
        this._iframe.src = this.component.get("url");
        this._iframe.frameBorder = 0;
        this._div.appendChild(this._iframe);
        parentElement.appendChild(this._div);
    },

    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._div);
        var bounds = new Core.Web.Measure.Bounds(this._div);
        this._iframe.style.width = bounds.width + "px";
        this._iframe.style.height = bounds.height + "px";
    },
    
    renderDispose: function(update) {
        this._iframe = null;
    },
    
    renderUpdate: function(update) {
        var element = this._iframe;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false; // Child elements not supported: safe to return false.
    }
});

CoreDocViewer.DOM = {

    getPropertyElementValue: function(parentElement, childElementName) {
        if (parentElement == null) {
            return null;
        }
        var node = parentElement.firstChild;
        while (node) {
            if (node.nodeName == childElementName) {
                node = node.firstChild;
                var value = "";
                while (node) {
                    if (node.nodeType == 3 || node.nodeType == 4) { // Text
                        value += node.nodeValue;
                    }
                    node = node.nextSibling;
                }
                return value == "" ? null : value;
            }
            node = node.nextSibling;
        }
        return null;
    },

    getElementText: function(element) {
        var node = element.firstChild;
        var value = "";
        while (node) {
            if (node.nodeType == 3 || node.nodeType == 4) { // Text
                value += node.nodeValue;
            }
            node = node.nextSibling;
        }
        return value == "" ? null : value;
    }
};

/**
 * Utility methods.
 */
CoreDocViewer.Util = {

    _LEADING_SPACES: /^(\s*)/,
    _TRAILING_SPACES: /(\s*)$/,
    _BLOCK_COMMENT_START: /^\/\*/,
    _BLOCK_COMMENT_END: /\*\//,
    _LINE_COMMENT: /^\/\//,
    BLANK_LINE: /^\s*$/,

    /**
     * Determiens the number of leading spaces in a string.
     *
     * @param s the string to evaluate
     * @return the number of leading spaces
     * @type Number
     */
    countLeadingSpaces: function(s) {
        return this._LEADING_SPACES.exec(s)[1].length;
    },

    /**
     * Determiens the number of trailing spaces in a string.
     *
     * @param s the string to evaluate
     * @return the number of trailing spaces
     * @type Number
     */
    countTrailingSpaces: function(s) {
        return this._TRAILING_SPACES.exec(s)[1].length;
    },

    /**
     * Returns a random item from an array.
     *
     * @param array the array to evaluate
     * @return a random item
     */
    randomItem: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Trims leading and trailing spaces from a string.
     *
     * @param s the string to evaluate
     * @return the string with no leading/trailing spaces
     */
    trim: function(s) {
        var leading = this._LEADING_SPACES.exec(s)[1].length;
        var trailing = this._TRAILING_SPACES.exec(s)[1].length;
        return s.substring(leading);
    }
};

