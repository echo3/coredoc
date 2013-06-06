package nextapp.coredoc.render;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.logging.Level;

import nextapp.coredoc.CoreDoc;
import nextapp.coredoc.model.Block;
import nextapp.coredoc.model.ClassBlock;
import nextapp.coredoc.model.DocComment;
import nextapp.coredoc.model.FieldBlock;
import nextapp.coredoc.model.Modifiers;

/**
 * Documentation rendering data object representing an instantiable class.
 */
public class ClassDO {
    
    private ClassBlock classBlock;
    private List<PropertyDO> classFields = new ArrayList<PropertyDO>();
    private List<FunctionDO> classMethods = new ArrayList<FunctionDO>();
    private List<PropertyDO> classProperties = new ArrayList<PropertyDO>();
    private PropertyDO constructor;
    private Set<String> descendantClasses = new TreeSet<String>();
    private List<PropertyDO> instanceFields = new ArrayList<PropertyDO>();
    private List<FunctionDO> instanceMethods = new ArrayList<FunctionDO>();
    private List<PropertyDO> instanceProperties = new ArrayList<PropertyDO>();
    private String qualifiedName;
    private Renderer renderer;
    
    /**
     * Creates a new <code>ClassDO</code>
     * 
     * @param renderer the {@link Renderer} being used to render the documentation
     * @param classBlock the {@link ClassBlock} representing the class in the source model
     */
    public ClassDO(Renderer renderer, ClassBlock classBlock) {
        super();
        
        this.renderer = renderer;
        this.classBlock = classBlock;
        qualifiedName = classBlock.getQualifiedName();
        int childCount = classBlock.getObjectChildCount();
        
        CoreDoc.logger.log(Level.INFO, "Processing: " + qualifiedName);
        
        for (int i = 0; i < childCount; ++i) {
            Block childBlock = classBlock.getObjectChild(i);
            if (childBlock instanceof FieldBlock) {
                FieldBlock fieldBlock = (FieldBlock) childBlock;
                if (fieldBlock.isFunction()) {
                    if ((childBlock.getModifiers() & Modifiers.CONSTRUCTOR) != 0) {
                        constructor = new FunctionDO(fieldBlock);
                    } else if ((childBlock.getModifiers() & Modifiers.PROTOTYPE_PROPERTY) != 0) {
                        instanceMethods.add(new FunctionDO(fieldBlock));
                    } else {
                        classMethods.add(new FunctionDO(fieldBlock));
                    }
                } else {
                    if ((childBlock.getModifiers() & Modifiers.PROTOTYPE_PROPERTY) != 0) {
                        instanceFields.add(new PropertyDO(fieldBlock));
                    } else {
                        classFields.add(new PropertyDO(fieldBlock));
                    }
                }
            }
        }
        
        ClassBlock[] classes = classBlock.getClasses();
        descendantClasses = new TreeSet<String>();
        for (int i = 0; i < classes.length; ++i) {
            if (!qualifiedName.equals(classes[i].getQualifiedName())) {
                descendantClasses.add(classes[i].getQualifiedName());
            }
        }        
    }
    
    /**
     * Returns rendering data objects representing the class fields of the class.
     * 
     * @return the class field rendering data objects
     */
    public Iterator<PropertyDO> getClassFields() {
        return classFields.size() == 0 ? null : classFields.iterator();
    }
    
    public Iterator<ClassBlock> getClassHierarchy(boolean reverse, boolean includeSelf) {
        List<ClassBlock> hierarchy = new ArrayList<ClassBlock>();
        ClassBlock searchClassBlock = classBlock;
        if (!includeSelf) {
            searchClassBlock = searchClassBlock.getSuperclass();
        }
        while (searchClassBlock != null) {
            if (reverse) {
                hierarchy.add(searchClassBlock);
            } else {
                hierarchy.add(0, searchClassBlock);
            }
            searchClassBlock = searchClassBlock.getSuperclass();
        }
        return hierarchy.iterator();
    }
    
