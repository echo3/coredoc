CoreDocViewer.StyleSheet = new Echo.StyleSheet({
    "Box": {
        "Column": {
            border: {
                top: "1px solid #e7e7e7",
                left: "1px solid #e7e7e7",
                bottom: "1px solid #afafaf",
                right: "1px solid #afafaf"
            }
        }
    },
    "Box.Title": {
        "Component": {
            font: {
                size: "8pt"
            },
            layoutData: {
                insets: "3px 1em",
                background: "#efefef"
            }
        }
    },
    "Box.Content": {
        "Component": {
            insets: "3px 1em"
        }
    },
    "FindObject": {
        "CoreDocViewer.DropDown": {
            expandedBorder: "1px dashed #4f4fff",
            expandedBackground: "#cfcfff"
        },
        "Button": {
            insets: "0px 5px",
            focusedForeground: "#ffffff",
            focusedBackground: "#3939d6",
            focusedBackgroundImage: {
                url: "image/fill/GradientBlue.png",
                y: "50%"
            },
            focusedEnabled: true,
            rolloverForeground: "#ffffff",
            rolloverBackground: "#3939d6",
            rolloverBackgroundImage: {
                url: "image/fill/GradientBlue.png",
                y: "50%"
            },
            rolloverEnabled: true,
            pressedForeground: "#dfffff",
            pressedBackground: "#3939d6",
            pressedBackgroundImage: {
                url: "image/fill/GradientBlueHighlight.png",
                y: "50%"
            },
            pressedEnabled: true
        }
    },
    "ObjectButton": {
        "Button": {
            insets: "1px 5px",
            lineWrap: false,
            foreground: "#1f4f2f",
            rolloverForeground: "#ffffff",
            rolloverBackground: "#3939d6",
            rolloverBackgroundImage: {
                url: "image/fill/GradientBlue.png",
                y: "50%"
            },
            rolloverEnabled: true,
            pressedForeground: "#dfffff",
            pressedBackground: "#3939d6",
            pressedBackgroundImage: {
                url: "image/fill/GradientBlueHighlight.png",
                y: "50%"
            },
            pressedEnabled: true
        }
    },
    "ControlPane": {
        "Row": {
            layoutData: {
                backgroundImage: {
                    url: "image/fill/GradientWhiteSilver.png",
                    y: "50%"
                },
                overflow: Echo.SplitPane.OVERFLOW_HIDDEN
            },
            cellSpacing: 3,
            insets: "0px 9px"
        }
    },
    "ControlPane.Button": {
        "Button": {
            insets: "3px 15px",
            lineWrap: false,
            foreground: "#000000",
            rolloverForeground: "#ffffff",
            rolloverBackground: "#3939d6",
            rolloverBackgroundImage: {
                url: "image/fill/GradientBlue.png",
                y: "50%"
            },
            rolloverEnabled: true,
            pressedForeground: "#dfffff",
            pressedBackground: "#3939d6",
            pressedBackgroundImage: {
                url: "image/fill/GradientBlueHighlight.png",
                y: "50%"
            },
            pressedEnabled: true
        }
    },
    "Default": {
        "AbstractButton": {
            border: "1px outset #709bcd",
            foreground: "#000000",
            backgroundImage: {
                url: "image/fill/InputField.png",
                y: "50%"
            },
            pressedBackgroundImage: {
                url: "image/fill/InputFieldPressed.png",
                y: "50%"
            },
            pressedBorder: "1px inset #709bcd",
            rolloverBackgroundImage: {
                url: "image/fill/InputFieldHighlight.png",
                y: "50%"
            },
            rolloverBorder: "1px outset #bcd6f4",
            pressedEnabled: true,
            rolloverEnabled: true,
            insets: "1px 7px",
            disabledForeground: "#93bed5"
        },
        "AbstractListComponent": {
            border: "2px groove #cfdfff",
            background: "#cfdfff"
        },
        "Extras.AccordionPane": {
            animationTime: 0,
            tabBackground: "#dfdfef",
            tabBorder: {
                top: "1px solid #efefff",
                bottom: "1px solid #afafbf"
            },
            tabForeground: "#000000",
            tabFont: {
                size: "9pt"
            },
            tabRolloverEnabled: true,
            tabRolloverBackground: "#efefff"
        },
        "Extras.MenuBarPane": {
            animationTime: 150,
            menuOpacity: 90,
            background: "#cfcfd7",
            border: {
                top: "1px solid #dfdfe7",
                bottom: "1px solid #bfbfc7"
            },
            menuBorder: {
                left: "1px solid #dfdfe7",
                top: "1px solid #dfdfe7",
                right: "1px solid #bfbfc7",
                bottom: "1px solid #bfbfc7"
            },
            selectionBackgroundImage: "image/fill/ShadowBlueGrey.png"
        },
        "TextComponent": {
            background: "#cfdfff",
            border: "2px groove #cfdfff",
            backgroundImage: {
                url: "image/fill/InputField.png",
                repeat: "repeat-x",
                y: "50%"
            }
        },
        "WindowPane": {
            ieAlphaRenderBorder: true,
            titleForeground: "#ffffff",
            titleBackground: "#2f2f4f",
            titleInsets: "5px 10px",
            controlsInsets: "-1px 5px",
            closeIcon: "image/window/simple/ControlClose.png",
            closeRolloverIcon: "image/window/simple/ControlCloseRollover.png",
            maximizeIcon: "image/window/simple/ControlMaximize.png",
            maximizeRolloverIcon: "image/window/simple/ControlMaximizeRollover.png",
            minimizeIcon: "image/window/simple/ControlMinimize.png",
            minimizeRolloverIcon: "image/window/simple/ControlMinimizeRollover.png",
            titleBackgroundImage: {
                url: "image/window/simple/Header.png",
                repeat: "repeat-x",
                y: "50%"
            },
            border: {
                contentInsets: "8px 14px 14px 8px",
                borderInsets: "17px 23px 23px 17px",
                topLeft: "image/window/simple/BorderTopLeft.png",
                top: "image/window/simple/BorderTop.png",
                topRight: "image/window/simple/BorderTopRight.png",
                left: "image/window/simple/BorderLeft.png",
                right: "image/window/simple/BorderRight.png",
                bottomLeft: "image/window/simple/BorderBottomLeft.png",
                bottom: "image/window/simple/BorderBottom.png",
                bottomRight: "image/window/simple/BorderBottomRight.png"
            }
        }
    },
    "Default.Top.Surround": {
        "Extras.TabPane": {
            insets: 0,
            tabIconTextMargin: 3,
            tabCloseIconTextMargin: 8,
            background: "#ffffff",
            tabSpacing: -20,
            imageBorder: {
                contentInsets: "8px 14px 14px 8px",
                borderInsets: "17px 23px 23px 17px",
                topLeft: "image/window/simple/BorderTopLeft.png",
                top: "image/window/simple/BorderTop.png",
                topRight: "image/window/simple/BorderTopRight.png",
                left: "image/window/simple/BorderLeft.png",
                right: "image/window/simple/BorderRight.png",
                bottomLeft: "image/window/simple/BorderBottomLeft.png",
                bottom: "image/window/simple/BorderBottom.png",
                bottomRight: "image/window/simple/BorderBottomRight.png"
            },
            tabActiveBackground: "#ffffff",
            tabActiveBackgroundInsets: "8px 14px 0px 8px",
            tabActiveHeightIncrease: 3,
            tabActiveImageBorder: {
                contentInsets: "8px 14px 0px 8px",
                borderInsets: "17px 23px 0px 17px",
                topLeft: "image/window/simple/BorderTopLeft.png",
                top: "image/window/simple/BorderTop.png",
                topRight: "image/window/simple/BorderTopRight.png",
                left: "image/window/simple/BorderLeft.png",
                right: "image/window/simple/BorderRight.png",
                bottomLeft: null,
                bottom: null,
                bottomRight: null
            },
            tabActiveInsets: "4px 10px",
            tabInactiveBackground: "#e7e7e7",
            tabInactiveBackgroundInsets: "8px 14px 1px 8px",
            tabInactiveImageBorder: {
                contentInsets: "8px 14px 1px 8px",
                borderInsets: "17px 23px 1px 17px",
                topLeft: "image/window/simple/BorderTopLeft.png",
                top: "image/window/simple/BorderTop.png",
                topRight: "image/window/simple/BorderTopRight.png",
                left: "image/window/simple/BorderLeft.png",
                right: "image/window/simple/BorderRight.png",
                bottomLeft: null,
                bottom: null,
                bottomRight: null
            },
            tabInactiveBackgroundImage: {
                url: "image/fill/LightedSilver.png",
                repeat: "repeat-x",
                y: "53%"
            },
            tabInactiveInsets: "4px 10px",
            tabCloseIcon: "image/icon/Icon16TabClose.png",
            tabRolloverEnabled: true,
            tabRolloverForeground: "#ffffff",
            tabRolloverBackgroundImage: {
                url: "image/fill/GradientBlue.png",
                y: "50%"
            },
            tabRolloverCloseIcon: "image/icon/Icon16TabCloseRollover.png"
        }
    },
    "DefaultResizableLarge": {
        "SplitPane" : {
            separatorHeight: 12,
            separatorWidth: 12,
            resizable: true,
            separatorHorizontalImage: {
                url: "image/splitpane/SeparatorH12.png",
                y: "50%"
            },
            separatorHorizontalRolloverImage: {
                url: "image/splitpane/SeparatorH12Rollover.png",
                y: "50%"
            },
            separatorVerticalImage: {
                url: "image/splitpane/SeparatorV12.png",
                x: "50%"
            },
            separatorVerticalRolloverImage: {
                url: "image/splitpane/SeparatorV12Rollover.png",
                x: "50%"
            }
        }
    },
    "NamespaceView.ClassButton": {
        "Button": {
            insets: "1px 5px",
            lineWrap: false,
            foreground: "#000000",
            border: "1px solid #ffffff",
            rolloverBackground: "#afffaf",
            rolloverEnabled: true,
            rolloverBorder: "1px solid #9fef9f",
            pressedBackground: "#9fef9f",
            pressedBorder: "1px solid #8fdf8f",
            pressedEnabled: true
        }
    },
    "NamespaceView.SelectedClassButton": {
        "Button": {
            border: "1px solid #9f9fef",
            background: "#8f8fdf",
            insets: "1px 5px",
            lineWrap: false
        }
    },
    "ClassDisplay.Title": { 
        "Panel": {
            insets: "1ex 1em",
            background: "#fff4e7",
            border: "1px dashed #ffdfaf",
            font: {
                typeface: "serif",
                size: "13pt",
                italic: true
            }
        }
    },
    "TitlePanel": {
        "Panel": {
            alignment: "center",
            background: "#4f4f5f",
            foreground: "#ffffff",
            border: {
                top: "1px solid #5f5f6f",
                bottom: "1px solid #3f3f4f",
                left: null,
                right: null 
            },
            font: {
                bold: true,
                italic: true
            },
            insets: "1em 0px"
        }
    },
    "Layout.Bordered": {
        "Grid": {
            width: "100%",
            insets: "3px 8px",
            background: "#ffffff",
            border: "2px groove #7ea4d3"
        }
    },
    "Junior": {
        "Extras.ColorSelect": {
            hueWidth: 10,
            saturationHeight: 60,
            valueWidth: 60
        }
    },
    "PreferencesColumn": {
        "Column": {
            border: {
                left: "1px solid #afafaf",
                top: "1px solid #afafaf",
                right: "1px solid #dfdfdf",
                bottom: "1px solid #dfdfdf"
            },
            cellSpacing: 8,
            insets: "8px 20px"
        }
    },
    "PreferencesTitle": {
        "Label": {
            foreground: "#2f2faf",
            font: { bold: true }
        }
    },
    
    "Toolbar": {
        "Panel": {
            background: "#efefef",
            border: {
                top: "1px solid #f3f3f3",
                bottom: "1px solid #dfdfdf",
                left: null,
                right: null
            },
            insets: "2px 10px"
        }
    },
    "FieldModifier.Override": {
        "Panel": {
            border: "1px solid #dfdfaf",
            background: "#fffffef",
            font: {
                typeface: "monospace",
                size: "8pt"
            },
            insets: "1px 8px"
        }
    },
    "FieldModifier.Inherited": {
        "Panel": {
            border: "1px solid #afafdf",
            background: "#efefff",
            font: {
                typeface: "monospace",
                size: "8pt"
            },
            insets: "1px 8px"
        }
    },
    "FieldModifier.Virtual": {
        "Panel": {
            border: "1px solid #afdfaf",
            background: "#efffef",
            font: {
                typeface: "monospace",
                size: "8pt"
            },
            insets: "1px 8px"
        }
    },
    "FieldModifier.Abstract": {
        "Panel": {
            border: "1px solid #dfafdf",
            background: "#ffefff",
            font: {
                typeface: "monospace",
                size: "8pt"
            },
            insets: "1px 8px"
        }
    },
    "FieldModifier.Internal": {
        "Panel": {
            border: "1px solid #dfafaf",
            background: "#ffefef",
            font: {
                typeface: "monospace",
                size: "8pt"
            },
            insets: "1px 8px"
        }
    }
});
