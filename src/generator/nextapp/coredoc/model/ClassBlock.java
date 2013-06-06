package nextapp.coredoc.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * A representation of an instantiable class.
 */
public abstract class ClassBlock extends Block {

    /**
     * The super-class from which this class inherits.  Null in the event the class is derived from Object.
     */
    private ClassBlock superclass;
    
    /**
     * The sub-classes derived from this class.
     */
    private Set<ClassBlock> subclasses;
    
    /**
     * Creates a new <code>ClassBlock</code>.
     * 
     * @param module the containing source module
     * @param bounds the boundaries of the class definition within the source module
     */
    public ClassBlock(Module module, Bounds bounds) {
        super(module, bounds);
    }
    
    /**
     * Adds a subclass to the set of classes which derive from this class.
     * Sets the superclass property of the provided subclass to this object.
     * 
     * @param subclass the subclass to add
     */
    public void addSubclass(ClassBlock subclass) {
        if (subclasses == null) {
            subclasses = new HashSet<ClassBlock>();
        }
        subclasses.add(subclass);
        subclass.superclass = this;
    }
    
    private void findClasses(List<ClassBlock> classList, Node node) {
        if ((node.getModifiers() & Modifiers.CLASS) != 0) {
            classList.add((ClassBlock) node);
        }
        int count = node.getStructureChildCount();
        for (int i = 0; i < count; ++i) {
            Node childNode = node.getStructureChild(i);
            if ((childNode.getModifiers() & Modifiers.NAMESPACE) != 0) {
                // Entering new namespace.
                continue;
            }
            findClasses(classList, childNode);
        }
    }
    
    /**
     * Returns the number of subclasses in the source model which inherit from this class.
     * 
     * @return the number of subclasses
     */
    public int getSubclassCount() {
        return subclasses == null ? 0 : subclasses.size();
    }
    
    /**
     * Returns an iterator over the subclasses of this class.
     * 
     * @return the iterator
     */
    public Iterator<ClassBlock> getSubclasses() {
        if (subclasses == null) {
            return Collections.<ClassBlock>emptySet().iterator();
        } else {
            return Collections.unmodifiableSet(subclasses).iterator();
        }
    }
    
    /**
     * Returns the superclass of this class.
     * 
     * @return the superclass
     */
    public ClassBlock getSuperclass() {
        return superclass;
    }
    
    public ClassBlock[] getClasses() {
        List<ClassBlock> classList = new ArrayList<ClassBlock>();
        findClasses(classList, this);
        return classList.toArray(new ClassBlock[classList.size()]);
    }
    
    public Block getConstructor() {
        int count = getStructureChildCount();
        for (int i = 0; i < count; ++i) {
            if ((getStructureChild(i).getModifiers() & Modifiers.CONSTRUCTOR) != 0) {
                return getStructureChild(i);
            }
        }
        return null;
    }
    
    /**
     * Returns the modifiers applicable to this class.
     * 
     * @return the modifiers, as a bitset value
     * @see Modifiers
     */
    public int getModifiers() {
        int modifiers = 0;
        
        DocComment docComment = getDocComment();
        if (docComment != null) {
            if (docComment.getTags("@namespace") != null) {
                modifiers |= Modifiers.CLASS | Modifiers.NAMESPACE;
            } else {
                if (docComment.getTags("@class") != null) {
                    modifiers |= Modifiers.CLASS;
                }
            }
        }
        
        return modifiers;
    }
    
    public boolean isInstanceOf(String type) {
        ClassBlock testClass = this;
        while (testClass != null) {
            if (type.equals(testClass.getQualifiedName())) {
                return true;
            }
            testClass = testClass.superclass;
        }
        return false;
    }
}