    /**
     * Returns rendering data objects representing the class methods of the class.
     * 
     * @return the class method rendering data objects
     */
    public Iterator<FunctionDO> getClassMethods() {
        return classMethods.size() == 0 ? null : classMethods.iterator();
    }
    
    public Iterator<PropertyDO> getClassProperties() {
        return classProperties.size() == 0 ? null : classProperties.iterator();
    }
    
    /**
     * Returns the constructor rendering data object.
     * 
     * @return the constructor rendering data object
     */
    public PropertyDO getConstructor() {
        return constructor;
    }
    
    public Iterator<String> getCustomSummaryBlocks() 
    throws Exception {
        DocComment docComment = classBlock.getDocComment();
        if (docComment == null) {
            return null;
        }
        
        List<String> customSummaryBlocks = null;
        
        Iterator<String> tagRenderNameIt = renderer.getTagRenderNames();
        while (tagRenderNameIt.hasNext()) {
            String tagRenderName = tagRenderNameIt.next();
            CustomTagRender tagRender = renderer.getTagRender(tagRenderName);
            String requiredType = tagRender.getRequiredType();
            if (requiredType != null && !classBlock.isInstanceOf(requiredType)) {
                // Class does not meet required type specification.
                continue;
            }
            
            Iterator tagIt = docComment.getTags("@" + tagRenderName);
            if (tagIt == null) {
                // No instances of the custom tag found in doc comment.
                continue;
            }
            
            if (customSummaryBlocks == null) {
                customSummaryBlocks = new ArrayList<String>();
            }
            
            StringWriter sw = new StringWriter();
            tagRender.render(classBlock, sw);
            sw.flush();
            
            customSummaryBlocks.add(sw.toString());
        }
        
        return customSummaryBlocks == null ? null : customSummaryBlocks.iterator();
    }
    
    public Iterator<String> getDescendantClasses() {
        return descendantClasses.iterator();
    }
    
    public int getEndIndex() {
        return classBlock.getBounds().getCloseIndex();
    }
    
    /**
     * Returns rendering data objects representing the instance fields of the class.
     * 
     * @return the instance field rendering data objects
     */
    public Iterator<PropertyDO> getInstanceFields() {
        return instanceFields.size() == 0 ? null : instanceFields.iterator();
    }
    
    public int getInstanceMethodCount() {
        return instanceMethods.size();
    }
    
    public int getInstanceMethodCount(ClassBlock classBlock) {
        ClassDO cr = renderer.getClassRender(classBlock);
        return cr.getInstanceMethodCount();
    }
    
    public Iterator<FunctionDO> getInstanceMethods() {
        return instanceMethods.size() == 0 ? null : instanceMethods.iterator();
    }
    
    public Iterator<FunctionDO> getInstanceMethods(ClassBlock classBlock) {
        ClassDO cr = renderer.getClassRender(classBlock);
        return cr.getInstanceMethods();
    }
    
    public Iterator<PropertyDO> getInstanceProperties() {
        return instanceProperties.size() == 0 ? null : instanceProperties.iterator();
    }
    
    public int getStartIndex() {
        return classBlock.getBounds().getDocStartIndex();
    }
    
    public int getSubclassCount() {
        return classBlock.getSubclassCount();
    }
    
    public Iterator<ClassBlock> getSubclasses() {
        Set<ClassBlock> sortedSet = new TreeSet<ClassBlock>(new Comparator<ClassBlock>() {
            public int compare(ClassBlock a, ClassBlock b) {
                return a.getQualifiedName().compareTo(b.getQualifiedName());
            }
        });
        Iterator<ClassBlock> it = classBlock.getSubclasses();
        while (it.hasNext()) {
            sortedSet.add(it.next());
        }
        return sortedSet.iterator();
    }
    
    public ClassBlock getSuperclass() {
        return classBlock.getSuperclass();
    }
    
    public boolean hasDescendantClasses() {
        return descendantClasses.size() > 0;
    }
}
