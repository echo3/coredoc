package nextapp.coredoc.model;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.logging.Level;

import nextapp.coredoc.CoreDoc;

/**
 * The root node of the source/documentation model.  Represents the global JavaScript environment in which all objects are 
 * contained.
 */
public class Instance
implements Node {

    /** Mapping between {@link ClassBlock}s and their subclass {@link ClassBlock}s. */
    private Map<ClassBlock, Set<ClassBlock>> classToSubclasses = new HashMap<ClassBlock, Set<ClassBlock>>();
    
    /** Mapping between qualified class names and {@link ClassBlock}s. */
    private Map<String, ClassBlock> qualifiedNameToClass = new HashMap<String, ClassBlock>();
    
    private List<Block> children;
    private Map<String, Block> childMap;
    
    private Set<Module> modules;
    
    /**
     * Creates a new <code>Instance</code>.
     */
    public Instance() {
        super();
        modules = new HashSet<Module>();
    }
    
    public void addStructureChild(Block block) {
        if (block.getStructureParent() != null) {
            throw new IllegalArgumentException("Attempt to add block that already has its parent set: " + block);
        }
        block.setStructureParent(this);
        if (children == null) {
            children = new ArrayList<Block>();
            childMap = new HashMap<String, Block>();
        }
        children.add(block);
        childMap.put(block.getName(), block);
    }
    
    /**
     * Adds a {@link Module} to the Instance.
     * 
     * @param module the {@link Module} to add
     */
    public void addModule(Module module) {
        modules.add(module);
    }
    
    /**
     * Returns the {@link ClassBlock} with the specified fully qualified name.
     * 
     * @param qualifiedName the fully qualified class name
     * @return the {@link ClassBlock}, if available
     */
    public ClassBlock getClass(String qualifiedName) {
        return (ClassBlock) qualifiedNameToClass.get(qualifiedName);
    }
    
    /**
     * @see nextapp.coredoc.model.Node#getStructureChild(int)
     */
    public Block getStructureChild(int index) {
        if (children == null || index >= children.size()) {
            throw new IndexOutOfBoundsException(Integer.toString(index));
        }
        return (Block) children.get(index);
    }

    /**
     * @see nextapp.coredoc.model.Node#getStructureChild(java.lang.String)
     */
    public Block getStructureChild(String name) {
        return childMap == null ? null : (Block) childMap.get(name);
    }

    public int getStructureChildCount() {
        return children == null ? 0 : children.size();
    }
    
    /**
     * @see nextapp.coredoc.model.Node#getObjectChild(int)
     */
    public Block getObjectChild(int index) {
        if (children == null || index >= children.size()) {
            throw new IndexOutOfBoundsException(Integer.toString(index));
        }
        return (Block) children.get(index);
    }
    /**
     * @see nextapp.coredoc.model.Node#getObjectChildCount()
     */
    public int getObjectChildCount() {
        return children == null ? 0 : children.size();
    }
    
    /**
     * @see nextapp.coredoc.model.Node#getName()
     */
    public String getName() {
        return null;
    }
    
    /**
     * @see nextapp.coredoc.model.Node#getQualifiedName()
     */
    public String getQualifiedName() {
        return null;
    }
    
    private void findNamespaces(List<Node> namespaceList, Node node) {
        if ((node.getModifiers() & Modifiers.NAMESPACE) != 0) {
            namespaceList.add(node);
        }
        int count = node.getStructureChildCount();
        for (int i = 0; i < count; ++i) {
            findNamespaces(namespaceList, node.getStructureChild(i));
        }
    }
    
    public Node[] getNamespaces() {
        List<Node> namespaceList = new ArrayList<Node>();
        findNamespaces(namespaceList, this);
        return namespaceList.toArray(new Node[namespaceList.size()]);
    }
    
    private void findClasses(Set<ClassBlock> classes, Node node) {
        if ((node.getModifiers() & Modifiers.CLASS) != 0) {
            classes.add((ClassBlock) node);
        }
        int count = node.getObjectChildCount();
        for (int i = 0; i < count; ++i) {
            findClasses(classes, node.getObjectChild(i));
        }
    }
    
    public ClassBlock[] getClasses() {
        Set<ClassBlock> classSet = new TreeSet<ClassBlock>(new Comparator<ClassBlock>(){
        
            public int compare(ClassBlock a, ClassBlock b) {
                return a.getQualifiedName().compareTo(b.getQualifiedName());
            }
        });

        findClasses(classSet, this);
        return classSet.toArray(new ClassBlock[classSet.size()]);
    }
    
    /**
     * @see nextapp.coredoc.model.Node#getModifiers()
     */
    public int getModifiers() {
        return Modifiers.NAMESPACE;
    }
    
    /**
     * @see nextapp.coredoc.model.Node#process()
     */
    public void process() {
        CoreDoc.logger.log(Level.INFO, "Processing Instance.");
        int count = getStructureChildCount();
        for (int i = 0; i < count; ++i) {
            getStructureChild(i).process();
        }
    }
    
    public void registerClass(ClassBlock superclass, ClassBlock subclass) {
        qualifiedNameToClass.put(subclass.getQualifiedName(), subclass);
        Set<ClassBlock> subclasses = classToSubclasses.get(superclass);
        if (subclasses == null) {
            subclasses = new HashSet<ClassBlock>();
            classToSubclasses.put(superclass, subclasses);
        }
        subclasses.add(subclass);
    }
}
