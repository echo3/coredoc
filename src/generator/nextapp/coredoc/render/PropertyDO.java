package nextapp.coredoc.render;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import nextapp.coredoc.model.Block;
import nextapp.coredoc.model.DocComment;
import nextapp.coredoc.model.Modifiers;

/**
 * Documentation rendering data object representing an object property.
 */
public class PropertyDO {
    
    protected Block block;
    protected DocComment docComment;
    
    /**
     * Creates a new property data object.
     * 
     * @param block the {@link Block} representing the property in the source model
     */
    public PropertyDO(Block block) {
        this.block = block;
        docComment = block.getDocComment(); 
    }
    
    /**
     * Returns the property name.
     * 
     * @return the property name
     */
    public String getName() {
        if ((block.getModifiers() & Modifiers.CONSTRUCTOR) == 0) {
            return block.getName();
        } else {
            return block.getQualifiedName();
        }
    }
    
    /**
     * Returns a short description of the property.
     * 
     * @return the short description
     */
    public String getShortDescription() {
        return docComment == null || docComment.getShortDescription() == null ? "" : docComment.getShortDescription();
    }
    
    /**
     * Returns a description of the property.
     * 
     * @return the description
     */
    public String getDescription() {
        return docComment == null || docComment.getDescription() == null ? "" : docComment.getDescription();
    }
    
    /**
     * Returns modifiers present on the property.
     * 
     * @return the modifiers
     */
    public Iterator<String> getModifiers() {
        List<String> modifierList = new ArrayList<String>();
        int modifiers = block.getModifiers();
        if ((modifiers & Modifiers.INTERNAL) != 0) {
            modifierList.add("Internal");
        } else {
            modifierList.add("Public");
        }

        if ((modifiers & Modifiers.ABSTRACT) != 0) {
            modifierList.add("Abstract");
        } else if ((modifiers & Modifiers.VIRTUAL) != 0) {
            modifierList.add("Virtual");
        }
        return modifierList.iterator();
    }
}