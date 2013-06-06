package nextapp.coredoc.model;

public interface Node {

    public Block getStructureChild(String name);
    
    public Block getStructureChild(int index);
    
    /**
     * Returns the number of children structurally contained within the block.
     */
    public int getStructureChildCount();
    
    /**
     * Returns the object child at the specified index.
     */
    public Block getObjectChild(int index);
    
    public int getObjectChildCount();
    
    public String getName();
    
    public String getQualifiedName();
    
    public int getModifiers();
    
    public void process();
}
