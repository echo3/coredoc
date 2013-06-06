package nextapp.coredoc.model;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class FieldBlock extends Block {
    
    public class Parameter {
        
        private String name;
        private String type;
        private String description;
        
        private Parameter(String name, String type, String description) {
            super();
            this.name = name;
            this.type = type;
            this.description = description;
        }

        public String getName() {
            return name;
        }

        public String getType() {
            return type;
        }

        public String getDescription() {
            return description;
        }
    }

    private Parameter[] parameters;
    private String returnType;
    private String returnDescription;

    private boolean function;

    public FieldBlock(Module module, Bounds bounds) {
        this(module, bounds, false);
    }
    
    public FieldBlock(Module module, Bounds bounds, boolean function) {
        super(module, bounds);
        this.function = function;
    }
    
    public Parameter[] getParameters() {
        return parameters;
    }
    
    public String getReturnType() {
        return returnType;
    }
    
    public String getReturnDescription() {
        return returnDescription;
    }

    public boolean isFunction() {
        return function;
    }

    public void process() {
    }
    
    public void setDocComment(DocComment docComment) {
        super.setDocComment(docComment);

        Iterator<DocComment.Tag> functionIt = docComment.getTags("@function");
        if (functionIt != null) {
            function = true;
        }
        
        if (function) {
            Iterator<DocComment.Tag> paramIt = docComment.getTags("@param");
            if (paramIt != null) {
                List<Parameter> parameterList = new ArrayList<Parameter>();
                while(paramIt.hasNext()) {
                    DocComment.Tag tag = paramIt.next();
                    parameterList.add(new Parameter(DocComment.getParameterName(tag),
                            DocComment.getParameterType(tag), DocComment.getParameterDescription(tag)));
    
                }
                parameters = parameterList.toArray(new Parameter[parameterList.size()]);
            }
            
            Iterator<DocComment.Tag> returnIt = docComment.getTags("@return");
            if (returnIt != null) {
                returnDescription = returnIt.next().getText();
            }
        }
        
        Iterator<DocComment.Tag> typeIt = docComment.getTags("@type");
        if (typeIt != null) {
            returnType = typeIt.next().getText();
        }
    }
}
