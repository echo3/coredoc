package nextapp.coredoc.model;

/**
 * A representation of the boundaries of an object/method/brace block within a module source file.
 */
public class Bounds 
implements Comparable {
    
    /** Index of closing brace of bounds. */
    private int closeIndex = -1;

    /** Index of opening brace of bounds. */
    private int openIndex = -1;
    
    /** The containing Bounds instance. */
    private Bounds parent = null;

    /** The start index of the block boundary. */
    private int startIndex = -1;
    
    /** The start index of the block's documentation comment. */
    private int docStartIndex = -1;
    
    /**
     * Creates a new Bounds instance.
     * 
     * @param parent the parent bounds
     * @param openIndex the start index
     * @param closeIndex the end index
     */
    public Bounds(Bounds parent, int openIndex, int closeIndex) {
        super();
        this.parent = parent;
        this.openIndex = openIndex;
        this.closeIndex = closeIndex;
        this.startIndex = openIndex;
    }
    
    /**
     * Compares start indices.
     * @see java.lang.Comparable#compareTo(T)
     */
    public int compareTo(Object o) {
        Bounds that = (Bounds) o;
        return this.startIndex - that.startIndex;
    }

    /**
     * Returns the index of the closing brace.
     * 
     * @return the index of the closing brace
     */
    public int getCloseIndex() {
        return closeIndex;
    }
    
    /**
     * Returns the start index of the bounds' documentation comment, if available.
     * Otherwise returns the bounds' start index.
     * 
     * @return the documentation comment start index
     */
    public int getDocStartIndex() {
        return docStartIndex == -1 ? startIndex : docStartIndex;
    }
    
    /**
     * Returns the index of the opening brace.
     * 
     * @return the index of the opening brace
     */
    public int getOpenIndex() {
        return openIndex;
    }
    
    /**
     * Returns the parent bounds.
     * 
     * @return the parent bounds
     */
    public Bounds getParent() {
        return parent;
    }

    /**
     * Returns the start index.
     * 
     * @return the start index
     */
    public int getStartIndex() {
        return startIndex;
    }

    /** 
     * Sets the close index.
     * 
     * @param endIndex the close index
     */
    public void setCloseIndex(int closeIndex) {
        this.closeIndex = closeIndex;
    }
    
    /**
     * Sets the bounds' documentation start index.
     * 
     * @param docStartIndex the new documentation start index
     */
    public void setDocStartIndex(int docStartIndex) {
        this.docStartIndex = docStartIndex;
    }

    /** 
     * Sets the start index
     * 
     * @param startIndex the new start index
     */
    public void setStartIndex(int startIndex) {
        this.startIndex = startIndex;
    }

    /**
     * @see java.lang.Object#toString()
     */
    public String toString() {
        return "Bounds: s:" + startIndex + " {:" + openIndex + " }:" + closeIndex;
    }
}
