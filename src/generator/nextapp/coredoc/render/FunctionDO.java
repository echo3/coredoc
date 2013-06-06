package nextapp.coredoc.render;

import java.util.Iterator;

import nextapp.coredoc.model.FieldBlock;
import nextapp.coredoc.model.FieldBlock.Parameter;

/**
 * Documentation rendering data object representing a function/method.
 */
public class FunctionDO extends PropertyDO {

    /**
     * Creates a new function data object.
     * 
     * @param functionBlock the {@link FieldBlock} representing the function in the source model
     */
    public FunctionDO(FieldBlock functionBlock) {
        super(functionBlock);
        if (!functionBlock.isFunction()) {
            throw new IllegalArgumentException("Specified FieldBlock is not a function: " + functionBlock);
        }
    }
    
    /**
     * Determines if the function returns a value.
     * 
     * @return true if the function returns a value
     */
    public boolean hasReturnValue() {
        return ((FieldBlock) block).getReturnDescription() != null
               || ((FieldBlock) block).getReturnType() != null;
    }
    
    /**
     * Retrieves the return type of the function.
     * 
     * @return the return type
     */
    public String getReturnType() {
        return ((FieldBlock) block).getReturnType();
    }
    
    /**
     * Returns descriptive information about the return value.
     * 
     * @return the return description
     */
    public String getReturnDescription() {
        return ((FieldBlock) block).getReturnDescription();
    }
    
    /**
     * Determines if the function has defined parameters.
     * 
     * @return true if the function has defined parameters
     */
    public boolean hasParameters() {
        return ((FieldBlock) block).getParameters() != null;
    }
    
    /**
     * Returns the function parameters.
     * 
     * @return the function parameters
     */
    public Iterator<FunctionParameterDO> getParameters() {
        FieldBlock functionBlock = (FieldBlock) block;
        final Parameter[] parameters = functionBlock.getParameters();
        if (parameters == null) {
            return null;
        } else {
            return new Iterator<FunctionParameterDO>() {
                private int i = 0;
                
                public boolean hasNext() {
                    return i < parameters.length;
                }
                
                public FunctionParameterDO next() {
                    return new FunctionParameterDO(parameters[i++]);
                }
                
                public void remove() {
                    throw new UnsupportedOperationException();
                }
            };
        }
    }
}