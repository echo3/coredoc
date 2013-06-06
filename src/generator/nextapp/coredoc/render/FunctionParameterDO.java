package nextapp.coredoc.render;

import nextapp.coredoc.model.FieldBlock;

/**
 * Documentation rendering data object representing a function/method parameter.
 */
public class FunctionParameterDO {
    
    private FieldBlock.Parameter parameter;
    
    /**
     * Creates a new parameter data object.
     * 
     * @param parameter the {@link FieldBlock.Parameter} representing the parameter in the source model
     */
    public FunctionParameterDO(FieldBlock.Parameter parameter) {
        super();
        this.parameter = parameter;
    }
    
    /**
     * Returns a description of the parameter.
     * 
     * @return the description
     */
    public String getDescription() {
        return parameter.getDescription();
    }
    
    /**
     * Returns the name of the property.
     * 
     * @return the name
     */
    public String getName() {
        return parameter.getName();
    }
    
    /**
     * Returns the type of the property.
     * 
     * @return the type
     */
    public String getType() {
        return parameter.getType();
    }
}